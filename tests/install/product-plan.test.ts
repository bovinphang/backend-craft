import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  planProductWrites,
  writePlanned,
  readPlanned,
  existsPlanned,
} from "../../src/install/product-plan.js";
test("产品写入和读取使用 overlay，规划结束目标零写入", async (t) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "产品计划 "));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const file = path.join(root, "new/bec-owned.md");
  const mutations = await planProductWrites(async () => {
    writePlanned(file, Buffer.from("planned"));
    assert.equal(readPlanned(file).toString(), "planned");
    assert.equal(existsPlanned(file), true);
  });
  assert.equal(fs.existsSync(path.dirname(file)), false);
  assert.equal(mutations[0].after?.toString(), "planned");
  assert.equal(mutations[0].beforeHash, null);
  assert.throws(() => writePlanned(file, Buffer.from("bad")), /规划|会话/);
});
test("嵌套规划拒绝，结束后不会泄露前一个 overlay", async (t) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "产品重入 "));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const file = path.join(root, "bec-file");
  fs.writeFileSync(file, "original");
  await planProductWrites(async () => {
    writePlanned(file, Buffer.from("temporary"));
    await assert.rejects(
      planProductWrites(async () => {}),
      /嵌套|并发/,
    );
  });
  assert.equal(readPlanned(file).toString(), "original");
});
test("产品 overlay 不认领 fec、cc 和公共账本", async () => {
  for (const file of [
    "skills/fec-owned/SKILL.md",
    "skills/cc-owned/SKILL.md",
    "craft-manifests/test.json",
    "frontend-craft.manifest.json",
    ".claude-plugin/plugin.json",
    ".claude-plugin/marketplace.json",
  ])
    await assert.rejects(
      planProductWrites(async () =>
        writePlanned(path.resolve(file), Buffer.from("bad")),
      ),
      /公共|前端|认领/,
    );
});
