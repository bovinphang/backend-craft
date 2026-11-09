import test from "node:test";
import assert from "node:assert/strict";
import { example, execute, tool, prepared } from "./fixtures.js";
test("FastAPI request resource exists inside real lifespan and closes on exit", (t) => {
  const root = example(t, "fastapi");
  if (!tool(t, "python", root)) return;
  if (
    !prepared(
      t,
      execute(
        "python",
        [
          "-c",
          "import fastapi,httpx;print('FastAPI',fastapi.__version__,'httpx',httpx.__version__)",
        ],
        root,
      ),
      /ModuleNotFoundError/,
    )
  )
    return;
  const args = ["-m", "unittest", "-v", "test_lifespan.py"];
  const broken = execute("python", args, root, {
    CRAFT_EXAMPLE_DEFECTIVE: "1",
    PYTHONDONTWRITEBYTECODE: "1",
  });
  assert.notEqual(broken.status, 0);
  assert.match(broken.output, /503 != 200|200 != 503/);
  assert.match(broken.output, /FAILED/);
  const fixed = execute("python", args, root, {
    CRAFT_EXAMPLE_DEFECTIVE: "0",
    PYTHONDONTWRITEBYTECODE: "1",
  });
  assert.equal(fixed.status, 0, fixed.output);
  assert.match(fixed.output, /Ran 2 tests/);
  assert.match(fixed.output, /\bOK\b/);
  t.diagnostic(
    "Actual TestClient lifespan entered and exited; external DB/integration NOT RUN",
  );
});
