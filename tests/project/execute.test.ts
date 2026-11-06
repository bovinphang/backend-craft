import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";
import { executeValidation } from "../../src/project/execute.js";
import { resolveToolPath } from "../../src/project/toolchain.js";
import type { StageSpec, ValidationPlan } from "../../src/project/types.js";
function fixture(t: { after(fn: () => void): void }) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "执行验证 space "));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  return fs.realpathSync(root);
}
function stage(
  cwd: string,
  id: string,
  body: string,
  phase: StageSpec["phase"] = "test",
): StageSpec {
  return {
    id,
    phase,
    cwd,
    executable: process.execPath,
    args: ["-e", body],
    timeoutMs: 3000,
    required: true,
  };
}
function plan(stages: StageSpec[]): ValidationPlan {
  return { schemaVersion: 1, projects: [], stages, problems: [] };
}
test("真实子进程测试成功且不会回显环境、参数或原始输出", async (t) => {
  const root = fixture(t),
    value = stage(
      root,
      "pass",
      'console.log("backend-craft:tests=1");console.log(process.env.PRIVATE_TOKEN)',
    );
  value.env = { PRIVATE_TOKEN: "secret-test-fixture" };
  const result = await executeValidation(plan([value]));
  assert.equal(result.exitCode, 0);
  assert.equal(result.results[0].status, "passed");
  assert.doesNotMatch(
    JSON.stringify(result),
    /secret-test-fixture|console\.log|PRIVATE_TOKEN/,
  );
});
test("非零退出、缺失工具与零测试各自正确报告", async (t) => {
  const root = fixture(t);
  assert.equal(
    (await executeValidation(plan([stage(root, "fail", "process.exit(7)")])))
      .exitCode,
    1,
  );
  const missing = {
    ...stage(root, "missing", ""),
    executable: "backend-craft-definitely-missing",
  };
  const result = await executeValidation(plan([missing]));
  assert.equal(result.exitCode, 2);
  assert.equal(result.results[0].status, "missing");
  const zero = await executeValidation(
    plan([stage(root, "zero", 'console.log("Ran 0 tests")')]),
  );
  assert.equal(zero.exitCode, 1);
  assert.equal(zero.results[0].status, "failed");
  const unknown = await executeValidation(plan([stage(root, "unknown", "")]));
  assert.equal(unknown.exitCode, 1);
});
test("各测试驱动的实际运行证据与 gofmt 非空输出", async (t) => {
  const root = fixture(t);
  for (const output of [
    "Ran 2 tests",
    "2 passed in 0.1s",
    "Tests run: 1, Failures: 0",
    "test result: ok. 1 passed; 0 failed",
    "100% tests passed, 0 tests failed out of 1",
    '{"Action":"pass","Test":"TestSample"}',
    "# tests 1\n# pass 1\n# skipped 0",
  ]) {
    const result = await executeValidation(
      plan([stage(root, "evidence", `console.log(${JSON.stringify(output)})`)]),
    );
    assert.equal(result.exitCode, 0, output);
  }
  const formatter = {
    ...stage(root, "format", 'console.log("unformatted.go")', "format"),
    executable: process.execPath,
  };
  // A generic format check is responsible for its exit status. gofmt's special status is exercised separately through its exact executable identity.
  const passed = await executeValidation(plan([formatter]));
  assert.equal(passed.exitCode, 0);
});
test("失败后同项目后续阶段跳过，其他项目继续执行", async (t) => {
  const root = fixture(t),
    other = fixture(t);
  const result = await executeValidation(
    plan([
      stage(root, "first", "process.exit(1)"),
      stage(root, "later", 'throw new Error("不得执行")'),
      stage(other, "other", 'console.log("backend-craft:tests=1")'),
    ]),
  );
  assert.deepEqual(
    result.results.map((s) => s.status),
    ["failed", "skipped", "passed"],
  );
  assert.equal(result.exitCode, 1);
});

test("新生成 JUnit 报告可提供运行证据，旧报告不能冒充本次测试", async (t) => {
  const root = fixture(t),
    file = path.join(root, "build/test-results/test/TEST-example.xml");
  const body = `const fs=require('node:fs');fs.mkdirSync(${JSON.stringify(path.dirname(file))},{recursive:true});fs.writeFileSync(${JSON.stringify(file)},'<testsuite tests="1" failures="0"/>');console.log('BUILD SUCCESSFUL');`;
  assert.equal(
    (await executeValidation(plan([stage(root, "junit", body)]))).exitCode,
    0,
  );
  const past = new Date(Date.now() - 60000);
  fs.utimesSync(file, past, past);
  assert.equal(
    (
      await executeValidation(
        plan([stage(root, "stale", 'console.log("BUILD SUCCESSFUL")')]),
      )
    ).exitCode,
    1,
  );
});

test("实际 gofmt 的非空输出即格式检查失败", async (t) => {
  const root = fixture(t),
    tool = resolveToolPath("gofmt", root);
  if (!tool) {
    t.skip("本机未安装 Go 格式工具，语言 CI 应覆盖");
    return;
  }
  fs.writeFileSync(path.join(root, "sample.go"), "package sample;func X(){}");
  const value = {
    ...stage(root, "format", "", "format"),
    executable: tool,
    args: ["-l", "sample.go"],
  };
  const result = await executeValidation(plan([value]));
  assert.equal(result.exitCode, 1);
  assert.match(result.results[0].reason!, /gofmt/);
});

test("报告检查接受 Windows 正斜杠和尾分隔符且不会无限遍历", (t) => {
  const root = fixture(t),
    file = pathToFileURL(path.resolve("src/project/test-evidence.ts")).href;
  const code = `const {hasFreshTestReport}=await import(${JSON.stringify(file)});process.exit(hasFreshTestReport(${JSON.stringify(root.split(path.sep).join("/") + "/")},Date.now())?1:0)`;
  const result = spawnSync(
    process.execPath,
    ["--import", "tsx", "--input-type=module", "-e", code],
    { timeout: 2000, stdio: "pipe" },
  );
  assert.equal(result.status, 0);
});
test("可选 integration 跳过不执行，必需跳过不能假成功", async (t) => {
  const root = fixture(t),
    value = {
      ...stage(root, "integration", 'throw new Error("不得执行")'),
      skipReason: "integration 未开启",
      required: false,
    };
  assert.equal((await executeValidation(plan([value]))).exitCode, 0);
  assert.equal(
    (await executeValidation(plan([{ ...value, required: true }]))).exitCode,
    2,
  );
});
test("超时与取消终止实际进程，过量输出有界失败", async (t) => {
  const root = fixture(t);
  const timed = await executeValidation(
    plan([
      { ...stage(root, "timeout", "setInterval(()=>{},1000)"), timeoutMs: 150 },
    ]),
  );
  assert.equal(timed.results[0].status, "timeout");
  assert.equal(timed.exitCode, 1);
  const abort = new AbortController();
  const execution = executeValidation(
    plan([stage(root, "abort", "setInterval(()=>{},1000)")]),
    { signal: abort.signal },
  );
  setTimeout(() => abort.abort(), 150);
  const cancelled = await execution;
  assert.equal(cancelled.exitCode, 2);
  assert.equal(cancelled.results[0].status, "cancelled");
  const huge = await executeValidation(
    plan([
      stage(
        root,
        "huge",
        'process.stdout.write("x".repeat(2*1024*1024));setInterval(()=>{},1000)',
      ),
    ]),
  );
  assert.equal(huge.results[0].status, "failed");
  assert.match(huge.results[0].reason!, /输出/);
});
test("超时清理本次子进程树而非只结束父进程", async (t) => {
  const root = fixture(t),
    file = path.join(root, "child.pid");
  const body = `const c=require('node:child_process').spawn(process.execPath,['-e','setInterval(()=>{},1000)'],{stdio:'ignore'});require('node:fs').writeFileSync(${JSON.stringify(file)},String(c.pid));setInterval(()=>{},1000);`;
  const result = await executeValidation(
    plan([{ ...stage(root, "tree", body), timeoutMs: 1500 }]),
  );
  assert.equal(result.results[0].status, "timeout");
  const pid = Number(fs.readFileSync(file, "utf8"));
  let alive = true;
  for (let i = 0; i < 30; i++) {
    try {
      process.kill(pid, 0);
    } catch {
      alive = false;
      break;
    }
    await delay(100);
  }
  if (alive) {
    try {
      process.kill(pid, "SIGKILL");
    } catch {}
  } // Do not leak a fixture process if this regression fails.
  assert.equal(alive, false);
});
test("计划有问题不执行，取消后的其他阶段不启动", async (t) => {
  const root = fixture(t),
    marker = path.join(root, "should-not-exist");
  const p = plan([
    stage(
      root,
      "blocked",
      `require('node:fs').writeFileSync(${JSON.stringify(marker)},'bad')`,
      "build",
    ),
  ]);
  p.problems = ["构建入口不明确"];
  assert.equal((await executeValidation(p)).exitCode, 2);
  assert.equal(fs.existsSync(marker), false);
  const controller = new AbortController();
  controller.abort();
  assert.equal(
    (await executeValidation(plan(p.stages), { signal: controller.signal }))
      .results[0].status,
    "cancelled",
  );
  assert.equal(fs.existsSync(marker), false);
});
test(
  "Windows wrapper 参数保持数据边界，不触发第二条命令",
  { skip: process.platform !== "win32" },
  async (t) => {
    const root = fixture(t),
      output = path.join(root, "args.json");
    const capture = path.join(root, "capture.cjs");
    fs.writeFileSync(
      capture,
      'require("node:fs").writeFileSync(process.argv[2],JSON.stringify(process.argv.slice(3)))',
    );
    const wrapper = path.join(root, "tool.cmd");
    fs.writeFileSync(
      wrapper,
      `@"${process.execPath}" "%~dp0capture.cjs" %*\r\n`,
    );
    const args = [output, "a & b", "中文 space", "x|y", "(value)", "100%data"];
    const value = {
      ...stage(root, "wrapper", "", "build"),
      executable: wrapper,
      args,
    };
    const result = await executeValidation(plan([value]));
    assert.equal(result.exitCode, 0);
    assert.deepEqual(
      JSON.parse(fs.readFileSync(output, "utf8")),
      args.slice(1),
    );
  },
);
