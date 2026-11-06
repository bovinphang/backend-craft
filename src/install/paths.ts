import path from "node:path";
import type { InstallContext } from "./types.js";
import type { RuntimeAdapter } from "./registry.js";
import type { InstallLanguage } from "@bovinphang/craft-common";
import { getRuntime } from "./registry.js";
import os from "node:os";
export const LOCAL_DIR: Record<string, string> = {
  claude: ".claude",
  codex: ".codex",
  cursor: ".cursor",
  windsurf: ".windsurf",
  opencode: ".opencode",
  kilo: ".kilo",
  gemini: ".gemini",
  copilot: ".github",
  antigravity: ".agent",
  augment: ".augment",
  trae: ".trae",
  codebuddy: ".codebuddy",
  cline: "",
  openclaw: ".openclaw",
  qoder: ".qoder",
};
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
  const env = options.env ?? process.env,
    key =
      options.runtime === "codex"
        ? "CODEX_HOME"
        : options.runtime === "openclaw"
          ? "OPENCLAW_STATE_DIR"
          : options.runtime.toUpperCase() + "_CONFIG_DIR";
  const defaults: Record<string, string> = {
    windsurf: path.join(home, ".codeium/windsurf"),
    opencode: path.join(
      env.XDG_CONFIG_HOME ?? path.join(home, ".config"),
      "opencode",
    ),
    kilo: path.join(env.XDG_CONFIG_HOME ?? path.join(home, ".config"), "kilo"),
    antigravity: path.join(home, ".gemini/config"),
    cline: path.join(home, "Documents/Cline"),
  };
  const configured =
      env[key] ??
      (options.runtime === "openclaw" ? env.OPENCLAW_CONFIG_DIR : undefined),
    baseDir = isGlobal
      ? path.resolve(
          configured?.replace(/^~(?=[\\/]|$)/, home) ??
            defaults[options.runtime] ??
            path.join(home, "." + options.runtime),
        )
      : path.join(cwd, LOCAL_DIR[options.runtime]);
  const skills =
    options.runtime === "codex"
      ? path.join(isGlobal ? home : cwd, ".agents/skills")
      : path.join(baseDir, "skills");
  return {
    productRoot: path.resolve(options.productRoot),
    contentRoot:
      language === "en"
        ? path.resolve(options.productRoot)
        : path.resolve(options.productRoot, "localized", language),
    cwd,
    home,
    baseDir,
    runtime: options.runtime,
    isGlobal,
    language,
    mode: options.mode ?? "install",
    dryRun: options.dryRun ?? false,
    allowedRoots: [
      baseDir,
      ...(options.runtime === "codex" ? [skills] : []),
      ...(!isGlobal ? [cwd] : []),
    ],
  };
}
export function getRuntimeTarget(
  ctx: InstallContext,
  adapter: RuntimeAdapter,
): { baseDir: string; skillsDir?: string } {
  return {
    baseDir: ctx.baseDir,
    ...(adapter.capabilities.skills
      ? {
          skillsDir:
            ctx.runtime === "codex"
              ? path.join(ctx.isGlobal ? ctx.home : ctx.cwd, ".agents/skills")
              : ctx.runtime === "openclaw"
                ? path.join(ctx.isGlobal ? ctx.baseDir : ctx.cwd, "skills")
                : path.join(ctx.baseDir, "skills"),
        }
      : {}),
  };
}
