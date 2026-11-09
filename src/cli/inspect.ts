import fs from "node:fs";
import path from "node:path";
import { inspectProject } from "../project/discover.js";
import { inside } from "../install/safe-path.js";
function legacyInspectionInput(cwd: string, target?: string) {
  const taskPath = target ? path.resolve(cwd, target) : undefined;
  let workspace = path.resolve(cwd);
  if (taskPath && !inside(workspace, taskPath))
    workspace = fs.statSync(taskPath).isDirectory()
      ? taskPath
      : path.dirname(taskPath);
  return { workspace, ...(taskPath ? { taskPath } : {}) };
}
export function inspect(cwd: string, target?: string) {
  return inspectProject(legacyInspectionInput(cwd, target));
}

import {
  recommendCapabilities,
  readCapabilityCandidates,
  type TaskKind,
} from "@bovinphang/craft-common";
import { readProductCatalog } from "../content/catalog.js";
export function inspectCapabilities(
  cwd: string,
  target: string | undefined,
  productRoot: string,
  taskPath?: string,
  taskKind?: TaskKind,
) {
  // Preserve positional task semantics; explicit --task-path makes positional the workspace.
  const input =
    taskPath === undefined
      ? legacyInspectionInput(cwd, target)
      : { workspace: path.resolve(cwd, target ?? "."), taskPath };
  const report = inspectProject(input);
  // Discovery canonicalizes declared root aliases. Keep task location relative to that same root.
  const effectiveTaskPath = input.taskPath
    ? path.relative(
        path.resolve(input.workspace),
        path.resolve(input.workspace, input.taskPath),
      )
    : undefined;
  const delivered = readProductCatalog(productRoot, "en");
  const sources = Object.fromEntries(
    delivered.skills.map((s) => [s.id, s.sourcePackage]),
  );
  const catalog = readCapabilityCandidates(
    JSON.parse(
      fs.readFileSync(path.join(productRoot, "skills/metadata.json"), "utf8"),
    ),
    sources,
  );
  return {
    ...report,
    recommendations: recommendCapabilities({
      inspection: { ...report, units: report.units ?? [] },
      catalog,
      task: { path: effectiveTaskPath, kind: taskKind },
    }),
  };
}
