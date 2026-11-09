import { inspectLegacyInstall } from "./migration.js";
import {
  runProductLifecycle,
  type ProductInstallResult,
} from "@bovinphang/craft-common";
import { PRODUCT_DEFINITION, toProductContext } from "../product.js";
import type { InstallContext } from "./types.js";
import { getRuntime, type RuntimeAdapter } from "./registry.js";
import { MANIFEST_CODEC } from "./manifest-codec.js";
import { getRuntimeTarget } from "./paths.js";
import { commonContext } from "./common.js";
import path from "node:path";
import { backendInstallError } from "./errors.js";
export type InstallResult = ProductInstallResult;
function configurationFiles(ctx: InstallContext): string[] {
  if (ctx.runtime === "claude") return [path.join(ctx.baseDir, "CLAUDE.md")];
  if (ctx.runtime === "codex")
    return [path.join(ctx.isGlobal ? ctx.baseDir : ctx.cwd, "AGENTS.md")];
  if (ctx.runtime === "gemini")
    return [path.join(ctx.isGlobal ? ctx.baseDir : ctx.cwd, "GEMINI.md")];
  if (ctx.runtime === "copilot" && ctx.isGlobal)
    return [path.join(ctx.baseDir, "copilot-instructions.md")];
  return [];
}
async function run(
  ctx: InstallContext,
  adapter: RuntimeAdapter,
  action: "install" | "update" | "uninstall",
): Promise<InstallResult> {
  if (ctx.runtime !== adapter.id) throw new Error("Runtime 适配身份不匹配");
  const { skillsDir } = getRuntimeTarget(ctx, adapter);
  const common = skillsDir ? commonContext(ctx, skillsDir) : undefined;
  return runProductLifecycle({
    action,
    definition: PRODUCT_DEFINITION,
    context: toProductContext(ctx),
    codec: MANIFEST_CODEC,
    ...(common ? { common: common.request } : {}),
    adapter: {
      configurationFiles: () =>
        adapter.configurationFiles?.(ctx) ?? configurationFiles(ctx),
      plan: async (_context, session) => {
        const legacy = inspectLegacyInstall(ctx);
        if (legacy.findings.some((f) => f.kind === "conflict"))
          throw new Error(
            "旧入口退役冲突；请运行 bec runtime check-migration 并处理用户文件",
          );
        for (const root of legacy.roots)
          session.retireTree(root, { rejectUnknown: true });
        await adapter.plan({ ...ctx, session });
      },
    },
  });
}
export function installRuntime(
  ctx: InstallContext,
  adapter: RuntimeAdapter = getRuntime(ctx.runtime),
): Promise<InstallResult> {
  return run(ctx, adapter, ctx.mode).catch(backendInstallError);
}
export function uninstallRuntime(
  ctx: InstallContext,
  adapter: RuntimeAdapter = getRuntime(ctx.runtime),
): Promise<InstallResult> {
  return run(ctx, adapter, "uninstall").catch(backendInstallError);
}
