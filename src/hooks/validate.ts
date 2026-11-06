import type { ValidationResult } from "../project/types.js";
import { validationPlan } from "../cli/validate.js";
import { executeValidation } from "../project/execute.js";
export interface ValidationHookOptions {
  workspace: string;
  enabled?: boolean;
  taskPath?: string;
  signal?: AbortSignal;
}
export async function validationHook(
  options: ValidationHookOptions,
): Promise<ValidationResult | { status: "disabled" }> {
  if (!options.enabled) return { status: "disabled" };
  return executeValidation(
    validationPlan(options.workspace, options.taskPath),
    { signal: options.signal },
  );
}
