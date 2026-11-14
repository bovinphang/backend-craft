import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { inspect, inspectCapabilities } from "../../src/cli/inspect.js";
test("legacy inspect file positional still selects nearest project and recommendations", (t) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "bec-file-inspect-"));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.mkdirSync(path.join(root, "lib/src"), { recursive: true });
  fs.writeFileSync(path.join(root, "lib/Cargo.toml"), '[package]\nname="lib"');
  fs.writeFileSync(path.join(root, "lib/src/lib.rs"), "");
  const legacy = inspect(root, "lib/src/lib.rs");
  const current = inspectCapabilities(
    root,
    "lib/src/lib.rs",
    path.resolve("dist/package"),
  );
  assert.deepEqual(current.projects, legacy.projects);
  assert.ok(
    current.recommendations.some((r) => r.id === "cc-rust-project-standard"),
  );
});
test("legacy positional tasks preserve missing-file, child-directory and external-root semantics", (t) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "bec-old-task-")),
    outside = fs.mkdtempSync(path.join(os.tmpdir(), "bec-outside-task-"));
  t.after(() => {
    fs.rmSync(root, { recursive: true, force: true });
    fs.rmSync(outside, { recursive: true, force: true });
  });
  fs.mkdirSync(path.join(root, "src"), { recursive: true });
  fs.writeFileSync(path.join(root, "Cargo.toml"), '[package]\nname="root"');
  fs.writeFileSync(path.join(outside, "go.mod"), "module test");
  fs.writeFileSync(path.join(outside, "main.go"), "");
  for (const target of [
    "src/new.rs",
    "src",
    outside,
    path.join(outside, "main.go"),
  ])
    assert.deepEqual(
      inspectCapabilities(root, target, path.resolve("dist/package")).projects,
      inspect(root, target).projects,
    );
  const scoped = inspectCapabilities(
    root,
    ".",
    path.resolve("dist/package"),
    "src/new.rs",
    "native-memory",
  );
  assert.deepEqual(scoped.projects[0].languages, ["rust"]);
});
test("legacy positional tasks through a declared root junction keep canonical recommendations", (t) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "bec-alias-task-")),
    alias = root + "-alias";
  t.after(() => {
    fs.rmSync(alias, { recursive: true, force: true });
    fs.rmSync(root, { recursive: true, force: true });
  });
  fs.writeFileSync(path.join(root, "Cargo.toml"), '[package]\nname="root"');
  fs.symlinkSync(
    root,
    alias,
    process.platform === "win32" ? "junction" : "dir",
  );
  assert.deepEqual(
    inspectCapabilities(alias, "src/new.rs", path.resolve("dist/package")).projects,
    inspect(alias, "src/new.rs").projects,
  );
});
