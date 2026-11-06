import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { LANGUAGES } from "../../src/project/languages/registry.js";
import { probeTool } from "../../src/project/toolchain.js";
import { inspectProject } from "../../src/project/discover.js";
function project(
  t: { after(fn: () => void): void },
  files: Record<string, string>,
) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "语言工具 space "));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  for (const [relative, body] of Object.entries(files)) {
    const file = path.join(root, relative);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, body);
  }
  return inspectProject({ workspace: root }).projects[0];
}
test("六语言注册表与各自规范入口准确", () => {
  assert.deepEqual(Object.keys(LANGUAGES).sort(), [
    "c",
    "cpp",
    "go",
    "java",
    "python",
    "rust",
  ]);
  for (const module of Object.values(LANGUAGES))
    assert.ok(module.skillIds.includes(`bec-${module.id}-project-standard`));
});
test("Cargo 候选禁止联网、改锁和自动安装工具链", (t) => {
  const p = project(t, { "Cargo.toml": "[package]" }),
    stages = LANGUAGES.rust.suggest(p);
  assert.ok(stages.some((s) => s.phase === "test"));
  for (const s of stages) {
    assert.equal(s.env?.RUSTUP_AUTO_INSTALL, "0");
    if (s.phase !== "format") {
      assert.ok(s.args.includes("--offline"));
      assert.ok(s.args.includes("--locked"));
    }
  }
  assert.ok(stages.find((s) => s.phase === "format")?.args.includes("--check"));
});
test("Go 格式只检查且测试禁用自动工具链和模块下载", (t) => {
  const p = project(t, { "go.mod": "module example.test" }),
    stages = LANGUAGES.go.suggest(p);
  assert.ok(
    stages.some(
      (s) =>
        s.executable === "gofmt" &&
        s.args.includes("-l") &&
        !s.args.includes("-w"),
    ),
  );
  const testing = stages.find((s) => s.phase === "test")!;
  assert.equal(testing.env?.GOPROXY, "off");
  assert.equal(testing.env?.GOTOOLCHAIN, "local");
  assert.ok(testing.args.includes("-json"));
  assert.ok(testing.args.includes("-mod=readonly"));
});
test("Java 多入口保留候选且 wrapper 不被自动启动", (t) => {
  const p = project(t, {
      "pom.xml": "<project/>",
      "build.gradle": "plugins {}",
    }),
    stages = LANGUAGES.java.suggest(p);
  assert.ok(
    stages.some((s) => s.executable === "mvn" && s.args.includes("-o")),
  );
  assert.ok(
    stages.some(
      (s) => s.executable === "gradle" && s.args.includes("--offline"),
    ),
  );
  assert.ok(
    stages
      .find((s) => s.id === "java:gradle:test")
      ?.args.includes("--rerun-tasks"),
  );
  fs.writeFileSync(path.join(p.root, "mvnw"), "echo 不得自动启动下载");
  assert.ok(
    !LANGUAGES.java
      .suggest(p)
      .some((s) => s.executable === "mvn" || s.executable.includes("mvnw")),
  );
});
test("Python 遵循已配置 Ruff、pytest 和 mypy，不安装包", (t) => {
  const p = project(t, {
    "pyproject.toml":
      '[tool.ruff]\nline-length=100\n[tool.pytest.ini_options]\ntestpaths=["tests"]\n[tool.mypy]\nstrict=true',
  });
  const stages = LANGUAGES.python.suggest(p);
  assert.ok(
    stages.some((s) => s.executable === "ruff" && s.args.includes("--check")),
  );
  assert.ok(stages.some((s) => s.args.includes("pytest")));
  assert.ok(stages.some((s) => s.args.includes("mypy")));
  assert.ok(
    stages.every(
      (s) => !s.args.some((arg) => arg === "pip" || arg === "install"),
    ),
  );
});
test("native 只有 CMake 时无默认命令，有已配置 preset 才提出候选", (t) => {
  const p = project(t, { "CMakeLists.txt": "project(a LANGUAGES C CXX)" });
  assert.deepEqual(LANGUAGES.c.suggest(p), []);
  assert.deepEqual(LANGUAGES.cpp.suggest(p), []);
  fs.mkdirSync(path.join(p.root, "build/debug"), { recursive: true });
  fs.writeFileSync(path.join(p.root, "build/debug/CMakeCache.txt"), "cache");
  fs.writeFileSync(
    path.join(p.root, "CMakePresets.json"),
    JSON.stringify({
      version: 3,
      configurePresets: [
        { name: "debug", binaryDir: "${sourceDir}/build/debug" },
      ],
      buildPresets: [{ name: "debug", configurePreset: "debug" }],
      testPresets: [{ name: "debug", configurePreset: "debug" }],
    }),
  );
  const stages = LANGUAGES.cpp.suggest(p);
  assert.equal(stages.length, 2);
  assert.ok(stages.every((s) => s.args.includes("--preset")));
});
test("工具版本探测只运行明确版本参数并报告缺失", () => {
  assert.equal(probeTool(process.execPath, ["--version"]).available, true);
  assert.equal(
    probeTool("backend-craft-definitely-missing", ["--version"]).available,
    false,
  );
  assert.equal(
    probeTool(process.execPath, ["-e", "throw new Error()"]).available,
    false,
  );
});
