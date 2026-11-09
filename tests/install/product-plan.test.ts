import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { testSession } from "./session-fixture.js";
function fixture(t: { after(fn: () => void): void }) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "bec-explicit-plan-"));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  return root;
}
test("explicit product session reads its overlay and planning leaves disk unchanged", (t) => {
  const root = fixture(t),
    file = path.join(root, "new/bec-owned.md"),
    session = testSession(root);
  session.stage(file, Buffer.from("planned"));
  assert.equal(session.read(file).toString(), "planned");
  assert.equal(session.exists(file), true);
  const mutations = session.finish().mutations;
  assert.equal(fs.existsSync(path.dirname(file)), false);
  assert.equal(mutations[0].after?.toString(), "planned");
  assert.equal(mutations[0].beforeHash, null);
  assert.throws(() => session.stage(file, Buffer.from("bad")), /closed/);
});
test("independent explicit sessions replace ambient nested planning without leaks", (t) => {
  const root = fixture(t),
    file = path.join(root, "bec-file");
  fs.writeFileSync(file, "original");
  const first = testSession(root),
    second = testSession(root);
  first.stage(file, Buffer.from("temporary"));
  assert.equal(second.read(file).toString(), "original");
  assert.deepEqual(second.finish().mutations, []);
  first.finish();
  assert.equal(fs.readFileSync(file, "utf8"), "original");
});
test("product overlays reject frontend, common, other manifests and native metadata", (t) => {
  const root = fixture(t),
    session = testSession(root);
  for (const file of [
    "skills/fec-owned/SKILL.md",
    "skills/cc-owned/SKILL.md",
    "craft-manifests/test.json",
    "frontend-craft.manifest.json",
    ".claude-plugin/plugin.json",
    ".claude-plugin/marketplace.json",
  ]) {
    assert.throws(
      () => session.stage(path.join(root, file), Buffer.from("bad")),
      /namespace|ownership|reserved/i,
    );
  }
});
