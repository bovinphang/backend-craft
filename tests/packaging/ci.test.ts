import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { parseDocument } from "yaml";
test("CI YAML 可解析，基础跨平台 Node22 与六语言独立作业均有实际命令", () => {
  const quality = parseDocument(
    fs.readFileSync(".github/workflows/ci.yml", "utf8"),
    { uniqueKeys: true },
  );
  const language = parseDocument(
    fs.readFileSync(".github/workflows/language-fixtures.yml", "utf8"),
    { uniqueKeys: true },
  );
  assert.deepEqual(quality.errors, []);
  assert.deepEqual(language.errors, []);
  const q = quality.toJS(),
    l = language.toJS();
  assert.deepEqual(q.jobs.quality.strategy.matrix.os, [
    "ubuntu-latest",
    "windows-latest",
  ]);
  assert.deepEqual(l.jobs.language.strategy.matrix.language, [
    "rust",
    "go",
    "java",
    "python",
    "c",
    "cpp",
  ]);
  assert.ok(
    l.jobs.language.steps.some((s: { run?: string }) =>
      s.run?.includes("verify:languages"),
    ),
  );
  assert.ok(
    q.jobs.quality.steps.some(
      (s: { run?: string }) => s.run === "pnpm run pack:all",
    ),
  );
});
