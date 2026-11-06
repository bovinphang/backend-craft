import type { ToolStatus } from "./types.js";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { spawnSync } from "node:child_process";
export function resolveToolPath(
  executable: string,
  workspace = process.cwd(),
): string | undefined {
  if (!executable || executable.includes("\0")) return undefined;
  const roots = path.isAbsolute(executable)
    ? [""]
    : executable.includes("/") || executable.includes("\\")
      ? []
      : (process.env.PATH ?? "").split(path.delimiter).filter(Boolean);
  const extensions =
    process.platform === "win32" && !path.extname(executable)
      ? [".exe", ".com", ".cmd", ".bat"]
      : [""];
  for (const root of roots)
    for (const extension of extensions) {
      const candidate = path.resolve(root, executable + extension);
      try {
        const real = fs.realpathSync(candidate),
          relative = path.relative(path.resolve(workspace), real);
        if (
          !relative ||
          (relative !== ".." &&
            !relative.startsWith(`..${path.sep}`) &&
            !path.isAbsolute(relative))
        )
          continue;
        if (!fs.statSync(real).isFile()) continue;
        if (process.platform !== "win32")
          fs.accessSync(real, fs.constants.X_OK);
        return real;
      } catch {
        /* Keep searching trusted PATH entries. */
      }
    }
  return undefined;
}
export function probeTool(
  executable: string,
  args: string[],
  workspace = process.cwd(),
): ToolStatus {
  if (
    args.length !== 1 ||
    !["--version", "-version", "version"].includes(args[0])
  )
    return { available: false, reason: "只允许只读版本参数" };
  const resolved = resolveToolPath(executable, workspace);
  if (!resolved)
    return { available: false, reason: "未找到工作区之外的可执行工具" };
  if (/\.(?:cmd|bat)$/i.test(resolved))
    return { available: false, reason: "命令包装器需要显式配置，未执行探测" };
  const result = spawnSync(resolved, args, {
    cwd: os.tmpdir(),
    encoding: "utf8",
    timeout: 5000,
    maxBuffer: 65536,
    windowsHide: true,
    env: { ...process.env, RUSTUP_AUTO_INSTALL: "0", GOTOOLCHAIN: "local" },
  });
  return result.status === 0
    ? {
        available: true,
        version: (result.stdout || result.stderr).trim().split(/\r?\n/)[0],
      }
    : { available: false, reason: result.error?.message ?? "版本命令失败" };
}
