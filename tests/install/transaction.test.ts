import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import { once } from "node:events";
import type { InstallContext } from "../../src/install/types.js";
import {
  executeProductPlan,
  recoverProductTransaction,
} from "../../src/install/transaction.js";
function fixture(t: { after(fn: () => void): void }): InstallContext {
  const cwd = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "后端事务 space ")),
  );
  t.after(() => fs.rmSync(cwd, { recursive: true, force: true }));
  return {
    productRoot: path.resolve("dist/package"),
    contentRoot: path.resolve("dist/package"),
    cwd,
    home: path.join(cwd, "home"),
    baseDir: path.join(cwd, ".cline"),
    runtime: "cline",
    isGlobal: false,
    language: "en",
    mode: "install",
    dryRun: false,
  };
}
test("无标准 Skill 的产品事务不创建公共引用，dry-run 零写入", async (t) => {
  const ctx = fixture(t),
    file = path.join(ctx.baseDir, "bec-owned.md"),
    mutations = [{ path: file, beforeHash: null, after: Buffer.from("owned") }];
  await executeProductPlan(ctx, mutations, { dryRun: true });
  assert.equal(fs.existsSync(ctx.baseDir), false);
  await executeProductPlan(ctx, mutations);
  assert.equal(fs.readFileSync(file, "utf8"), "owned");
  assert.equal(fs.existsSync(path.join(ctx.cwd, "craft-manifests")), false);
  assert.equal(await recoverProductTransaction(ctx), "clean");
});
test("规划后用户修改、越界或公共认领在落盘前拒绝", async (t) => {
  const ctx = fixture(t),
    file = path.join(ctx.baseDir, "bec-file");
  fs.mkdirSync(ctx.baseDir);
  fs.writeFileSync(file, "user");
  await assert.rejects(
    executeProductPlan(ctx, [
      { path: file, beforeHash: null, after: Buffer.from("bad") },
    ]),
    /修改|冲突/,
  );
  assert.equal(
    fs.existsSync(path.join(ctx.baseDir, ".backend-craft-state")),
    false,
  );
  assert.equal(fs.readFileSync(file, "utf8"), "user");
  await assert.rejects(
    executeProductPlan(ctx, [
      {
        path: path.join(ctx.cwd, "../bec-outside"),
        beforeHash: null,
        after: Buffer.from("bad"),
      },
    ]),
    /边界|越界/,
  );
  await assert.rejects(
    executeProductPlan(ctx, [
      {
        path: path.join(ctx.cwd, "skills/cc-owned/SKILL.md"),
        beforeHash: null,
        after: Buffer.from("bad"),
      },
    ]),
    /公共|认领/,
  );
});
test("产品写入失败回滚已经写出的文件", async (t) => {
  const ctx = fixture(t),
    a = path.join(ctx.baseDir, "bec-a"),
    b = path.join(ctx.baseDir, "bec-b");
  const rename = fs.renameSync;
  t.mock.method(fs, "renameSync", (from: fs.PathLike, to: fs.PathLike) => {
    if (String(to) === b) throw new Error("模拟失败");
    return rename(from, to);
  });
  await assert.rejects(
    executeProductPlan(ctx, [
      { path: a, beforeHash: null, after: Buffer.from("a") },
      { path: b, beforeHash: null, after: Buffer.from("b") },
    ]),
    /模拟失败/,
  );
  assert.equal(fs.existsSync(a), false);
  assert.equal(fs.existsSync(b), false);
});
test("声明根 junction 可用但内部链接仍拒绝", async (t) => {
  const ctx = fixture(t),
    real = path.join(ctx.cwd, "real"),
    outside = path.join(ctx.cwd, "outside");
  fs.mkdirSync(real);
  fs.mkdirSync(outside);
  fs.symlinkSync(
    real,
    ctx.baseDir,
    process.platform === "win32" ? "junction" : "dir",
  );
  await executeProductPlan(ctx, [
    {
      path: path.join(ctx.baseDir, "bec-file"),
      beforeHash: null,
      after: Buffer.from("a"),
    },
  ]);
  assert.equal(fs.readFileSync(path.join(real, "bec-file"), "utf8"), "a");
  fs.symlinkSync(
    outside,
    path.join(real, "link"),
    process.platform === "win32" ? "junction" : "dir",
  );
  await assert.rejects(
    executeProductPlan(ctx, [
      {
        path: path.join(ctx.baseDir, "link/bec-bad"),
        beforeHash: null,
        after: Buffer.from("bad"),
      },
    ]),
    /链接/,
  );
  assert.deepEqual(fs.readdirSync(outside), []);
});
for (const phase of ["prepared", "committed"])
  test(`真实进程中断后恢复 ${phase} 产品事务`, async (t) => {
    const ctx = fixture(t);
    const child = spawn(
      process.execPath,
      [
        "--import",
        "tsx",
        "tests/fixtures/transaction-child.mjs",
        ctx.cwd,
        phase,
      ],
      {
        cwd: path.resolve("."),
        stdio: ["ignore", "pipe", "pipe"],
        windowsHide: true,
      },
    );
    let output = "",
      errors = "";
    child.stdout.on("data", (bytes) => (output += String(bytes)));
    child.stderr.on("data", (bytes) => (errors += String(bytes)));
    t.after(() => {
      if (child.exitCode === null) child.kill("SIGKILL");
    });
    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => {
        child.kill("SIGKILL");
        reject(new Error("中断夹具未到达写入点：" + errors));
      }, 7000);
      child.stdout.on("data", () => {
        if (output.includes("READY")) {
          clearTimeout(timer);
          resolve();
        }
      });
      child.once("exit", (code) => {
        clearTimeout(timer);
        if (!output.includes("READY"))
          reject(new Error("夹具提前退出 " + code + ": " + errors));
      });
    });
    const exited = once(child, "exit");
    child.kill("SIGKILL");
    await exited;
    assert.equal(await recoverProductTransaction(ctx), "recovered");
    assert.equal(
      fs.existsSync(path.join(ctx.baseDir, "bec-owned.md")),
      phase === "committed",
    );
    assert.equal(
      fs.existsSync(path.join(ctx.baseDir, "bec-second.md")),
      phase === "committed",
    );
  });
