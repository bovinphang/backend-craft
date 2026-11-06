import type { LanguageId, StageSpec } from "./types.js";
import fs from "node:fs";
import path from "node:path";
import { resolveProjectPath } from "./paths.js";
export interface ProjectConfig {
  schemaVersion: 1;
  enableIntegration: boolean;
  projects: Array<{
    root: string;
    languages?: LanguageId[];
    stages: StageSpec[];
  }>;
}
const object = (
  value: unknown,
  allowed: string[],
  label: string,
): Record<string, unknown> => {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error(`配置${label}必须是对象`);
  const result = value as Record<string, unknown>;
  if (Object.keys(result).some((key) => !allowed.includes(key)))
    throw new Error(`配置${label}含未知字段`);
  return result;
};
const text = (value: unknown, label: string): string => {
  if (typeof value !== "string" || !value.trim() || value.includes("\0"))
    throw new Error(`配置${label}必须是非空字符串`);
  return value;
};
const flag = (value: unknown, fallback: boolean, label: string): boolean => {
  if (value === undefined) return fallback;
  if (typeof value !== "boolean") throw new Error(`配置${label}必须是布尔值`);
  return value;
};
export function readProjectConfig(
  workspace: string,
): ProjectConfig | undefined {
  const file = resolveProjectPath(workspace, ".backend-craft.json", false);
  if (!fs.existsSync(file)) return undefined;
  if (fs.statSync(file).size > 262144) throw new Error("配置文件过大");
  let raw: unknown;
  try {
    raw = JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    throw new Error("配置文件不是有效 JSON");
  }
  const data = object(
    raw,
    ["schemaVersion", "enableIntegration", "projects"],
    "根",
  );
  if (
    data.schemaVersion !== 1 ||
    !Array.isArray(data.projects) ||
    !data.projects.length
  )
    throw new Error("配置版本或项目列表无效");
  const ids = new Set<string>(),
    roots = new Set<string>();
  const projects = data.projects.map((value) => {
    const project = object(value, ["root", "languages", "stages"], "项目"),
      root = resolveProjectPath(workspace, text(project.root, "项目根"));
    if (!fs.statSync(root).isDirectory())
      throw new Error("配置项目根必须是目录");
    const key = process.platform === "win32" ? root.toLowerCase() : root;
    if (roots.has(key)) throw new Error("配置项目根重复");
    roots.add(key);
    let languages: LanguageId[] | undefined;
    if (project.languages !== undefined) {
      if (
        !Array.isArray(project.languages) ||
        !project.languages.length ||
        project.languages.some(
          (item) =>
            !["rust", "go", "java", "python", "c", "cpp"].includes(item),
        )
      )
        throw new Error("配置语言无效");
      languages = [...new Set(project.languages)] as LanguageId[];
    }
    if (!Array.isArray(project.stages) || !project.stages.length)
      throw new Error("配置项目必须包含验证阶段");
    const stages = project.stages.map((value) => {
      const data = object(
        value,
        [
          "id",
          "phase",
          "executable",
          "args",
          "cwd",
          "timeoutMs",
          "required",
          "integration",
          "env",
        ],
        "阶段",
      );
      const id = text(data.id, "阶段 id");
      if (!/^[a-zA-Z0-9][\w:-]{0,127}$/.test(id) || ids.has(id))
        throw new Error("阶段 id 无效或重复");
      ids.add(id);
      if (
        !["format", "lint", "typecheck", "test", "build"].includes(
          String(data.phase),
        )
      )
        throw new Error("配置阶段 phase 无效");
      let executable = text(data.executable, "工具");
      if (/[\r\n]/.test(executable)) throw new Error("配置工具名无效");
      if (!path.isAbsolute(executable) && /[/\\]/.test(executable))
        executable = resolveProjectPath(workspace, executable);
      if (
        !Array.isArray(data.args) ||
        data.args.some((arg) => typeof arg !== "string" || arg.includes("\0"))
      )
        throw new Error("配置阶段 args 必须是字符串数组");
      const timeoutMs = data.timeoutMs ?? 120000;
      if (
        typeof timeoutMs !== "number" ||
        !Number.isInteger(timeoutMs) ||
        timeoutMs < 1000 ||
        timeoutMs > 600000
      )
        throw new Error("配置超时必须为 1000–600000 毫秒");
      const cwd = resolveProjectPath(
        workspace,
        text(data.cwd ?? project.root, "阶段工作目录"),
      );
      if (!fs.statSync(cwd).isDirectory())
        throw new Error("配置阶段工作目录必须为目录");
      let env: Record<string, string> | undefined;
      if (data.env !== undefined) {
        if (
          !data.env ||
          typeof data.env !== "object" ||
          Array.isArray(data.env)
        )
          throw new Error("配置 env 必须为字符串映射");
        for (const [key, value] of Object.entries(data.env))
          if (
            !/^[A-Za-z_][A-Za-z0-9_]*$/.test(key) ||
            typeof value !== "string" ||
            value.includes("\0")
          )
            throw new Error("配置 env 字段无效");
        env = data.env as Record<string, string>;
      }
      return {
        id,
        phase: data.phase as StageSpec["phase"],
        executable,
        args: data.args as string[],
        cwd,
        timeoutMs,
        required: flag(data.required, true, "required"),
        integration: flag(data.integration, false, "integration"),
        ...(env ? { env } : {}),
      };
    });
    return { root, ...(languages ? { languages } : {}), stages };
  });
  return {
    schemaVersion: 1,
    enableIntegration: flag(data.enableIntegration, false, "enableIntegration"),
    projects,
  };
}
