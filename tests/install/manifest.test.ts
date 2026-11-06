import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import type { InstallContext } from "../../src/install/types.js";
import { planProductWrites } from "../../src/install/product-plan.js";
import {
  manifestPath,
  readManifest,
  beginManifestSession,
  endManifestSession,
  discardManifestSession,
  writeManaged,
  uninstallManagedFiles,
} from "../../src/install/manifest.js";
function fixture(t: { after(fn: () => void): void }): InstallContext {
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), "后端清单 "));
  t.after(() => fs.rmSync(cwd, { recursive: true, force: true }));
  return {
    productRoot: path.resolve("."),
    contentRoot: path.resolve("."),
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
async function planned(ctx: InstallContext, file: string, body: string) {
  return planProductWrites(async () => {
    beginManifestSession(ctx);
    try {
      writeManaged(file, Buffer.from(body));
      endManifestSession();
    } finally {
      discardManifestSession();
    }
  });
}
function apply(mutations: Awaited<ReturnType<typeof planProductWrites>>) {
  for (const file of mutations) {
    if (file.after === null) fs.unlinkSync(file.path);
    else {
      fs.mkdirSync(path.dirname(file.path), { recursive: true });
      fs.writeFileSync(file.path, file.after);
    }
  }
}
test("后端独立清单只记录自有文件，重复安装无变更", async (t) => {
  const ctx = fixture(t),
    file = path.join(ctx.baseDir, "skills/bec-example/SKILL.md");
  const first = await planned(ctx, file, "owned");
  assert.equal(fs.existsSync(ctx.baseDir), false);
  apply(first);
  assert.equal(path.basename(manifestPath(ctx)), "backend-craft.manifest.json");
  const manifest = readManifest(manifestPath(ctx))!;
  assert.equal(manifest.product, "@bovinphang/backend-craft");
  assert.equal(manifest.files.length, 1);
  assert.equal((await planned(ctx, file, "owned")).length, 0);
});
test("修改与未知文件保留且不能被重新认领", async (t) => {
  const ctx = fixture(t),
    file = path.join(ctx.baseDir, "bec-example.md");
  apply(await planned(ctx, file, "owned"));
  fs.writeFileSync(file, "user edit");
  const updates = await planned(
    { ...ctx, mode: "update" },
    file,
    "replacement",
  );
  assert.ok(!updates.some((m) => m.path === file));
  assert.equal(fs.readFileSync(file, "utf8"), "user edit");
  const unknown = path.join(ctx.baseDir, "bec-user.md");
  fs.writeFileSync(unknown, "user");
  apply(await planned(ctx, unknown, "replace"));
  assert.ok(
    !readManifest(manifestPath(ctx))!.files.some((f) =>
      f.path.endsWith("bec-user.md"),
    ),
  );
});
test("旧记录损坏、越界、前端认领、身份切换均阻断", async (t) => {
  const ctx = fixture(t),
    file = path.join(ctx.baseDir, "bec-example.md");
  apply(await planned(ctx, file, "owned"));
  await assert.rejects(
    planned({ ...ctx, isGlobal: true }, file, "bad"),
    /身份|scope/,
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
  fs.writeFileSync(manifestPath(ctx), "bad json");
  assert.throws(() => readManifest(manifestPath(ctx)), /清单/);
  fs.writeFileSync(manifestPath(ctx), "null");
  assert.throws(() => readManifest(manifestPath(ctx)), /清单/);
});
test("内部 junction 拒绝，前端和公共文件不纳入私有清单", async (t) => {
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
    planned(ctx, path.join(ctx.baseDir, "linked/bec-file.md"), "bad"),
    /链接/,
  );
  for (const name of ["fec-file.md", "cc-file.md", "AGENTS.md"])
    await assert.rejects(
      planned(ctx, path.join(ctx.baseDir, name), "bad"),
      /命名|前端|公共|共享/,
    );
  assert.deepEqual(fs.readdirSync(outside), []);
});
test("卸载只删除未修改的自有文件并保留修改记录", async (t) => {
  const ctx = fixture(t),
    a = path.join(ctx.baseDir, "bec-a.md"),
    b = path.join(ctx.baseDir, "bec-b.md");
  apply(
    await planProductWrites(async () => {
      beginManifestSession(ctx);
      try {
        writeManaged(a, Buffer.from("a"));
        writeManaged(b, Buffer.from("b"));
        endManifestSession();
      } finally {
        discardManifestSession();
      }
    }),
  );
  assert.equal(readManifest(manifestPath(ctx))!.files.length, 2);
  fs.writeFileSync(b, "user");
  const manifest = readManifest(manifestPath(ctx))!;
  let preserved: string[] = [],
    remaining = 0;
  const mutations = await planProductWrites(async () => {
    const result = uninstallManagedFiles(ctx, manifest);
    preserved = result.preserved;
    remaining = result.remaining.length;
  });
  assert.equal(remaining, 1);
  assert.deepEqual(preserved, [b]);
  assert.deepEqual(
    mutations.map((m) => m.path),
    [a],
  );
});
