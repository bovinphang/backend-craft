import type { Inspection } from "../project/types.js";
import { inspectProject } from "../project/discover.js";
import { fileURLToPath } from "node:url";
import path from "node:path";
export function sessionStart(workspace: string, taskPath?: string): Inspection {
  return inspectProject({ workspace, taskPath });
}
if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  try {
    process.stdout.write(JSON.stringify(sessionStart(process.cwd())) + "\n");
  } catch {
    process.stderr.write("后端上下文识别未完成\n");
    process.exitCode = 2;
  }
}
