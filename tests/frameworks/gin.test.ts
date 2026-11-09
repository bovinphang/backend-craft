import test from "node:test";
import assert from "node:assert/strict";
import { example, execute, tool, prepared } from "./fixtures.js";
test("Gin rejects invalid input before a business handler side effect", (t) => {
  const root = example(t, "gin");
  if (!tool(t, "go", root, ["version"])) return;
  if (
    !prepared(
      t,
      execute("go", ["list", "-m", "-mod=readonly", "all"], root),
      /go.sum|GOPROXY=off|module lookup disabled|updates to go.mod needed/,
    )
  )
    return;
  const args = ["test", "-mod=readonly", "-count=1", "-v", "./..."];
  const broken = execute("go", args, root, { CRAFT_EXAMPLE_DEFECTIVE: "1" });
  assert.notEqual(broken.status, 0);
  assert.match(broken.output, /side effects|TestInvalidInput/);
  assert.match(broken.output, /FAIL/);
  const fixed = execute("go", args, root, { CRAFT_EXAMPLE_DEFECTIVE: "0" });
  assert.equal(fixed.status, 0, fixed.output);
  assert.match(fixed.output, /PASS/);
});
