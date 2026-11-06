import type { StageSpec, ValidationResult } from "../project/types.js";
import { safeDestination } from "../install/safe-path.js";
import { executeValidation } from "../project/execute.js";
export async function formatHook(options: {
  workspace: string;
  enabled?: boolean;
  stage?: StageSpec;
  signal?: AbortSignal;
}): Promise<ValidationResult | { status: "disabled" }> {
  if (!options.enabled) return { status: "disabled" };
  const stage = options.stage;
  if (!stage || stage.phase !== "format")
    throw new Error("显式格式操作必须指定格式入口");
  safeDestination(stage.cwd + "/bec-boundary", [options.workspace]);
  return executeValidation(
    { schemaVersion: 1, projects: [], stages: [stage], problems: [] },
    { signal: options.signal },
  );
}
