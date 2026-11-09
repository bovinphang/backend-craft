import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { example, execute, tool, prepared } from "./fixtures.js";
test("Drogon rejected filter cannot call the controller continuation", (t) => {
  const root = example(t, "drogon");
  if (!tool(t, "cmake", root)) return;
  if (
    !prepared(
      t,
      execute("cmake", ["-S", ".", "-B", "build"], root),
      /Could not find.*Drogon|DrogonConfig|CMAKE_CXX_COMPILER|No CMAKE_CXX_COMPILER|could not find any instance of Visual Studio/is,
    )
  )
    return;
  const build = execute(
    "cmake",
    ["--build", "build", "--config", "Debug"],
    root,
  );
  assert.equal(build.status, 0, build.output);
  const args = ["--test-dir", "build", "-C", "Debug", "--output-on-failure"];
  const broken = execute("ctest", args, root, { CRAFT_EXAMPLE_DEFECTIVE: "1" });
  assert.notEqual(broken.status, 0);
  assert.match(broken.output, /CONTRACT_FAILURE/);
  const fixed = execute("ctest", args, root, { CRAFT_EXAMPLE_DEFECTIVE: "0" });
  assert.equal(fixed.status, 0, fixed.output);
  assert.match(fixed.output, /100% tests passed/);
  t.diagnostic(
    `Drogon in-process callbacks in ${path.basename(root)}; HTTP routing/server load and DB NOT RUN`,
  );
});
