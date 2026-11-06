import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  hasTestEvidence,
  hasFreshTestReport,
} from "../../src/project/test-evidence.js";
import { executeValidation } from "../../src/project/execute.js";
import { resolveToolPath } from "../../src/project/toolchain.js";
function fixture(t: { after(fn: () => void): void }) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "bec-test-count-"));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  return root;
}
test("标准汇总扣除 skipped/disabled/todo，全跳过不证明执行", () => {
  for (const output of [
    "Ran 1 test\nOK (skipped=1)",
    "Tests run: 2, Failures: 0, Errors: 0, Skipped: 2",
    "# tests 1\n# pass 0\n# skipped 1",
    "ℹ tests 1\nℹ pass 0\nℹ todo 1",
    "test result: ok. 0 passed; 0 failed; 1 ignored",
  ])
    assert.equal(hasTestEvidence(output), false, output);
  for (const output of [
    "Ran 2 tests\nOK (skipped=1)",
    "Tests run: 2, Failures: 0, Errors: 0, Skipped: 1",
    "# tests 2\n# pass 1\n# skipped 1",
    "backend-craft:tests=1",
  ])
    assert.equal(hasTestEvidence(output), true, output);
});
test("新鲜 JUnit 报告全 skipped/disabled 不算执行，部分实际执行可用", (t) => {
  const root = fixture(t),
    file = path.join(root, "build/test-results/test/TEST-fixture.xml");
  fs.mkdirSync(path.dirname(file), { recursive: true });
  for (const body of [
    '<testsuite tests="1" skipped="1"/>',
    '<testsuite disabled="2" tests="2"/>',
  ]) {
    fs.writeFileSync(file, body);
    assert.equal(hasFreshTestReport(root, 0), false);
  }
  fs.writeFileSync(file, '<testsuite tests="2" skipped="1" failures="0"/>');
  assert.equal(hasFreshTestReport(root, 0), true);
});
for (const partial of [false, true])
  test(`真实 Node 全跳过/部分执行：${partial}`, async (t) => {
    const root = fixture(t),
      file = path.join(root, "fixture.test.mjs");
    fs.writeFileSync(
      file,
      "import test from 'node:test';import assert from 'node:assert/strict';test.skip('skipped',()=>{});" +
        (partial ? "test('executed',()=>assert.equal(1,1));" : ""),
    );
    const result = await executeValidation({
      schemaVersion: 1,
      projects: [],
      problems: [],
      stages: [
        {
          id: "test",
          phase: "test",
          executable: process.execPath,
          args: ["--test", "--test-reporter=tap", file],
          env: { NODE_TEST_CONTEXT: "" },
          cwd: root,
          required: true,
          timeoutMs: 5000,
        },
      ],
    });
    assert.equal(result.exitCode, partial ? 0 : 1);
  });
for (const partial of [false, true])
  test(
    `真实 unittest 全跳过/部分执行：${partial}`,
    { skip: !resolveToolPath("python", os.tmpdir()) },
    async (t) => {
      const root = fixture(t),
        code =
          "import unittest\nclass Example(unittest.TestCase):\n @unittest.skip('fixture')\n def test_skipped(self): pass\n" +
          (partial ? " def test_executed(self): self.assertEqual(1,1)\n" : "") +
          "unittest.main()\n";
      const result = await executeValidation({
        schemaVersion: 1,
        projects: [],
        problems: [],
        stages: [
          {
            id: "test",
            phase: "test",
            executable: resolveToolPath("python", root)!,
            args: ["-c", code],
            cwd: root,
            required: true,
            timeoutMs: 5000,
          },
        ],
      });
      assert.equal(result.exitCode, partial ? 0 : 1);
    },
  );
