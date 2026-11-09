import test from "node:test";
import assert from "node:assert/strict";
import * as verifier from "../../scripts/verify-frameworks.js";
test("framework verification rejects unknown flags and missing values before Docker actions", () => {
  assert.equal(typeof verifier.parseFrameworkOptions, "function");
  for (const args of [
    ["unexpected"],
    ["--framework"],
    ["--framework", "gin", "--unknown"],
    ["--framework", "unknown"],
    ["--framework", "gin,,axum"],
  ])
    assert.throws(() => verifier.parseFrameworkOptions(args));
  assert.deepEqual(
    verifier.parseFrameworkOptions(["--framework", "gin,axum", "--prepare"]),
    { selected: ["gin", "axum"], prepare: true },
  );
  assert.deepEqual(
    verifier.parseFrameworkOptions(["--", "--framework", "gin"]),
    { selected: ["gin"], prepare: false },
  );
});
