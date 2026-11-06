import path from "node:path";
import { resolveSharedIdentity } from "@bovinphang/craft-common";
import { readCommonCatalog } from "../content/common.js";
import { sharedEntryStatus } from "../install/shared-config/index.js";
import { getRuntime } from "../install/registry.js";
import { createInstallContext, getRuntimeTarget } from "../install/paths.js";
import {
  manifestPath,
  readManifest,
  resolveReference,
  assertManifestIdentity,
} from "../install/manifest.js";
import { currentHash } from "../install/product-plan.js";
import type { InstallContext } from "../install/types.js";
export function doctor(ctx: InstallContext) {
  const file = manifestPath(ctx),
    manifest = readManifest(file);
  if (manifest) assertManifestIdentity(ctx, manifest);
  const files =
    manifest?.files.map((entry) => ({
      path: resolveReference(ctx, entry),
      healthy: currentHash(resolveReference(ctx, entry)) === entry.hash,
    })) ?? [];
  const skillsDir = getRuntimeTarget(ctx, getRuntime(ctx.runtime)).skillsDir;
  const sharedEntries = (manifest?.sharedEntries ?? []).map((record) => {
    const file = resolveReference(ctx, record);
    return {
      path: file,
      id: record.entry.id,
      status: sharedEntryStatus(file, record.entry),
    };
  });
  let commonHealthy = !manifest?.common;
  if (manifest?.common && skillsDir) {
    const identity = resolveSharedIdentity(skillsDir),
      catalog = readCommonCatalog(ctx.productRoot, manifest.language);
    commonHealthy =
      manifest.common.target === identity.target &&
      manifest.common.ledgerDir === identity.ledgerDir &&
      manifest.common.digest === catalog.digest &&
      manifest.common.packageVersion === catalog.packageVersion &&
      catalog.skills.every((skill) =>
        skill.files.every(
          (file) =>
            currentHash(
              path.join(identity.target, skill.id, file.relativePath),
            ) === file.hash,
        ),
      );
  }
  return {
    runtime: ctx.runtime,
    installed: Boolean(manifest),
    filesHealthy:
      Boolean(manifest) &&
      files.every((f) => f.healthy) &&
      commonHealthy &&
      sharedEntries.every((entry) => entry.status === "healthy"),
    files,
    sharedEntries,
    enabled: "unknown" as const,
    discovery: getRuntime(ctx.runtime).discovery ?? "documented",
    manualSteps: getRuntime(ctx.runtime).manualSteps ?? [],
    common: manifest?.common
      ? {
          ...manifest.common,
          resourcesPresent: commonHealthy,
        }
      : undefined,
  };
}
export { createInstallContext };
