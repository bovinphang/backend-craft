import {
  executeProductPlan as execute,
  recoverProductTransaction as recover,
  type FileMutation,
} from "@bovinphang/craft-common";
import { PRODUCT_DEFINITION, toProductContext } from "../product.js";
import type { InstallContext } from "./types.js";
import { backendInstallError } from "./errors.js";
export function executeProductPlan(
  ctx: InstallContext,
  mutations: FileMutation[],
  options: { dryRun?: boolean } = {},
): Promise<void> {
  return execute(
    { definition: PRODUCT_DEFINITION, context: toProductContext(ctx) },
    mutations,
    options,
  ).catch(backendInstallError);
}
export function recoverProductTransaction(
  ctx: InstallContext,
): Promise<"clean" | "recovered"> {
  return recover({
    definition: PRODUCT_DEFINITION,
    context: toProductContext(ctx),
  }).catch(backendInstallError);
}
