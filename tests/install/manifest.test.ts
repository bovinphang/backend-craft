import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import type { InstallContext } from "../../src/install/types.js";
import type { RuntimeAdapter } from "../../src/install/registry.js";
import {
  installRuntime,
  uninstallRuntime,
} from "../../src/install/lifecycle.js";
import {
  manifestPath,
  readManifest,
  writeManaged,
} from "../../src/install/manifest.js";
import { MANIFEST_CODEC } from "../../src/install/manifest-codec.js";
import { toProductContext } from "../../src/product.js";
function fixture(t: { after(fn: () => void): void }): InstallContext {
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), "bec-manifest-"));
  t.after(() => fs.rmSync(cwd, { recursive: true, force: true }));
  return {
    productRoot: path.resolve("dist/package"),
    contentRoot: path.resolve("dist/package"),
    cwd,
    home: path.join(cwd, "home"),
    baseDir: path.join(cwd, ".codex"),
    runtime: "codex",
    isGlobal: false,
    language: "en",
    mode: "install",
    dryRun: false,
  };
}
function adapter(
  ctx: InstallContext,
  files: Array<[string, string]>,
): RuntimeAdapter {
  return {
    id: ctx.runtime,
    capabilities: {
      skills: false,
      agents: false,
      commands: false,
      hooks: false,
      rules: false,
    },
    async plan(planning) {
      for (const [file, body] of files)
        writeManaged(planning, file, Buffer.from(body));
    },
  };
}
const install = (ctx: InstallContext, file: string, body: string) =>
  installRuntime(ctx, adapter(ctx, [[file, body]]));
test("legacy backend manifest records only private files and repeated installs are unchanged", async (t) => {
  const ctx = fixture(t),
    file = path.join(ctx.baseDir, "skills/bec-example/SKILL.md");
  await installRuntime(
    { ...ctx, dryRun: true },
    adapter(ctx, [[file, "owned"]]),
  );
  assert.equal(fs.existsSync(ctx.baseDir), false);
  await install(ctx, file, "owned");
  const manifest = readManifest(manifestPath(ctx))!;
  assert.equal(path.basename(manifestPath(ctx)), "backend-craft.manifest.json");
  assert.equal(manifest.product, "@bovinphang/backend-craft");
  assert.equal(manifest.files.length, 1);
  assert.deepEqual((await install(ctx, file, "owned")).changed, []);
});
test("modified and unknown files are preserved and never reclaimed", async (t) => {
  const ctx = fixture(t),
    file = path.join(ctx.baseDir, "bec-example.md");
  await install(ctx, file, "owned");
  fs.writeFileSync(file, "user edit");
  assert.ok(
    !(
      await install({ ...ctx, mode: "update" }, file, "replacement")
    ).changed.includes(file),
  );
  assert.equal(fs.readFileSync(file, "utf8"), "user edit");
  const unknown = path.join(ctx.baseDir, "bec-user.md");
  fs.writeFileSync(unknown, "user");
  await install(ctx, unknown, "replace");
  assert.ok(
    !readManifest(manifestPath(ctx))!.files.some((f) =>
      f.path.endsWith("bec-user.md"),
    ),
  );
});
test("malformed, escaping and mismatched legacy identities are rejected", async (t) => {
  const ctx = fixture(t),
    file = path.join(ctx.baseDir, "bec-example.md");
  await install(ctx, file, "owned");
  await assert.rejects(
    install({ ...ctx, isGlobal: true }, file, "bad"),
    /身份|scope|identity/i,
  );
  const manifest = readManifest(manifestPath(ctx))!;
  fs.writeFileSync(
    manifestPath(ctx),
    JSON.stringify({
      ...manifest,
      files: [{ root: "cwd", path: "../bec-escape", hash: "0".repeat(64) }],
    }),
  );
  assert.throws(() => readManifest(manifestPath(ctx)), /路径|越界/);
  for (const body of ["bad json", "null"]) {
    fs.writeFileSync(manifestPath(ctx), body);
    assert.throws(() => readManifest(manifestPath(ctx)), /清单/);
  }
});
test("internal junctions and foreign/shared files cannot become private backend files", async (t) => {
  const ctx = fixture(t),
    outside = path.join(ctx.cwd, "outside");
  fs.mkdirSync(outside);
  fs.mkdirSync(ctx.baseDir);
  fs.symlinkSync(
    outside,
    path.join(ctx.baseDir, "linked"),
    process.platform === "win32" ? "junction" : "dir",
  );
  await assert.rejects(
    install(ctx, path.join(ctx.baseDir, "linked/bec-file.md"), "bad"),
    /链接|link/i,
  );
  for (const name of ["fec-file.md", "cc-file.md", "AGENTS.md"])
    await assert.rejects(
      install(ctx, path.join(ctx.baseDir, name), "bad"),
      /命名|前端|公共|共享|namespace/i,
    );
  assert.deepEqual(fs.readdirSync(outside), []);
});
test("partial uninstall deletes only unchanged private files and retains ownership", async (t) => {
  const ctx = fixture(t),
    a = path.join(ctx.baseDir, "bec-a.md"),
    b = path.join(ctx.baseDir, "bec-b.md"),
    ad = adapter(ctx, [
      [a, "a"],
      [b, "b"],
    ]);
  await installRuntime(ctx, ad);
  assert.equal(readManifest(manifestPath(ctx))!.files.length, 2);
  fs.writeFileSync(b, "user");
  const result = await uninstallRuntime(ctx, ad);
  assert.equal(result.status, "partial");
  assert.deepEqual(result.preserved, [b]);
  assert.equal(fs.existsSync(a), false);
  assert.equal(fs.readFileSync(b, "utf8"), "user");
  assert.equal(readManifest(manifestPath(ctx))!.files.length, 1);
});
test("backend codec roundtrips the existing manifest schema without changing file roots", async (t) => {
  const ctx = fixture(t),
    file = path.join(ctx.baseDir, "bec-example.md");
  await install(ctx, file, "owned");
  const bytes = fs.readFileSync(manifestPath(ctx)),
    state = MANIFEST_CODEC.decode(bytes, toProductContext(ctx));
  assert.equal(state.files[0].path, file);
  assert.deepEqual(
    JSON.parse(MANIFEST_CODEC.encode(state, toProductContext(ctx)).toString()),
    JSON.parse(bytes.toString()),
  );
});
