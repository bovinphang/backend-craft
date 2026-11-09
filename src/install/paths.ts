import path from "node:path";
import os from "node:os";
import {
  resolveRuntimeTargets,
  RUNTIME_DESCRIPTORS,
  type InstallLanguage,
} from "@bovinphang/craft-common";
import type { InstallContext } from "./types.js";
import type { RuntimeAdapter } from "./registry.js";
import { getRuntime } from "./registry.js";
export const LOCAL_DIR: Record<string, string> = Object.fromEntries(
  Object.entries(RUNTIME_DESCRIPTORS).map(([id, descriptor]) => [
    id,
    descriptor.localDirectory,
  ]),
);
export function createInstallContext(options: {
  productRoot: string;
  cwd?: string;
  home?: string;
  runtime: string;
  isGlobal?: boolean;
  language?: InstallLanguage;
  mode?: "install" | "update";
  dryRun?: boolean;
  env?: NodeJS.ProcessEnv;
}): InstallContext {
  getRuntime(options.runtime);
  const cwd = path.resolve(options.cwd ?? process.cwd()),
    home = path.resolve(options.home ?? os.homedir()),
    isGlobal = options.isGlobal ?? false,
    language = options.language ?? "en";
  if (!["en", "zh-CN"].includes(language)) throw new Error("不支持的语言");
  const target = resolveRuntimeTargets({
    runtime: options.runtime,
    cwd,
    home,
    scope: isGlobal ? "global" : "local",
    env: options.env ?? process.env,
    compatibility: "backend",
  });
  return {
    productRoot: path.resolve(options.productRoot),
    contentRoot:
      language === "en"
        ? path.resolve(options.productRoot)
        : path.resolve(options.productRoot, "localized", language),
    cwd,
    home,
    baseDir: target.baseDir,
    runtime: options.runtime,
    isGlobal,
    language,
    mode: options.mode ?? "install",
    dryRun: options.dryRun ?? false,
    allowedRoots: target.resourceRoots,
  };
}
export function getRuntimeTarget(
  ctx: InstallContext,
  adapter: RuntimeAdapter,
): { baseDir: string; skillsDir?: string } {
  const target = resolveRuntimeTargets({
    runtime: ctx.runtime,
    cwd: ctx.cwd,
    home: ctx.home,
    baseDir: ctx.baseDir,
    scope: ctx.isGlobal ? "global" : "local",
    env: {},
    compatibility: "backend",
  });
  return {
    baseDir: ctx.baseDir,
    ...(adapter.capabilities.skills && target.skillsDir
      ? { skillsDir: target.skillsDir }
      : {}),
  };
}
