import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
const root = path.resolve(import.meta.dirname, "../../dist/package");
test("service case requires a real HTTP pair and isolated maintainer", () => {
  for (const file of [
    "scripts/verify-engineering.ts",
    "skills/bec-api-design/examples/engineering/server_test.go",
  ])
    assert.ok(fs.existsSync(file.startsWith("scripts/") ? path.resolve(import.meta.dirname, "../..", file) : path.join(root, file)), "missing " + file);
});
test("real service idempotency pair runs through httptest", async (t) => {
  const { verifyEngineeringExamples } =
    await import("../../scripts/verify-engineering.js");
  const result = verifyEngineeringExamples({ root, prepare: false })[0];
  if (result.status === "MISSING") {
    t.skip(result.reason);
    return;
  }
  assert.equal(result.status, "PASS", JSON.stringify(result));
  assert.equal(result.fixed?.tests.passed, 3);
  assert.equal(result.broken?.tests.failed, 3);
});
test("HTTP evidence rejects zero/skipped/build failures and incomplete arguments", async () => {
  const { assessGo, parseEngineeringArgs } =
    await import("../../scripts/verify-engineering.js");
  for (const output of [
    "PASS",
    "build failed",
    '{"Action":"skip","Test":"TestRetryAfterCommittedResponseFailure"}',
  ])
    assert.throws(() => assessGo({ status: 1, output }, true, "log"));
  assert.throws(() => parseEngineeringArgs(["--root"]));
  assert.throws(() => parseEngineeringArgs(["--other"]));
  assert.equal(parseEngineeringArgs(["--", "--prepare"]).prepare, true);
});
test("service case runs away from repository and sibling skill sources", async (t) => {
  const { verifyEngineeringExamples } =
    await import("../../scripts/verify-engineering.js");
  const temp = fs.mkdtempSync(
    path.join(os.tmpdir(), "craft-service-isolated-"),
  );
  try {
    fs.cpSync(
      path.join(root, "skills/bec-api-design/examples/engineering"),
      path.join(temp, "skills/bec-api-design/examples/engineering"),
      { recursive: true },
    );
    const result = verifyEngineeringExamples({ root: temp, prepare: false })[0];
    if (result.status === "MISSING") {
      t.skip(result.reason);
      return;
    }
    assert.equal(result.status, "PASS", JSON.stringify(result));
  } finally {
    fs.rmSync(temp, { recursive: true, force: true });
  }
});
