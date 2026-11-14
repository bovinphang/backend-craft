import fs from "node:fs";
import path from "node:path";
import { installRuntime } from "../../src/install/lifecycle.ts";
import { writeManaged } from "../../src/install/manifest.ts";
const [declaredRoot, phase, mode] = process.argv.slice(2),
  root = fs.realpathSync.native(declaredRoot),
  baseDir = path.join(root, ".claude"),
  file = path.join(baseDir, "bec-owned.md");
const ctx = {
  productRoot: path.join(process.cwd(), "dist/package"),
  contentRoot: path.join(process.cwd(), "dist/package"),
  cwd: root,
  home: path.join(root, "home"),
  baseDir,
  runtime: "claude",
  isGlobal: false,
  language: "en",
  mode: mode === "update" ? "update" : "install",
  dryRun: false,
};
const rename = fs.renameSync;
fs.renameSync = (from, to) => {
  rename(from, to);
  if (
    (phase === "prepared" &&
      String(to) ===
        (mode === "update"
          ? path.join(baseDir, "backend-craft.manifest.json")
          : file)) ||
    (phase === "committed" &&
      path.basename(String(to)) === "transaction.json" &&
      JSON.parse(fs.readFileSync(to, "utf8")).phase === "committed")
  ) {
    fs.writeSync(1, "READY\n");
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0);
  }
};
await installRuntime(ctx, {
  id: "claude",
  capabilities: {
    skills: true,
    agents: false,
    commands: false,
    rules: false,
    hooks: false,
  },
  async plan(planning) {
    writeManaged(planning, file, Buffer.from("owned"));
  },
});
