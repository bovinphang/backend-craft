import fs from "node:fs";
import path from "node:path";
import { executeProductPlan } from "../../src/install/transaction.ts";
const [root, phase] = process.argv.slice(2),
  baseDir = path.join(root, ".cline");
const ctx = {
  productRoot: path.join(process.cwd(), "dist/package"),
  contentRoot: path.join(process.cwd(), "dist/package"),
  cwd: root,
  home: path.join(root, "home"),
  baseDir,
  runtime: "cline",
  isGlobal: false,
  language: "en",
  mode: "install",
  dryRun: false,
};
const target = path.join(baseDir, "bec-owned.md"),
  journal = path.join(baseDir, ".backend-craft-state/journal.json");
const rename = fs.renameSync;
fs.renameSync = (from, to) => {
  rename(from, to);
  if (
    (phase === "prepared" && String(to) === target) ||
    (phase === "committed" &&
      String(to) === journal &&
      JSON.parse(fs.readFileSync(journal, "utf8")).phase === "committed")
  ) {
    fs.writeSync(1, "READY\n");
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0);
  }
};
await executeProductPlan(ctx, [
  { path: target, beforeHash: null, after: Buffer.from("owned") },
  {
    path: path.join(baseDir, "bec-second.md"),
    beforeHash: null,
    after: Buffer.from("second"),
  },
]);
