import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { inspectProject } from "../../src/project/discover.js";
function fixture(
  t: { after(fn: () => void): void },
  files: Record<string, string>,
) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "后端工程 space "));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  for (const [file, body] of Object.entries(files)) {
    const full = path.join(root, file);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, body);
  }
  return fs.realpathSync(root);
}
test("识别六种语言并将 C 与 C++ 分开", (t) => {
  const root = fixture(t, {
    "rust/Cargo.toml": '[package]\nname="sample"',
    "go/go.mod": "module example.test",
    "java/pom.xml": "<project/>",
    "python/pyproject.toml": '[project]\nname="example"',
    "c/CMakeLists.txt": "project(example LANGUAGES C)",
    "cpp/CMakeLists.txt": "project(example LANGUAGES CXX)",
  });
  const report = inspectProject({ workspace: root });
  assert.equal(report.projects.length, 6);
  const languages = Object.fromEntries(
    report.projects.map((p) => [path.basename(p.root), p.languages]),
  );
  assert.deepEqual(languages, {
    c: ["c"],
    cpp: ["cpp"],
    go: ["go"],
    java: ["java"],
    python: ["python"],
    rust: ["rust"],
  });
  assert.equal(report.truncated, false);
});
test("任务路径只选择最近子项目，父与兄弟语言不串入上下文", (t) => {
  const root = fixture(t, {
    "Cargo.toml": "[workspace]",
    "lib/src/lib.rs": "pub fn f(){}",
    "apps/python/pyproject.toml": "[project]",
    "apps/python/main.py": "pass",
    "apps/go/go.mod": "module example.test",
    "apps/go/main.go": "package main",
  });
  const all = inspectProject({ workspace: root });
  assert.deepEqual(all.projects.find((p) => p.root === root)?.languages, [
    "rust",
  ]);
  const one = inspectProject({
    workspace: root,
    taskPath: path.join(root, "apps/python/main.py"),
  });
  assert.equal(one.projects.length, 1);
  assert.deepEqual(one.projects[0].languages, ["python"]);
  assert.equal(one.projects[0].root, path.join(root, "apps/python"));
});
test("只有 CMake 文件不能猜定 C++，实际混合源码保留两种语言", (t) => {
  const root = fixture(t, {
    "unknown/CMakeLists.txt":
      "# project(secret LANGUAGES CXX)\nproject(example)",
    "mixed/Makefile": "all:\n\t@echo noexec",
    "mixed/src/a.c": "int f(void){return 0;}",
    "mixed/src/b.cpp": "int g(){return 0;}",
  });
  const report = inspectProject({ workspace: root });
  const unknown = report.projects.find(
    (p) => path.basename(p.root) === "unknown",
  )!;
  assert.deepEqual(unknown.languages, []);
  assert.equal(unknown.ambiguous, true);
  assert.deepEqual(
    report.projects.find((p) => path.basename(p.root) === "mixed")?.languages,
    ["c", "cpp"],
  );
});
test("静态发现不执行构建或 Python，跳过敏感文件、依赖和链接", (t) => {
  const root = fixture(t, {
    "pyproject.toml": "[project]",
    "setup.py": 'raise Exception("不得执行")',
    "node_modules/foreign/Cargo.toml": "[package]",
    ".env": "PRIVATE_VALUE=never-output",
    ".git/hidden/go.mod": "module hidden",
    "build/generated.cpp": "int x;",
  });
  const external = fixture(t, { "go.mod": "module outside" });
  fs.symlinkSync(
    external,
    path.join(root, "outside"),
    process.platform === "win32" ? "junction" : "dir",
  );
  const before = fs.readdirSync(root).sort();
  const report = inspectProject({ workspace: root });
  assert.equal(report.projects.length, 1);
  assert.deepEqual(report.projects[0].languages, ["python"]);
  assert.doesNotMatch(
    JSON.stringify(report),
    /PRIVATE_VALUE|never-output|foreign|generated.cpp/,
  );
  assert.deepEqual(fs.readdirSync(root).sort(), before);
});
test("扫描数量和深度截断必须报告，越界 taskPath 拒绝", (t) => {
  const root = fixture(t, {
    "one/go.mod": "module one",
    "two/pyproject.toml": "[project]",
  });
  assert.equal(
    inspectProject({ workspace: root, maxEntries: 1 }).truncated,
    true,
  );
  const report = inspectProject({ workspace: root, maxDepth: 0 });
  assert.equal(report.truncated, true);
  assert.ok(report.warnings.length > 0);
  assert.throws(
    () => inspectProject({ workspace: root, taskPath: path.dirname(root) }),
    /边界|越界/,
  );
});
test("过大清单不读取为有效证据，扫描参数非法不默默放宽", (t) => {
  const root = fixture(t, {
    "CMakeLists.txt": "#".repeat(300000) + "\nproject(foo LANGUAGES CXX)",
  });
  const report = inspectProject({ workspace: root });
  assert.equal(report.projects[0].ambiguous, true);
  assert.ok(report.warnings.length > 0);
  assert.throws(
    () => inspectProject({ workspace: root, maxEntries: -1 }),
    /参数/,
  );
});
