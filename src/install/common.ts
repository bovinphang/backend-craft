import {
  resolveSharedIdentity,
  type SharedRequest,
  type ContentCatalog,
} from "@bovinphang/craft-common";
import path from "node:path";
import { PRODUCT } from "../product.js";
import { readCommonCatalog } from "../content/common.js";
import type { CommonPointer, InstallContext } from "./types.js";
import { allowedRoots, manifestPath } from "./manifest.js";
import { safeDestination } from "./safe-path.js";
export function commonContext(
  ctx: InstallContext,
  skillsDir: string,
): { catalog: ContentCatalog; pointer: CommonPointer; request: SharedRequest } {
  const safe = safeDestination(
    path.join(skillsDir, ".boundary"),
    allowedRoots(ctx),
  );
  const identity = resolveSharedIdentity(path.dirname(safe)),
    catalog = readCommonCatalog(ctx.productRoot, ctx.language);
  return {
    catalog,
    pointer: {
      ...identity,
      packageVersion: catalog.packageVersion,
      language: catalog.language,
      digest: catalog.digest,
    },
    request: {
      action: ctx.mode,
      skillsDir: identity.target,
      consumer: {
        product: PRODUCT.name,
        manifestPath: manifestPath(ctx),
        scope: ctx.isGlobal ? "global" : "local",
      },
      catalog,
    },
  };
}
