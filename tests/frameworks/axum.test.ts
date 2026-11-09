import test from "node:test";
import assert from "node:assert/strict";
import { example, execute, tool, prepared } from "./fixtures.js";
test("Axum extraction failure remains 4xx and cannot execute the business effect", (t) => {
  const root = example(t, "axum");
  if (!tool(t, "cargo", root)) return;
  if (
    !prepared(
      t,
      execute("cargo", ["generate-lockfile", "--offline"], root),
      /no matching package|failed to download|offline/,
    )
  )
    return;
  const args = ["test", "--offline", "--locked"];
  const broken = execute("cargo", [...args, "--features", "defective"], root);
  assert.notEqual(broken.status, 0);
  assert.match(broken.output, /rejects_invalid_json.*FAILED/);
  const fixed = execute("cargo", args, root);
  assert.equal(fixed.status, 0, fixed.output);
  assert.match(fixed.output, /test result: ok/);
});
