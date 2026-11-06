import type { Inspection, ValidationPlan } from "./types.js";
import type { ProjectConfig } from "./config.js";
import fs from "node:fs";
import path from "node:path";
import type { Project, StageSpec } from "./types.js";
import { LANGUAGES } from "./languages/registry.js";
import { stage, readOptional } from "./languages/shared.js";
import { resolveToolPath } from "./toolchain.js";

function existingTasks(project: Project): StageSpec[] {
  const make =
    readOptional(project.root, "Makefile") ??
    readOptional(project.root, "makefile");
  if (!make) return [];
  const targets = new Set(
    [...make.matchAll(/^([a-z][a-z0-9_-]*)\s*:/gm)].map((match) => match[1]),
  );
  const result: StageSpec[] = [];
  const env = Object.assign(
    {},
    ...project.languages.flatMap((language) =>
      LANGUAGES[language].suggest(project).map((item) => item.env ?? {}),
    ),
  ) as Record<string, string>;
  for (const [target, phase] of [
    ["format-check", "format"],
    ["lint", "lint"],
    ["typecheck", "typecheck"],
    ["test", "test"],
    ["build", "build"],
  ] as const)
    if (targets.has(target))
      result.push(
        stage(
          project,
          `make:${target}`,
          phase,
          "make",
          ["--no-print-directory", target],
          env,
        ),
      );
  return result;
}
export function planValidation(
  inspection: Inspection,
  config?: ProjectConfig,
): ValidationPlan {
  const result: ValidationPlan = {
    schemaVersion: 1,
    projects: [],
    stages: [],
    problems: [],
    warnings: [...inspection.warnings],
  };
  if (config) {
    result.projects = config.projects.map((p) => ({
      ...inspection.projects.find((existing) => existing.root === p.root),
      root: p.root,
      languages:
        p.languages ??
        inspection.projects.find((existing) => existing.root === p.root)
          ?.languages ??
        [],
      evidence:
        inspection.projects.find((existing) => existing.root === p.root)
          ?.evidence ?? [],
      buildFiles:
        inspection.projects.find((existing) => existing.root === p.root)
          ?.buildFiles ?? [],
      ambiguous: false,
    }));
    result.stages = config.projects.flatMap((p) =>
      p.stages.map((item) => ({
        ...item,
        ...(item.integration && !config.enableIntegration
          ? { skipReason: "integration 未显式启用" }
          : {}),
      })),
    );
  } else {
    result.projects = inspection.projects;
    if (inspection.truncated)
      result.problems.push("项目扫描不完整，不能推断完整验证计划");
    if (inspection.projects.length !== 1)
      result.problems.push(
        "存在多个或没有可确认项目，请指定项目路径或显式配置",
      );
    for (const project of inspection.projects) {
      if (project.ambiguous) {
        result.problems.push("项目语言或构建入口有歧义，需要明确配置");
        continue;
      }
      try {
        const existing = existingTasks(project);
        const proposed = existing.length
          ? existing
          : project.languages.flatMap((id) => LANGUAGES[id].suggest(project));
        const unique = [
          ...new Map(proposed.map((item) => [item.id, item])).values(),
        ];
        for (const phase of ["test", "build"])
          if (unique.filter((item) => item.phase === phase).length > 1)
            result.problems.push(`存在多个 ${phase} 构建入口，必须明确选择`);
        if (!unique.length)
          result.problems.push(
            "没有安全默认验证阶段，请先准备工具/构建目录并提供明确配置",
          );
        result.stages.push(...unique);
      } catch (error) {
        result.problems.push(
          error instanceof Error ? error.message : "项目配置无法解析",
        );
      }
    }
  }
  const ids = new Set<string>();
  for (const item of result.stages) {
    if (ids.has(item.id)) result.problems.push(`阶段 id 重复：${item.id}`);
    ids.add(item.id);
    if (item.skipReason) continue;
    let executable: string | undefined;
    if (
      config &&
      path.isAbsolute(item.executable) &&
      fs.existsSync(item.executable) &&
      fs.statSync(item.executable).isFile()
    )
      executable = item.executable;
    else if (
      path.isAbsolute(item.executable) &&
      item.executable.includes(`${path.sep}.venv${path.sep}`) &&
      fs.existsSync(item.executable)
    )
      executable = item.executable;
    else executable = resolveToolPath(item.executable, inspection.workspace);
    if (executable) item.executable = executable;
    else if (item.required)
      result.problems.push(`缺少必需工具：${path.basename(item.executable)}`);
  }
  if (!result.stages.length && !result.problems.length)
    result.problems.push("验证计划没有任何阶段");
  result.problems = [...new Set(result.problems)];
  return result;
}
