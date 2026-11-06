import path from "node:path";
import { inspect } from "./inspect.js";
import { readProjectConfig } from "../project/config.js";
import { planValidation } from "../project/validation-plan.js";
import { inside } from "../install/safe-path.js";
export function validationPlan(cwd: string, target?: string) {
  const inspection = inspect(cwd, target);
  const nearest =
    inspection.projects.length === 1 ? inspection.projects[0].root : undefined;
  let config =
    target && nearest && nearest !== inspection.workspace
      ? readProjectConfig(nearest)
      : undefined;
  config ??= readProjectConfig(inspection.workspace);
  if (!config && nearest && nearest !== inspection.workspace)
    config = readProjectConfig(nearest);
  if (config && target) {
    const task = path.resolve(cwd, target),
      projects = config.projects
        .filter((p) => inside(p.root, task))
        .sort((a, b) => b.root.length - a.root.length);
    config = { ...config, projects: projects.slice(0, 1) };
  }
  return planValidation(inspection, config);
}
