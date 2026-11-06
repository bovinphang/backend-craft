import fs from "node:fs";
import path from "node:path";
import { inspectProject } from "../project/discover.js";
import { inside } from "../install/safe-path.js";
export function inspect(cwd: string, target?: string) {
  const taskPath = target ? path.resolve(cwd, target) : undefined;
  let workspace = path.resolve(cwd);
  if (taskPath && !inside(workspace, taskPath))
    workspace = fs.statSync(taskPath).isDirectory()
      ? taskPath
      : path.dirname(taskPath);
  return inspectProject({ workspace, ...(taskPath ? { taskPath } : {}) });
}
