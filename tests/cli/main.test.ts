import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { main, type CliIO } from "../../src/cli.js";
import { doctor } from "../../src/cli/runtime.js";
import { createInstallContext } from "../../src/install/paths.js";
function fixture(t: { after(fn: () => void): void }) {
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), "bec-cli-"));
  t.after(() => fs.rmSync(cwd, { recursive: true, force: true }));
  const output: string[] = [],
    errors: string[] = [],
    io: CliIO = {
      cwd,
      home: path.join(cwd, "home"),
      productRoot: path.resolve("."),
      env: {},
      stdout: (v) => output.push(v),
      stderr: (v) => errors.push(v),
    };
  return { cwd, output, errors, io };
}
test("help/version 不依赖工程，未知参数、平台和自管理命令不写入", async (t) => {
  const f = fixture(t);
  assert.equal(
    await main(["--version"], { ...f.io, cwd: path.join(f.cwd, "absent") }),
    0,
  );
  assert.match(f.output.join(""), /1\.0\.0/);
  for (const args of [
    ["runtime", "install", "unknown"],
    ["runtime", "install", "claude", "--force"],
    ["runtime", "install", "claude", "--local", "--global"],
    ["update"],
    ["uninstall"],
  ])
    assert.equal(await main(args, f.io), 2);
  assert.deepEqual(fs.readdirSync(f.cwd), []);
});
test("inspect/matrix stdout 各是单个 JSON，最近子项目不混入兄弟工程", async (t) => {
  const f = fixture(t);
  fs.mkdirSync(path.join(f.cwd, "api"));
  fs.writeFileSync(
    path.join(f.cwd, "api/go.mod"),
    "module example.local/api\ngo 1.24\n",
  );
  assert.equal(await main(["project", "inspect", "api", "--json"], f.io), 0);
  const value = JSON.parse(f.output.join(""));
  assert.deepEqual(value.projects[0].languages, ["go"]);
  assert.equal(f.errors.length, 0);
  f.output.length = 0;
  assert.equal(await main(["matrix", "--json"], f.io), 0);
  assert.equal(JSON.parse(f.output.join("")).length, 15);
});
function configure(f: ReturnType<typeof fixture>, body: string) {
  fs.writeFileSync(
    path.join(f.cwd, ".backend-craft.json"),
    JSON.stringify({
      schemaVersion: 1,
      projects: [
        {
          root: ".",
          languages: ["python"],
          stages: [
            {
              id: "test",
              phase: "test",
              executable: process.execPath,
              args: ["-e", body],
              env: { TOKEN: "dont-print-this" },
              timeoutMs: 5000,
              required: true,
            },
          ],
        },
      ],
    }),
  );
  fs.writeFileSync(
    path.join(f.cwd, "pyproject.toml"),
    '[project]\nname="fixture"\nversion="0.1"\n',
  );
}
test("validate dry-run 不执行并脱敏，实际结果不回显配置秘密", async (t) => {
  const f = fixture(t),
    marker = path.join(f.cwd, "ran");
  configure(
    f,
    `require('fs').writeFileSync(${JSON.stringify(marker)},'yes');console.log('backend-craft:tests=1')`,
  );
  assert.equal(await main(["validate", "--dry-run", "--json"], f.io), 0);
  assert.equal(fs.existsSync(marker), false);
  assert.equal(JSON.parse(f.output.join("")).status, "planned");
  assert.doesNotMatch(f.output.join(""), /dont-print-this|writeFileSync/);
  f.output.length = 0;
  assert.equal(await main(["validate", "--json"], f.io), 0);
  assert.equal(JSON.parse(f.output.join("")).exitCode, 0);
  assert.ok(fs.existsSync(marker));
  assert.doesNotMatch(f.output.join("") + f.errors.join(""), /dont-print-this/);
});
test("validate 失败、零测试、缺工具、必需 integration 跳过均非成功", async (t) => {
  const f = fixture(t);
  for (const [body, code] of [
    ["process.exit(3)", 1],
    ["console.log('zero')", 1],
    ["console.log('backend-craft:tests=1')", 0],
  ] as const) {
    configure(f, body);
    f.output.length = 0;
    assert.equal(await main(["validate", "--json"], f.io), code);
  }
  const config = JSON.parse(
    fs.readFileSync(path.join(f.cwd, ".backend-craft.json"), "utf8"),
  );
  config.projects[0].stages[0].executable = "bec-tool-that-does-not-exist";
  fs.writeFileSync(
    path.join(f.cwd, ".backend-craft.json"),
    JSON.stringify(config),
  );
  assert.equal(await main(["validate", "--json"], f.io), 2);
  config.projects[0].stages[0].executable = process.execPath;
  config.projects[0].stages[0].integration = true;
  fs.writeFileSync(
    path.join(f.cwd, ".backend-craft.json"),
    JSON.stringify(config),
  );
  assert.equal(await main(["validate", "--json"], f.io), 2);
});
test("list/doctor 不把 F 清单当成 B，安装后区分资源完整和启用未知", async (t) => {
  const f = fixture(t);
  fs.mkdirSync(path.join(f.cwd, ".claude"));
  fs.writeFileSync(
    path.join(f.cwd, ".claude/frontend-craft.manifest.json"),
    "{}",
  );
  await main(["runtime", "list", "--json"], f.io);
  assert.deepEqual(JSON.parse(f.output.join("")), []);
  f.output.length = 0;
  assert.equal(await main(["runtime", "install", "claude", "--json"], f.io), 0);
  f.output.length = 0;
  assert.equal(await main(["doctor", "claude", "--json"], f.io), 0);
  const report = JSON.parse(f.output.join(""));
  assert.equal(report.enabled, "unknown");
  assert.equal(report.filesHealthy, true);
  const common = path.join(f.cwd, ".claude/skills/cc-tdd-methodology/SKILL.md"),
    original = fs.readFileSync(common);
  fs.unlinkSync(common);
  f.output.length = 0;
  assert.equal(await main(["doctor", "claude", "--json"], f.io), 2);
  assert.equal(JSON.parse(f.output.join("")).filesHealthy, false);
  fs.writeFileSync(common, original);
  f.output.length = 0;
  assert.equal(
    await main(["runtime", "uninstall", "claude", "--json"], f.io),
    0,
  );
});
test("已有中文安装在省略 --lang 更新时保持原语言", async (t) => {
  const f = fixture(t);
  assert.equal(
    await main(
      ["runtime", "install", "claude", "--lang", "zh-CN", "--json"],
      f.io,
    ),
    0,
  );
  f.output.length = 0;
  assert.equal(await main(["runtime", "update", "claude", "--json"], f.io), 0);
  const manifest = JSON.parse(
    fs.readFileSync(
      path.join(f.cwd, ".claude/backend-craft.manifest.json"),
      "utf8",
    ),
  );
  assert.equal(manifest.language, "zh-CN");
  assert.equal(manifest.common.language, "zh-CN");
});
test("从父目录指定子目录或子文件优先读取最近工程配置，根多项目配置仍可显式运行", async (t) => {
  const f = fixture(t),
    child = path.join(f.cwd, "child"),
    other = path.join(f.cwd, "other");
  for (const dir of [child, other]) {
    fs.mkdirSync(dir);
    fs.writeFileSync(
      path.join(dir, "pyproject.toml"),
      '[project]\nname="fixture"\nversion="0.1"\n',
    );
    fs.writeFileSync(path.join(dir, "module.py"), "value=1\n");
  }
  const stage = (id: string) => ({
    id,
    phase: "test",
    executable: process.execPath,
    args: ["-e", "console.log('backend-craft:tests=1')"],
  });
  fs.writeFileSync(
    path.join(child, ".backend-craft.json"),
    JSON.stringify({
      schemaVersion: 1,
      projects: [{ root: ".", stages: [stage("child-selected")] }],
    }),
  );
  for (const target of ["child", "child/module.py"]) {
    f.output.length = 0;
    assert.equal(
      await main(["validate", target, "--dry-run", "--json"], f.io),
      0,
      f.errors.join(""),
    );
    const plan = JSON.parse(f.output.join("")).plan;
    assert.equal(plan.stages[0].id, "child-selected");
    assert.equal(plan.stages[0].cwd, child);
  }
  f.output.length = 0;
  assert.equal(
    await main(["validate", "--dry-run", "--json"], { ...f.io, cwd: child }),
    0,
  );
  assert.equal(
    JSON.parse(f.output.join("")).plan.stages[0].id,
    "child-selected",
  );
  fs.writeFileSync(
    path.join(f.cwd, ".backend-craft.json"),
    JSON.stringify({
      schemaVersion: 1,
      projects: [
        { root: "child", stages: [{ ...stage("root-child"), cwd: "child" }] },
        { root: "other", stages: [{ ...stage("root-other"), cwd: "other" }] },
      ],
    }),
  );
  f.output.length = 0;
  assert.equal(await main(["validate", "--dry-run", "--json"], f.io), 0);
  assert.deepEqual(
    JSON.parse(f.output.join("")).plan.stages.map((s: { id: string }) => s.id),
    ["root-child", "root-other"],
  );
  f.output.length = 0;
  assert.equal(await main(["validate", "child/module.py", "--json"], f.io), 0);
  assert.equal(JSON.parse(f.output.join("")).results[0].id, "child-selected");
  f.output.length = 0;
  assert.equal(
    await main(["validate", "other", "--dry-run", "--json"], f.io),
    0,
  );
  assert.equal(JSON.parse(f.output.join("")).plan.stages[0].id, "root-other");
  fs.writeFileSync(path.join(f.cwd, ".backend-craft.json"), "{");
  f.output.length = 0;
  assert.equal(
    await main(["validate", "child", "--dry-run", "--json"], f.io),
    0,
  );
});

test("doctor 检查共享入口自身片段，用户及前端正文变动不误报", async (t) => {
  const f = fixture(t);
  assert.equal(await main(["runtime", "install", "claude", "--json"], f.io), 0);
  const ctx = createInstallContext({
      productRoot: path.resolve("."),
      cwd: f.cwd,
      home: f.io.home,
      runtime: "claude",
      env: {},
    }),
    file = path.join(ctx.baseDir, "CLAUDE.md"),
    original = fs.readFileSync(file, "utf8");
  fs.unlinkSync(file);
  assert.equal(doctor(ctx).filesHealthy, false);
  fs.writeFileSync(
    file,
    original.replace(
      /<!-- backend-craft:start -->[\s\S]*?<!-- backend-craft:end -->/,
      "",
    ),
  );
  assert.equal(doctor(ctx).filesHealthy, false);
  fs.writeFileSync(
    file,
    original.replace("# Backend engineering rules", "# user changed"),
  );
  assert.equal(doctor(ctx).filesHealthy, false);
  fs.writeFileSync(
    file,
    "用户正文\n<!-- frontend-craft:start -->\nF\n<!-- frontend-craft:end -->\n" +
      original +
      "\n新增正文",
  );
  assert.equal(doctor(ctx).filesHealthy, true);
});
