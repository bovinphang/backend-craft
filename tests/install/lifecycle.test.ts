import test from "node:test";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { recoverSharedTransaction } from "@bovinphang/craft-common";
import { sharedText } from "../../src/install/adapters/shared.js";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  executeSharedPlan,
  resolveSharedIdentity,
} from "@bovinphang/craft-common";
import { readCommonCatalog } from "../../src/content/common.js";
import {
  installRuntime,
  uninstallRuntime,
} from "../../src/install/lifecycle.js";
import {
  writeManaged,
  manifestPath,
  readManifest,
  recordSharedEntry,
  previousSharedEntry,
  preserveShared,
} from "../../src/install/manifest.js";
import {
  entryHash,
  planSharedEntry,
} from "../../src/install/shared-config/index.js";
import { writePlanned } from "../../src/install/product-plan.js";
import type { InstallContext } from "../../src/install/types.js";
import type { RuntimeAdapter } from "../../src/install/registry.js";
const productRoot = path.resolve(".");
function fixture(t: { after(fn: () => void): void }): InstallContext {
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), "bec-life-"));
  t.after(() => fs.rmSync(cwd, { recursive: true, force: true }));
  return {
    productRoot,
    contentRoot: productRoot,
    cwd,
    home: path.join(cwd, "home"),
    baseDir: path.join(cwd, ".claude"),
    runtime: "claude",
    isGlobal: false,
    language: "en",
    mode: "install",
    dryRun: false,
  };
}
const adapter: RuntimeAdapter = {
  id: "claude",
  capabilities: {
    skills: true,
    agents: false,
    commands: false,
    hooks: false,
    rules: true,
  },
  async plan(ctx) {
    writeManaged(path.join(ctx.baseDir, "bec-test.md"), Buffer.from("owned"));
    const file = path.join(ctx.cwd, "AGENTS.md"),
      draft = {
        kind: "text-marker" as const,
        id: "backend-craft",
        value: "backend-context",
        createdFile: !fs.existsSync(file),
      },
      old = previousSharedEntry(file, draft.id),
      entry = {
        ...draft,
        createdFile: old?.createdFile ?? draft.createdFile,
        hash: entryHash(draft),
      },
      mutation = planSharedEntry(file, entry, "upsert", old);
    if (mutation) {
      writePlanned(file, mutation.after);
      recordSharedEntry(file, entry);
    } else preserveShared(file);
  },
};
const commonFile = (ctx: InstallContext) =>
  path.join(ctx.baseDir, "skills/cc-source-driven-development/SKILL.md");
test("真实安装共享 common 与独立清单、幂等及无 Skill 分支", async (t) => {
  const ctx = fixture(t);
  const result = await installRuntime(ctx, adapter);
  assert.equal(result.status, "complete");
  assert.ok(fs.existsSync(commonFile(ctx)));
  assert.ok(
    readManifest(manifestPath(ctx))?.files.every(
      (f) => !f.path.includes("cc-"),
    ),
  );
  const again = await installRuntime({ ...ctx, mode: "update" }, adapter);
  assert.deepEqual(again.changed, []);
  const none = fixture(t);
  none.runtime = "cline";
  const plain = {
    ...adapter,
    id: "cline",
    capabilities: { ...adapter.capabilities, skills: false },
  };
  await installRuntime(none, plain);
  assert.equal(
    fs.existsSync(
      resolveSharedIdentity(path.join(none.baseDir, "skills")).ledgerDir,
    ),
    false,
  );
  await uninstallRuntime(none, plain);
});
test("另一消费者存在时卸载 B 保留公共文件，最后退出清理未修改文件", async (t) => {
  const ctx = fixture(t),
    skillsDir = path.join(ctx.baseDir, "skills");
  const request = {
    action: "install" as const,
    skillsDir,
    consumer: {
      product: "@bovinphang/frontend-craft",
      manifestPath: path.join(ctx.baseDir, "frontend-craft.manifest.json"),
      scope: "local" as const,
    },
    catalog: readCommonCatalog(productRoot, "en"),
  };
  await executeSharedPlan(request, { dryRun: false });
  await installRuntime(ctx, adapter);
  await uninstallRuntime(ctx, adapter);
  assert.ok(fs.existsSync(commonFile(ctx)));
  await executeSharedPlan(
    { ...request, action: "uninstall" },
    { dryRun: false },
  );
  assert.equal(fs.existsSync(commonFile(ctx)), false);
});
test("公共版本语言及摘要冲突零写入", async (t) => {
  for (const mode of ["language", "version", "digest"]) {
    const ctx = fixture(t),
      skillsDir = path.join(ctx.baseDir, "skills"),
      catalog = readCommonCatalog(productRoot, "en");
    if (mode === "version" || mode === "digest") {
      const { digest: _digest, root: _root, ...body } = catalog;
      if (mode === "version") body.packageVersion = "2.0.0";
      else body.skills = [...body.skills].reverse();
      const { hashBytes } = await import("../../src/content/snapshot.js");
      Object.assign(catalog, body, { digest: hashBytes(JSON.stringify(body)) });
    }
    await executeSharedPlan(
      {
        action: "install",
        skillsDir,
        consumer: {
          product: "foreign",
          manifestPath: path.join(ctx.baseDir, "foreign.json"),
          scope: "local",
        },
        catalog,
      },
      { dryRun: false },
    );
    const before = fs.readFileSync(
      path.join(
        resolveSharedIdentity(skillsDir).ledgerDir,
        "dependencies.lock.json",
      ),
    );
    await assert.rejects(
      installRuntime(
        { ...ctx, language: mode === "language" ? "zh-CN" : "en" },
        adapter,
      ),
      /公共|冲突|版本|摘要|语言/,
    );
    assert.equal(fs.existsSync(manifestPath(ctx)), false);
    assert.deepEqual(
      fs.readFileSync(
        path.join(
          resolveSharedIdentity(skillsDir).ledgerDir,
          "dependencies.lock.json",
        ),
      ),
      before,
    );
  }
});
test("用户修改和共享条目修改导致部分卸载并保留消费者，重试可清理", async (t) => {
  const ctx = fixture(t);
  await installRuntime(ctx, adapter);
  const file = path.join(ctx.baseDir, "bec-test.md");
  fs.appendFileSync(file, "user");
  fs.appendFileSync(path.join(ctx.cwd, "AGENTS.md"), "用户正文");
  const result = await uninstallRuntime(ctx, adapter);
  assert.equal(result.status, "partial");
  assert.equal(result.common, "retained");
  assert.ok(fs.existsSync(commonFile(ctx)));
  assert.match(
    fs.readFileSync(path.join(ctx.cwd, "AGENTS.md"), "utf8"),
    /用户正文/,
  );
  fs.writeFileSync(file, "owned");
  await uninstallRuntime(ctx, adapter);
  assert.equal(fs.existsSync(manifestPath(ctx)), false);
  assert.equal(fs.existsSync(commonFile(ctx)), false);
});
test("最后公共文件被修改时保留该文件和 residual 账本", async (t) => {
  const ctx = fixture(t);
  await installRuntime(ctx, adapter);
  fs.appendFileSync(commonFile(ctx), "user");
  await uninstallRuntime(ctx, adapter);
  assert.ok(fs.existsSync(commonFile(ctx)));
  assert.equal(
    JSON.parse(
      fs.readFileSync(
        path.join(
          resolveSharedIdentity(path.join(ctx.baseDir, "skills")).ledgerDir,
          "craft-common.json",
        ),
        "utf8",
      ),
    ).residual,
    true,
  );
});
test("dry-run 零写入，活跃公共锁拒绝提交，根 junction 可用内部 junction 拒绝", async (t) => {
  const ctx = fixture(t);
  await installRuntime({ ...ctx, dryRun: true }, adapter);
  assert.deepEqual(fs.readdirSync(ctx.cwd), []);
  const real = path.join(ctx.cwd, "real");
  fs.mkdirSync(real);
  fs.symlinkSync(
    real,
    ctx.baseDir,
    process.platform === "win32" ? "junction" : "dir",
  );
  await installRuntime(ctx, adapter);
  const ledger = resolveSharedIdentity(
    path.join(ctx.baseDir, "skills"),
  ).ledgerDir;
  fs.writeFileSync(
    path.join(ledger, "install.lock"),
    JSON.stringify({ pid: process.pid, host: os.hostname(), token: "test" }),
  );
  await assert.rejects(installRuntime(ctx, adapter), /锁|正在执行/);
  fs.unlinkSync(path.join(ledger, "install.lock"));
  const other = fixture(t);
  fs.mkdirSync(other.baseDir);
  const outside = path.join(other.cwd, "outside");
  fs.mkdirSync(outside);
  fs.symlinkSync(
    outside,
    path.join(other.baseDir, "skills"),
    process.platform === "win32" ? "junction" : "dir",
  );
  await assert.rejects(installRuntime(other, adapter), /链接/);
  assert.deepEqual(fs.readdirSync(outside), []);
});
for (const update of [false, true])
  for (const phase of ["prepared", "committed"])
    test(`${update ? "更新退役资源" : "公共和产品"}一次事务在真实中断 ${phase} 后一致恢复`, async (t) => {
      const ctx = fixture(t);
      if (update)
        await installRuntime(ctx, {
          ...adapter,
          async plan() {
            writeManaged(
              path.join(ctx.baseDir, "bec-obsolete.md"),
              Buffer.from("obsolete"),
            );
            sharedText(path.join(ctx.cwd, "AGENTS.md"), "old context");
          },
        });
      const child = spawn(
        process.execPath,
        [
          "--import",
          "tsx",
          "tests/fixtures/lifecycle-child.mjs",
          ctx.cwd,
          phase,
          update ? "update" : "install",
        ],
        {
          cwd: productRoot,
          windowsHide: true,
          stdio: ["ignore", "pipe", "pipe"],
        },
      );
      let output = "",
        error = "";
      child.stdout.on("data", (b) => (output += String(b)));
      child.stderr.on("data", (b) => (error += String(b)));
      t.after(() => {
        if (child.exitCode === null) child.kill("SIGKILL");
      });
      await new Promise<void>((resolve, reject) => {
        const timer = setTimeout(() => {
          child.kill("SIGKILL");
          reject(new Error(error || "夹具未到达中断点"));
        }, 15000);
        child.stdout.on("data", () => {
          if (output.includes("READY")) {
            clearTimeout(timer);
            resolve();
          }
        });
        child.once("exit", () => {
          clearTimeout(timer);
          if (!output.includes("READY")) reject(new Error(error));
        });
      });
      const exited = once(child, "exit");
      child.kill("SIGKILL");
      await exited;
      await assert.rejects(
        installRuntime({ ...ctx, dryRun: true }, adapter),
        /恢复/,
      );
      await recoverSharedTransaction(path.join(ctx.baseDir, "skills"), [
        ctx.baseDir,
        ctx.cwd,
      ]);
      assert.equal(
        fs.existsSync(path.join(ctx.baseDir, "bec-owned.md")),
        phase === "committed",
      );
      assert.equal(
        fs.existsSync(manifestPath(ctx)),
        update || phase === "committed",
      );
      assert.equal(
        fs.existsSync(commonFile(ctx)),
        update || phase === "committed",
      );
      if (update) {
        assert.equal(
          fs.existsSync(path.join(ctx.baseDir, "bec-obsolete.md")),
          phase === "prepared",
        );
        assert.equal(
          fs.existsSync(path.join(ctx.cwd, "AGENTS.md")),
          phase === "prepared",
        );
      }
    });

for (const edited of [false, true])
  test(`更新移除旧私有资源与共享片段，保留用户修改：${edited}`, async (t) => {
    const ctx = fixture(t),
      file = path.join(ctx.baseDir, "bec-obsolete.md"),
      context = path.join(ctx.cwd, "AGENTS.md"),
      user =
        "用户正文\n<!-- frontend-craft:start -->\nF\n<!-- frontend-craft:end -->\n";
    fs.writeFileSync(context, user);
    const first: RuntimeAdapter = {
        ...adapter,
        capabilities: { ...adapter.capabilities, skills: false },
        async plan() {
          writeManaged(file, Buffer.from("owned"));
          sharedText(context, "old backend");
        },
      },
      next: RuntimeAdapter = {
        ...first,
        async plan() {
          writeManaged(
            path.join(ctx.baseDir, "bec-renamed.md"),
            Buffer.from("new"),
          );
        },
      };
    await installRuntime(ctx, first);
    if (edited) {
      fs.appendFileSync(file, "user");
      fs.writeFileSync(
        context,
        fs
          .readFileSync(context, "utf8")
          .replace("old backend", "user changed backend"),
      );
    }
    const before = fs.readFileSync(manifestPath(ctx));
    await installRuntime({ ...ctx, mode: "update", dryRun: true }, next);
    assert.deepEqual(fs.readFileSync(manifestPath(ctx)), before);
    assert.ok(fs.existsSync(file));
    const result = await installRuntime({ ...ctx, mode: "update" }, next);
    assert.equal(result.status, edited ? "partial" : "complete");
    assert.equal(fs.existsSync(file), edited);
    if (!edited) {
      assert.equal(fs.readFileSync(context, "utf8"), user);
      assert.equal(readManifest(manifestPath(ctx))!.sharedEntries.length, 0);
      assert.equal(readManifest(manifestPath(ctx))!.files.length, 1);
    } else {
      assert.equal(readManifest(manifestPath(ctx))!.sharedEntries.length, 1);
      assert.ok(result.preserved.includes(file));
      assert.match(fs.readFileSync(context, "utf8"), /user changed backend/);
    }
  });
test("过期删除与新写入属于同一事务，清单写入失败恢复旧文件与片段", async (t) => {
  const ctx = fixture(t),
    old = path.join(ctx.baseDir, "bec-obsolete.md"),
    context = path.join(ctx.cwd, "AGENTS.md");
  const first: RuntimeAdapter = {
    ...adapter,
    capabilities: { ...adapter.capabilities, skills: false },
    async plan() {
      writeManaged(old, Buffer.from("owned"));
      sharedText(context, "old backend");
    },
  };
  await installRuntime(ctx, first);
  const before = fs.readFileSync(context),
    rename = fs.renameSync;
  t.mock.method(fs, "renameSync", (from: fs.PathLike, to: fs.PathLike) => {
    if (String(to) === manifestPath(ctx)) throw new Error("模拟清单失败");
    return rename(from, to);
  });
  await assert.rejects(
    installRuntime(
      { ...ctx, mode: "update" },
      {
        ...first,
        async plan() {
          writeManaged(
            path.join(ctx.baseDir, "bec-renamed.md"),
            Buffer.from("new"),
          );
        },
      },
    ),
    /模拟清单失败/,
  );
  assert.equal(fs.readFileSync(old, "utf8"), "owned");
  assert.deepEqual(fs.readFileSync(context), before);
  assert.equal(fs.existsSync(path.join(ctx.baseDir, "bec-renamed.md")), false);
});
