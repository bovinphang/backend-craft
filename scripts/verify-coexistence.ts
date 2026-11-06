import path from "node:path";
import { spawnSync } from "node:child_process";
const index = process.argv.indexOf("--frontend-root"),
  root =
    index < 0 ? process.env.BEC_FRONTEND_REFERENCE : process.argv[index + 1];
if (!root) throw new Error("需要 --frontend-root 指向真实前端仓库");
const result = spawnSync(
  process.execPath,
  ["--import", "tsx", "--test", "tests/install/coexistence.test.ts"],
  {
    cwd: path.resolve(import.meta.dirname, ".."),
    env: {
      ...process.env,
      BEC_FRONTEND_REFERENCE: path.resolve(root),
      BEC_COEXISTENCE_EVIDENCE:
        process.env.BEC_COEXISTENCE_EVIDENCE ??
        path.resolve(
          import.meta.dirname,
          "../reports/backend-craft/coexistence",
        ),
    },
    stdio: "inherit",
    windowsHide: true,
  },
);
process.exitCode = result.status ?? 1;
