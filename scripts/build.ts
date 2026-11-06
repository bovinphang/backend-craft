import { build } from "esbuild";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { checkContent } from "./check-content.js";
const root = path.resolve(import.meta.dirname, "..");
checkContent(root);
for (const [entry, out] of [
  ["src/index.ts", "dist/index.js"],
  ["bin/backend-craft.ts", "dist/bin/backend-craft.js"],
  ["src/hooks/session-start.ts", "dist/hooks/bec-session-start.js"],
  ["src/openclaw/index.ts", "dist/openclaw/index.js"],
])
  await build({
    absWorkingDir: root,
    entryPoints: [entry],
    outfile: out,
    bundle: true,
    format: "esm",
    platform: "node",
    target: "node22",
    packages: entry === "src/index.ts" ? "external" : "bundle",
    banner: {
      js: 'import { createRequire as __becCreateRequire } from "node:module"; const require = __becCreateRequire(import.meta.url);',
    },
  });
const types = spawnSync(
  process.execPath,
  ["node_modules/typescript/bin/tsc", "-p", "tsconfig.build.json"],
  { cwd: root, stdio: "inherit", windowsHide: true },
);
if (types.status !== 0) throw new Error("声明构建失败");
