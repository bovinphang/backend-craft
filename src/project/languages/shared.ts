import fs from "node:fs";
import path from "node:path";
import type { Phase, Project, StageSpec } from "../types.js";
export function stage(
  p: Project,
  id: string,
  phase: Phase,
  executable: string,
  args: string[],
  env?: Record<string, string>,
): StageSpec {
  return {
    id,
    phase,
    executable,
    args,
    cwd: p.root,
    timeoutMs: 120000,
    required: true,
    ...(env ? { env } : {}),
  };
}
export function readOptional(
  root: string,
  relative: string,
): string | undefined {
  const target = path.resolve(root, relative),
    remaining = path.relative(root, target);
  if (
    path.isAbsolute(remaining) ||
    remaining === ".." ||
    remaining.startsWith(`..${path.sep}`)
  )
    throw new Error("语言配置路径越界");
  let current = target;
  while (current !== root) {
    try {
      if (fs.lstatSync(current).isSymbolicLink())
        throw new Error("语言配置不允许链接");
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    }
    current = path.dirname(current);
  }
  if (!fs.existsSync(target)) return undefined;
  if (!fs.statSync(target).isFile() || fs.statSync(target).size > 262144)
    throw new Error("语言配置不是可安全读取的小型文件");
  return fs.readFileSync(target, "utf8");
}
