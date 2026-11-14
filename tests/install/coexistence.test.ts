import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { spawnSync } from "node:child_process";
import { resolveSharedIdentity } from "@bovinphang/craft-common";
import { RUNTIMES, getRuntime } from "../../src/install/registry.js";
import {
  createInstallContext,
  getRuntimeTarget,
} from "../../src/install/paths.js";
import {
  installRuntime,
  uninstallRuntime,
} from "../../src/install/lifecycle.js";
import {
  readManifest,
  manifestPath,
  resolveReference,
} from "../../src/install/manifest.js";
import { hashBytes } from "../../src/content/snapshot.js";
const frontendRoot = process.env.BEC_FRONTEND_REFERENCE,
  productRoot = path.resolve("dist/package"),
  skip = frontendRoot
    ? false
    : "需要 BEC_FRONTEND_REFERENCE 指向真实前端构建产物";
function fixture(
  t: { after(fn: () => void): void },
  runtime: string,
  isGlobal = false,
  language: "en" | "zh-CN" = "en",
) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "bec-coexist-"));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const cwd = path.join(root, "project"),
    home = path.join(root, "home");
  fs.mkdirSync(cwd);
  fs.mkdirSync(home);
  const env: NodeJS.ProcessEnv = {
    ...process.env,
    HOME: home,
    USERPROFILE: home,
  };
  for (const id of Object.keys(RUNTIMES))
    env[id.toUpperCase() + "_CONFIG_DIR"] = path.join(home, "." + id);
  env.CODEX_HOME = path.join(home, ".codex");
  env.OPENCLAW_STATE_DIR = path.join(home, ".openclaw");
  return {
    root,
    ctx: createInstallContext({
      productRoot,
      cwd,
      home,
      runtime,
      isGlobal,
      language,
      env,
    }),
    env,
  };
}
function front(f: ReturnType<typeof fixture>, action: string) {
  const run = spawnSync(
    process.execPath,
    [
      path.join(frontendRoot!, "dist/bin/frontend-craft.js"),
      "runtime",
      action,
      f.ctx.runtime,
      f.ctx.isGlobal ? "--global" : "--local",
      "--lang",
      f.ctx.language,
    ],
    {
      cwd: f.ctx.cwd,
      env: f.env,
      encoding: "utf8",
      timeout: 60000,
      windowsHide: true,
    },
  );
  assert.equal(run.error, undefined, run.error?.message);
  assert.equal(run.status, 0, run.stdout + "\n" + run.stderr);
  return run;
}
function foreignFiles(f: ReturnType<typeof fixture>) {
  const file = path.join(f.ctx.baseDir, "frontend-craft.manifest.json");
  if (!fs.existsSync(file)) return {};
  const manifest = JSON.parse(fs.readFileSync(file, "utf8")) as {
    files: Array<{ root?: "baseDir" | "cwd" | "home"; path: string }>;
  };
  return Object.fromEntries(
    manifest.files
      .filter(
        (e) =>
          ![
            "CLAUDE.md",
            "AGENTS.md",
            "GEMINI.md",
            "copilot-instructions.md",
          ].includes(path.basename(e.path)),
      )
      .map((e) => {
        const absolute = path.resolve(f.ctx[e.root ?? "baseDir"], e.path);
        return [absolute, hashBytes(fs.readFileSync(absolute))];
      }),
  );
}
function backFiles(f: ReturnType<typeof fixture>) {
  return Object.fromEntries(
    readManifest(manifestPath(f.ctx))!.files.map((e) => [
      resolveReference(f.ctx, e),
      e.hash,
    ]),
  );
}
function unchanged(expected: Record<string, string>) {
  for (const [file, hash] of Object.entries(expected))
    assert.equal(hashBytes(fs.readFileSync(file)), hash, file);
}
function commonExists(f: ReturnType<typeof fixture>) {
  const { skillsDir } = getRuntimeTarget(f.ctx, getRuntime(f.ctx.runtime));
  if (!skillsDir) return false;
  return fs.existsSync(path.join(skillsDir, "cc-tdd-methodology/SKILL.md"));
}
const cases: Array<{
  runtime: string;
  order: string;
  isGlobal: boolean;
  language: "en" | "zh-CN";
}> = Object.keys(RUNTIMES).flatMap((runtime) =>
  ["F→B", "B→F"].map((order) => ({
    runtime,
    order,
    isGlobal: false,
    language: "en" as const,
  })),
);
for (const runtime of ["claude", "codex"])
  for (const order of ["F→B", "B→F"]) {
    cases.push({ runtime, order, isGlobal: true, language: "en" });
    cases.push({ runtime, order, isGlobal: false, language: "zh-CN" });
  }
for (const c of cases)
  test(
    `真实 F CLI ${c.runtime} ${c.order} ${c.isGlobal ? "global" : "local"} ${c.language}`,
    { skip },
    async (t) => {
      const f = fixture(t, c.runtime, c.isGlobal, c.language);
      if (c.order === "F→B") {
        front(f, "install");
        await installRuntime(f.ctx);
      } else {
        await installRuntime(f.ctx);
        front(f, "install");
      }
      front(f, "update");
      await installRuntime({ ...f.ctx, mode: "update" });
      const original = foreignFiles(f),
        back = backFiles(f);
      const { skillsDir } = getRuntimeTarget(f.ctx, getRuntime(c.runtime));
      if (skillsDir) {
        const ledger = resolveSharedIdentity(skillsDir).ledgerDir,
          lock = JSON.parse(
            fs.readFileSync(
              path.join(ledger, "dependencies.lock.json"),
              "utf8",
            ),
          );
        assert.equal(Object.keys(lock.consumers).length, 2);
        assert.equal(
          fs
            .readdirSync(skillsDir)
            .filter((name) => name === "cc-tdd-methodology").length,
          1,
        );
      }
      const b = await uninstallRuntime(f.ctx);
      assert.equal(b.status, "complete");
      unchanged(original);
      if (skillsDir) assert.ok(commonExists(f));
      await installRuntime(f.ctx);
      front(f, "uninstall");
      unchanged(back);
      if (skillsDir) assert.ok(commonExists(f));
      await uninstallRuntime(f.ctx);
      // F 的旧整文件所有权可能保留被 B 修改过的共享上下文；B 退出后允许保守重试。
      front(f, "uninstall");
      if (skillsDir) assert.equal(commonExists(f), false);
      const output = process.env.BEC_COEXISTENCE_EVIDENCE;
      if (output) {
        fs.mkdirSync(output, { recursive: true });
        fs.writeFileSync(
          path.join(
            output,
            [
              c.runtime,
              c.order === "F→B" ? "fb" : "bf",
              c.isGlobal ? "global" : "local",
              c.language,
            ].join("-") + ".json",
          ),
          JSON.stringify(
            {
              case: c,
              frontendFiles: original,
              backendFiles: back,
              status: "passed",
            },
            null,
            2,
          ),
        );
      }
    },
  );
test(
  "真实 F 先安装后 B 语言冲突保持 F 资源和公共账本原样",
  { skip },
  async (t) => {
    const f = fixture(t, "claude");
    front(f, "install");
    const before = foreignFiles(f),
      skillsDir = getRuntimeTarget(f.ctx, getRuntime("claude")).skillsDir!,
      lock = path.join(
        resolveSharedIdentity(skillsDir).ledgerDir,
        "dependencies.lock.json",
      ),
      bytes = fs.readFileSync(lock);
    await assert.rejects(
      installRuntime({
        ...f.ctx,
        language: "zh-CN",
        contentRoot: path.join(productRoot, "localized/zh-CN"),
      }),
      /公共|语言|冲突/,
    );
    unchanged(before);
    assert.deepEqual(fs.readFileSync(lock), bytes);
    assert.equal(fs.existsSync(manifestPath(f.ctx)), false);
  },
);
