import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { RUNTIMES, getRuntime } from "../../src/install/registry.js";
import {
  createInstallContext,
  getRuntimeTarget,
} from "../../src/install/paths.js";
import {
  installRuntime,
  uninstallRuntime,
} from "../../src/install/lifecycle.js";
const ids = [
    "claude",
    "codex",
    "cursor",
    "windsurf",
    "opencode",
    "kilo",
    "gemini",
    "copilot",
    "antigravity",
    "augment",
    "trae",
    "codebuddy",
    "cline",
    "openclaw",
    "qoder",
  ],
  productRoot = path.resolve("dist/package");
test("local runtime targets match the captured installation contract", () => {
  const contract = JSON.parse(
    fs.readFileSync(
      new URL("../fixtures/installation-contract.json", import.meta.url),
      "utf8",
    ),
  ) as {
    runtimes: Array<{ id: string; localDirectory: string; skills: string }>;
  };
  const cwd = path.resolve("contract-project");
  for (const entry of contract.runtimes) {
    const ctx = createInstallContext({
      productRoot,
      cwd,
      runtime: entry.id,
      env: {},
    });
    assert.equal(ctx.baseDir, path.join(cwd, entry.localDirectory));
    const expected =
      entry.skills === "none"
        ? undefined
        : entry.skills === "agents"
          ? path.join(cwd, ".agents", "skills")
          : entry.skills === "workspace"
            ? path.join(cwd, "skills")
            : path.join(ctx.baseDir, "skills");
    assert.equal(
      getRuntimeTarget(ctx, getRuntime(entry.id)).skillsDir,
      expected,
      entry.id,
    );
  }
});
test("15 Runtime 集合及不支持的标准 Skill，不回退未知平台", () => {
  assert.deepEqual(Object.keys(RUNTIMES), ids);
  assert.throws(() => getRuntime("unknown"), /未知/);
  for (const id of ["copilot", "trae", "cline"]) {
    const ctx = createInstallContext({ productRoot, runtime: id });
    assert.equal(getRuntimeTarget(ctx, getRuntime(id)).skillsDir, undefined);
  }
});
for (const runtime of ids)
  for (const language of ["en", "zh-CN"] as const)
    for (const isGlobal of [false, true])
      test(`${runtime}/${language}/${isGlobal ? "global" : "local"} 文件契约`, async (t) => {
        const root = fs.mkdtempSync(path.join(os.tmpdir(), "bec-matrix-"));
        t.after(() => fs.rmSync(root, { recursive: true, force: true }));
        const cwd = path.join(root, "project"),
          home = path.join(root, "home");
        fs.mkdirSync(cwd);
        fs.mkdirSync(home);
        const ctx = createInstallContext({
          productRoot,
          cwd,
          home,
          runtime,
          isGlobal,
          language,
          env: {},
        });
        await installRuntime({ ...ctx, dryRun: true });
        assert.deepEqual(fs.readdirSync(cwd), []);
        assert.deepEqual(fs.readdirSync(home), []);
        const result = await installRuntime(ctx);
        assert.equal(result.status, "complete");
        const { skillsDir } = getRuntimeTarget(ctx, getRuntime(runtime));
        if (skillsDir) {
          assert.ok(
            fs.existsSync(
              path.join(skillsDir, "cc-rust-project-standard/SKILL.md"),
            ),
          );
          assert.ok(
            fs.existsSync(path.join(skillsDir, "cc-tdd-methodology/SKILL.md")),
          );
          if (runtime === "openclaw") {
            assert.equal(
              skillsDir,
              path.join(isGlobal ? ctx.baseDir : cwd, "skills"),
            );
            assert.ok(fs.existsSync(path.join(skillsDir, "bec-init/SKILL.md")));
          }
        } else {
          assert.equal(result.common, "none");
          const guide =
            runtime === "cline"
              ? path.join(
                  ctx.baseDir,
                  isGlobal ? "Rules" : ".clinerules",
                  "backend-craft.md",
                )
              : runtime === "trae"
                ? path.join(
                    ctx.baseDir,
                    isGlobal ? "user_rules" : "rules",
                    "backend-craft.md",
                  )
                : path.join(
                    ctx.baseDir,
                    isGlobal
                      ? "copilot-instructions.md"
                      : "instructions/backend-craft.instructions.md",
                  );
          for (const match of fs
            .readFileSync(guide, "utf8")
            .matchAll(/\]\(([^)]+)\)/g))
            assert.ok(
              fs.existsSync(path.resolve(path.dirname(guide), match[1])),
              match[1],
            );
          assert.equal(fs.existsSync(path.join(ctx.baseDir, "skills")), false);
        }
        if (runtime === "cline")
          assert.ok(
            fs.existsSync(
              path.join(
                ctx.baseDir,
                isGlobal ? "Rules" : ".clinerules",
                "backend-craft.md",
              ),
            ),
          );
        if (runtime === "cursor")
          assert.ok(fs.existsSync(path.join(ctx.baseDir, "rules/bec-go.mdc")));
        if (runtime === "windsurf")
          assert.ok(
            fs.existsSync(
              path.join(
                ctx.baseDir,
                isGlobal ? "global_workflows" : "workflows",
                "bec-validate.md",
              ),
            ),
          );
        if (runtime === "copilot" && !isGlobal)
          assert.ok(
            fs.existsSync(
              path.join(ctx.baseDir, "prompts/bec-review.prompt.md"),
            ),
          );
        assert.equal((await uninstallRuntime(ctx)).status, "complete");
        assert.equal(
          fs.existsSync(path.join(ctx.baseDir, "backend-craft.manifest.json")),
          false,
        );
      });
