import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { sessionStart } from "../../src/hooks/session-start.js";
import { formatHook } from "../../src/hooks/format.js";
import { validationHook } from "../../src/hooks/validate.js";
test("默认 Hook 不执行命令、不写入、不下载", async (t) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "bec-hooks-"));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.writeFileSync(path.join(root, "go.mod"), "module local\n");
  const before = fs.readdirSync(root);
  assert.equal(sessionStart(root).projects[0].languages[0], "go");
  assert.deepEqual(await formatHook({ workspace: root }), {
    status: "disabled",
  });
  assert.deepEqual(await validationHook({ workspace: root }), {
    status: "disabled",
  });
  assert.deepEqual(fs.readdirSync(root), before);
});
test("显式格式入口仍校验范围、有超时并报告真实失败", async (t) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "bec-format-"));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const stage = {
    id: "format",
    phase: "format" as const,
    executable: process.execPath,
    args: ["-e", "process.exit(3)"],
    cwd: root,
    timeoutMs: 2000,
    required: true,
  };
  assert.equal(
    (
      (await formatHook({ workspace: root, enabled: true, stage })) as {
        exitCode: number;
      }
    ).exitCode,
    1,
  );
  await assert.rejects(
    formatHook({
      workspace: root,
      enabled: true,
      stage: { ...stage, cwd: path.dirname(root) },
    }),
    /边界|范围/,
  );
  await assert.rejects(
    formatHook({ workspace: root, enabled: true }),
    /入口|指定/,
  );
});
