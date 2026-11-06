import fs from "node:fs";
import path from "node:path";
import {
  BUILD_MARKERS,
  IGNORED_DIRS,
  sensitiveFile,
  sourceLanguage,
  declaredNativeLanguages,
} from "./evidence.js";
import type {
  Inspection,
  InspectOptions,
  Project,
  LanguageId,
} from "./types.js";

const within = (root: string, target: string): boolean => {
  const relative = path.relative(root, target);
  return (
    !path.isAbsolute(relative) &&
    relative !== ".." &&
    !relative.startsWith(`..${path.sep}`)
  );
};
export function inspectProject(options: InspectOptions): Inspection {
  const maxDepth = options.maxDepth ?? 12,
    maxEntries = options.maxEntries ?? 10000;
  if (
    !Number.isInteger(maxDepth) ||
    maxDepth < 0 ||
    maxDepth > 64 ||
    !Number.isInteger(maxEntries) ||
    maxEntries < 1 ||
    maxEntries > 1000000
  )
    throw new Error("扫描参数非法");
  const declaredRoot = path.resolve(options.workspace),
    workspace = fs.realpathSync(declaredRoot);
  if (!fs.statSync(workspace).isDirectory())
    throw new Error("工作区必须是目录");
  let task: string | undefined;
  if (options.taskPath) {
    const lexical = path.resolve(declaredRoot, options.taskPath);
    if (!within(declaredRoot, lexical))
      throw new Error("任务路径越过工作区边界");
    task = path.resolve(workspace, path.relative(declaredRoot, lexical));
    let current = task;
    while (current !== workspace) {
      try {
        if (fs.lstatSync(current).isSymbolicLink())
          throw new Error("任务路径包含链接，无法确认工作区边界");
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
      }
      current = path.dirname(current);
    }
  }
  const report: Inspection = {
    schemaVersion: 1,
    workspace,
    projects: [],
    warnings: [],
    truncated: false,
  };
  const files: string[] = [];
  let entries = 0;
  const warn = (message: string, truncate = false): void => {
    report.warnings.push(message);
    if (truncate) report.truncated = true;
  };
  function visit(directory: string, depth: number): void {
    if (entries >= maxEntries) {
      warn("达到扫描数量上限，结果不完整", true);
      return;
    }
    if (depth > maxDepth) {
      warn(`达到扫描深度上限：${path.relative(workspace, directory)}`, true);
      return;
    }
    let handle: fs.Dir;
    try {
      handle = fs.opendirSync(directory);
    } catch {
      warn(`无法读取目录：${path.relative(workspace, directory)}`, true);
      return;
    }
    try {
      let entry: fs.Dirent | null;
      while ((entry = handle.readSync()) !== null) {
        if (++entries > maxEntries) {
          warn("达到扫描数量上限，结果不完整", true);
          break;
        }
        const file = path.join(directory, entry.name);
        if (entry.isSymbolicLink()) continue;
        if (entry.isDirectory()) {
          if (!IGNORED_DIRS.has(entry.name) && !entry.name.startsWith(".ssh"))
            visit(file, depth + 1);
        } else if (
          entry.isFile() &&
          !sensitiveFile(entry.name) &&
          (Object.hasOwn(BUILD_MARKERS, entry.name) ||
            sourceLanguage(entry.name))
        )
          files.push(file);
      }
    } finally {
      handle.closeSync();
    }
  }
  visit(workspace, 0);
  const roots = new Map<string, Project>();
  function ensure(root: string): Project {
    let project = roots.get(root);
    if (!project) {
      project = {
        root,
        languages: [],
        evidence: [],
        buildFiles: [],
        ambiguous: false,
      };
      roots.set(root, project);
    }
    return project;
  }
  const addLanguage = (project: Project, language: LanguageId): void => {
    if (!project.languages.includes(language)) project.languages.push(language);
  };
  for (const file of files.sort()) {
    const marker = BUILD_MARKERS[path.basename(file)];
    if (!marker) continue;
    const project = ensure(path.dirname(file)),
      relative = path.relative(workspace, file).split(path.sep).join("/");
    project.buildFiles.push(relative);
    project.evidence.push(relative);
    for (const language of marker) addLanguage(project, language);
    if (path.basename(file) === "CMakeLists.txt") {
      try {
        if (fs.statSync(file).size > 262144) {
          warn(`清单过大，未读取：${relative}`);
          continue;
        }
        for (const language of declaredNativeLanguages(
          fs.readFileSync(file, "utf8"),
        ))
          addLanguage(project, language);
      } catch {
        warn(`清单无法读取：${relative}`, true);
      }
    }
  }
  for (const file of files) {
    const language = sourceLanguage(file);
    if (!language) continue;
    const candidates = [...roots.keys()]
      .filter((root) => within(root, file))
      .sort((a, b) => b.length - a.length);
    const project = ensure(candidates[0] ?? workspace);
    addLanguage(project, language);
    project.evidence.push(
      path.relative(workspace, file).split(path.sep).join("/"),
    );
  }
  report.projects = [...roots.values()]
    .map((project) => ({
      ...project,
      languages: project.languages.sort(),
      evidence: [...new Set(project.evidence)].sort(),
      buildFiles: project.buildFiles.sort(),
      ambiguous: !project.languages.length || !project.buildFiles.length,
    }))
    .sort((a, b) => a.root.localeCompare(b.root, "en"));
  if (task) {
    const closest = report.projects
      .filter((project) => within(project.root, task!))
      .sort((a, b) => b.root.length - a.root.length)[0];
    report.projects = closest ? [closest] : [];
    if (!closest) warn("任务路径没有可确认的项目根");
  }
  report.warnings = [...new Set(report.warnings)];
  return report;
}
