import {
  executeSharedPlan,
  recoverSharedTransaction,
  type FileMutation,
} from "@bovinphang/craft-common";
import type {
  InstallContext,
  ProductSessionResult,
  SharedEntryRecord,
} from "./types.js";
import { getRuntime, type RuntimeAdapter } from "./registry.js";
import {
  allowedRoots,
  manifestPath,
  beginManifestSession,
  endManifestSession,
  discardManifestSession,
  readManifest,
  uninstallManagedFiles,
  resolveReference,
  assertManifestIdentity,
} from "./manifest.js";
import { planProductWrites, writePlanned } from "./product-plan.js";
import { planSharedEntry } from "./shared-config/index.js";
import {
  executeProductPlan,
  recoverProductTransaction,
} from "./transaction.js";
import { getRuntimeTarget } from "./paths.js";
import { commonContext } from "./common.js";
export interface InstallResult {
  changed: string[];
  preserved: string[];
  conflicts: string[];
  common: "shared" | "none" | "retained";
  status: "complete" | "partial" | "planned";
}
async function prepare(ctx: InstallContext, adapter: RuntimeAdapter) {
  if (ctx.runtime !== adapter.id) throw new Error("Runtime 适配身份不匹配");
  const { skillsDir } = getRuntimeTarget(ctx, adapter),
    common = skillsDir ? commonContext(ctx, skillsDir) : undefined;
  if (!ctx.dryRun) {
    if (common)
      await recoverSharedTransaction(common.pointer.target, allowedRoots(ctx));
    else await recoverProductTransaction(ctx);
  }
  return common;
}
async function commit(
  ctx: InstallContext,
  common: ReturnType<typeof commonContext> | undefined,
  mutations: FileMutation[],
  remove = false,
  retainConsumer = false,
): Promise<string[]> {
  if (common) {
    const plan = await executeSharedPlan(
      {
        ...common.request,
        ...(remove ? { action: "uninstall" as const, retainConsumer } : {}),
      },
      {
        dryRun: ctx.dryRun,
        productMutations: mutations,
        allowedProductRoots: allowedRoots(ctx),
      },
    );
    return [...plan.mutations, ...mutations].map((m) => m.path);
  }
  await executeProductPlan(ctx, mutations, { dryRun: ctx.dryRun });
  return mutations.map((m) => m.path);
}
export async function installRuntime(
  ctx: InstallContext,
  adapter: RuntimeAdapter = getRuntime(ctx.runtime),
): Promise<InstallResult> {
  const common = await prepare(ctx, adapter);
  let result: ProductSessionResult | undefined;
  const mutations = await planProductWrites(async () => {
    try {
      beginManifestSession(ctx, common?.pointer);
      await adapter.plan(ctx);
      result = endManifestSession();
    } finally {
      discardManifestSession();
    }
  });
  const changed = await commit(ctx, common, mutations),
    preserved = result!.preserved;
  return {
    changed,
    preserved,
    conflicts: [],
    common: common ? "shared" : "none",
    status: ctx.dryRun ? "planned" : preserved.length ? "partial" : "complete",
  };
}
export async function uninstallRuntime(
  ctx: InstallContext,
  adapter: RuntimeAdapter = getRuntime(ctx.runtime),
): Promise<InstallResult> {
  const common = await prepare(ctx, adapter),
    manifest = readManifest(manifestPath(ctx));
  if (!manifest)
    return {
      changed: [],
      preserved: [],
      conflicts: [],
      common: "none",
      status: ctx.dryRun ? "planned" : "complete",
    };
  assertManifestIdentity(ctx, manifest);
  if (
    manifest.common &&
    (!common ||
      manifest.common.target !== common.pointer.target ||
      manifest.common.ledgerDir !== common.pointer.ledgerDir)
  )
    throw new Error("公共目标身份不匹配");
  const preserved: string[] = [];
  let retain = false;
  const mutations = await planProductWrites(async () => {
    const files = uninstallManagedFiles(ctx, manifest);
    preserved.push(...files.preserved);
    const sharedEntries: SharedEntryRecord[] = [];
    for (const record of manifest.sharedEntries) {
      const file = resolveReference(ctx, record);
      const mutation = planSharedEntry(
        file,
        record.entry,
        "remove",
        record.entry,
      );
      if (mutation) writePlanned(file, mutation.after);
      else {
        sharedEntries.push(record);
        preserved.push(file);
      }
    }
    retain = files.remaining.length > 0 || sharedEntries.length > 0;
    writePlanned(
      manifestPath(ctx),
      retain
        ? Buffer.from(
            JSON.stringify(
              { ...manifest, files: files.remaining, sharedEntries },
              null,
              2,
            ) + "\n",
          )
        : null,
    );
  });
  const changed = await commit(ctx, common, mutations, true, retain);
  return {
    changed,
    preserved,
    conflicts: [],
    common: common ? (retain ? "retained" : "shared") : "none",
    status: ctx.dryRun ? "planned" : retain ? "partial" : "complete",
  };
}
