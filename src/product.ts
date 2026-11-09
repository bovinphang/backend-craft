export const PRODUCT = Object.freeze({
  name: "@bovinphang/backend-craft",
  version: "1.0.0",
  prefix: "bec-",
  manifestName: "backend-craft.manifest.json",
});

import type {
  ProductDefinition,
  ProductContext,
} from "@bovinphang/craft-common";
import type { InstallContext } from "./install/types.js";

export const PRODUCT_DEFINITION: ProductDefinition = Object.freeze({
  packageName: PRODUCT.name,
  consumerProduct: PRODUCT.name,
  resourcePrefix: PRODUCT.prefix,
  manifestName: PRODUCT.manifestName,
  stateDirectoryName: ".backend-craft-state",
  markerId: "backend-craft",
});

export function toProductContext(ctx: InstallContext): ProductContext {
  return {
    packageVersion: PRODUCT.version,
    runtime: ctx.runtime,
    scope: ctx.isGlobal ? "global" : "local",
    language: ctx.language,
    cwd: ctx.cwd,
    home: ctx.home,
    baseDir: ctx.baseDir,
    allowedRoots: ctx.allowedRoots ?? [
      ctx.baseDir,
      ...(ctx.isGlobal ? [] : [ctx.cwd]),
    ],
    dryRun: ctx.dryRun,
  };
}

export const LEGACY_SKILL_IDS: Readonly<Record<string, string>> = {
  "bec-rust-project-standard": "cc-rust-project-standard",
  "bec-go-project-standard": "cc-go-project-standard",
  "bec-java-project-standard": "cc-java-project-standard",
  "bec-python-project-standard": "cc-python-project-standard",
  "bec-c-project-standard": "cc-c-project-standard",
  "bec-cpp-project-standard": "cc-cpp-project-standard",
  "bec-rust-async": "cc-rust-async",
  "bec-go-concurrency": "cc-go-concurrency",
  "bec-python-async": "cc-python-async",
  "bec-java-runtime": "cc-java-runtime",
  "bec-native-memory-safety": "cc-native-memory-safety",
};
