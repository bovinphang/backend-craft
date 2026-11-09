import test from "node:test";
import assert from "node:assert/strict";
import { example, execute, tool, prepared } from "./fixtures.js";
test("Spring MVC invalid input returns 400 without persistence-side effects", (t) => {
  const root = example(t, "spring-boot");
  if (!tool(t, "mvn", root)) return;
  if (
    !prepared(
      t,
      execute("mvn", ["-o", "-q", "-DskipTests", "test-compile"], root),
      /offline|Cannot access|Could not resolve/,
    )
  )
    return;
  const broken = execute(
    "mvn",
    ["-o", "-q", "-Dcraft.example.defective=true", "test"],
    root,
  );
  assert.notEqual(broken.status, 0);
  assert.match(broken.output, /Failures: [1-9]|expected:.*400/);
  const fixed = execute(
    "mvn",
    ["-o", "-q", "-Dcraft.example.defective=false", "test"],
    root,
  );
  assert.equal(fixed.status, 0, fixed.output);
  t.diagnostic(
    "MockMvc validation/effect boundary only; actual database isolation/rollback NOT RUN",
  );
});
