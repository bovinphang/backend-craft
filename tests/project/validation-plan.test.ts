import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { readProjectConfig } from "../../src/project/config.js";
import { planValidation } from "../../src/project/validation-plan.js";
import { inspectProject } from "../../src/project/discover.js";
function fixture(
  t: { after(fn: () => void): void },
  files: Record<string, string> = {},
) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "验证计划 space "));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  for (const [relative, body] of Object.entries(files)) {
    const file = path.join(root, relative);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, body);
  }
  return fs.realpathSync(root);
}
const stage = (id = "explicit") => ({
  id,
  phase: "build",
  executable: process.execPath,
  args: ["-e", "process.exit(0)"],
  cwd: ".",
});
const config = (root: string, value: unknown): void =>
  fs.writeFileSync(
    path.join(root, ".backend-craft.json"),
    JSON.stringify(value),
  );
test("显式配置优先且 cwd/root 转为工作区绝对路径", (t) => {
  const root = fixture(t, {
    "go.mod": "module example.test",
    Makefile: "test:\n\tgo test ./...",
  });
  config(root, {
    schemaVersion: 1,
    projects: [{ root: ".", stages: [stage()] }],
  });
  const parsed = readProjectConfig(root)!;
  assert.ok(parsed);
  assert.equal(parsed.projects[0].root, root);
  assert.equal(parsed.projects[0].stages[0].cwd, root);
  const planned = planValidation(inspectProject({ workspace: root }), parsed);
  assert.equal(planned.stages.length, 1);
  assert.equal(planned.stages[0].id, "explicit");
  assert.equal(planned.problems.length, 0);
});
test("现有 Make 测试任务优先于语言默认候选", (t) => {
  const root = fixture(t, {
    "go.mod": "module example.test",
    Makefile: "test:\n\tgo test ./...\nbuild:\n\tgo build ./...",
  });
  const planned = planValidation(inspectProject({ workspace: root }));
  assert.ok(
    planned.stages.some(
      (s) => path.basename(s.executable).replace(/\.exe$/, "") === "make",
    ),
  );
  assert.ok(!planned.stages.some((s) => s.id.startsWith("go:")));
});
test("未知字段、字符串命令、越界路径和重复阶段拒绝", (t) => {
  const root = fixture(t);
  for (const value of [
    { schemaVersion: 1, unknown: true, projects: [] },
    { schemaVersion: 1, projects: [{ root: ".", stages: ["npm test"] }] },
    { schemaVersion: 1, projects: [{ root: "../outside", stages: [stage()] }] },
    {
      schemaVersion: 1,
      projects: [{ root: ".", stages: [{ ...stage(), cwd: "../" }] }],
    },
    {
      schemaVersion: 1,
      projects: [{ root: ".", stages: [{ ...stage(), shell: true }] }],
    },
    { schemaVersion: 1, projects: [{ root: ".", stages: [stage(), stage()] }] },
    {
      schemaVersion: 1,
      projects: [{ root: ".", stages: [{ ...stage(), timeoutMs: 999 }] }],
    },
  ]) {
    config(root, value);
    assert.throws(
      () => readProjectConfig(root),
      /配置|路径|越界|重复|字段|阶段|超时/,
    );
  }
});
test("配置链接和工作目录内部链接拒绝", (t) => {
  const root = fixture(t),
    outside = fixture(t);
  fs.symlinkSync(
    outside,
    path.join(root, "linked"),
    process.platform === "win32" ? "junction" : "dir",
  );
  config(root, {
    schemaVersion: 1,
    projects: [{ root: ".", stages: [{ ...stage(), cwd: "linked" }] }],
  });
  assert.throws(() => readProjectConfig(root), /链接/);
});
test("扫描歧义、截断、多项目和空阶段不能报告可执行成功", (t) => {
  const root = fixture(t, {
    "one/CMakeLists.txt": "project(a)",
    "two/go.mod": "module test",
  });
  const all = planValidation(inspectProject({ workspace: root }));
  assert.ok(all.problems.length > 0);
  const unknown = planValidation(
    inspectProject({ workspace: root, taskPath: path.join(root, "one") }),
  );
  assert.ok(unknown.problems.length > 0);
  const limited = planValidation(
    inspectProject({ workspace: root, maxEntries: 1 }),
  );
  assert.ok(limited.problems.length > 0);
  config(root, { schemaVersion: 1, projects: [{ root: ".", stages: [] }] });
  assert.throws(() => readProjectConfig(root), /阶段/);
});
test("多种 Java 构建入口不同时执行，缺必需工具在计划中报告", (t) => {
  const root = fixture(t, {
    "pom.xml": "<project/>",
    "build.gradle": "plugins {}",
  });
  const planned = planValidation(inspectProject({ workspace: root }));
  assert.ok(planned.problems.some((p) => /多个|歧义/.test(p)));
  config(root, {
    schemaVersion: 1,
    projects: [
      {
        root: ".",
        stages: [
          { ...stage(), executable: "backend-craft-definitely-missing" },
        ],
      },
    ],
  });
  const missing = planValidation(
    inspectProject({ workspace: root }),
    readProjectConfig(root),
  );
  assert.ok(missing.problems.some((p) => /工具/.test(p)));
});
test("integration 默认跳过，只有显式启用才执行且环境不回显", (t) => {
  const root = fixture(t, { "pyproject.toml": "[project]" });
  const value = {
    schemaVersion: 1,
    enableIntegration: false,
    projects: [
      {
        root: ".",
        stages: [
          {
            ...stage(),
            integration: true,
            required: false,
            env: { PRIVATE_TOKEN: "not-for-output" },
          },
        ],
      },
    ],
  };
  config(root, value);
  const planned = planValidation(
    inspectProject({ workspace: root }),
    readProjectConfig(root),
  );
  assert.match(planned.stages[0].skipReason!, /integration/);
  value.enableIntegration = true;
  config(root, value);
  assert.equal(
    planValidation(inspectProject({ workspace: root }), readProjectConfig(root))
      .stages[0].skipReason,
    undefined,
  );
});
test("配置读取与验证计划完全只读", (t) => {
  const root = fixture(t, { "go.mod": "module test" });
  const before = fs.readdirSync(root);
  assert.equal(readProjectConfig(root), undefined);
  planValidation(inspectProject({ workspace: root }));
  assert.deepEqual(fs.readdirSync(root), before);
});
