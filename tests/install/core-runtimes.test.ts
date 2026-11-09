import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { parse as parseToml } from "smol-toml";
import { readProductCatalog } from "../../src/content/catalog.js";
import {
  installRuntime,
  uninstallRuntime,
} from "../../src/install/lifecycle.js";
import { getRuntime } from "../../src/install/registry.js";
import {
  getRuntimeTarget,
  createInstallContext,
} from "../../src/install/paths.js";
const productRoot = path.resolve(".");
test("双语完整专业角色、命令及语言规则不混合加载", () => {
  for (const language of ["en", "zh-CN"] as const) {
    const c = readProductCatalog(productRoot, language);
    assert.equal(c.agents.length, 8);
    assert.equal(c.commands.length, 8);
    const content =
      language === "en"
        ? productRoot
        : path.join(productRoot, "localized", language);
    assert.equal(
      fs
        .readdirSync(path.join(content, "templates/shared/rules"))
        .filter((name) => name.endsWith(".md")).length,
      7,
    );
    const core = fs.readFileSync(
      path.join(content, "templates/shared/rules/bec-core.md"),
      "utf8",
    );
    assert.doesNotMatch(core, /@.*bec-(rust|go|java|python|c|cpp)\.md/);
  }
});
for (const runtime of ["claude", "codex"])
  for (const language of ["en", "zh-CN"] as const)
    for (const isGlobal of [false, true])
      test(`${runtime} ${language} ${isGlobal ? "global" : "local"} 的真实资源与安全卸载`, async (t) => {
        const root = fs.mkdtempSync(path.join(os.tmpdir(), "bec-core-"));
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
          }),
          target = getRuntimeTarget(ctx, getRuntime(runtime));
        if (runtime === "codex")
          assert.equal(
            target.skillsDir,
            path.join(isGlobal ? home : cwd, ".agents/skills"),
          );
        const native = path.join(cwd, ".claude-plugin/plugin.json");
        fs.mkdirSync(path.dirname(native));
        fs.writeFileSync(native, '{"name":"frontend-craft"}');
        const contextFile =
          runtime === "codex"
            ? path.join(isGlobal ? ctx.baseDir : cwd, "AGENTS.md")
            : path.join(ctx.baseDir, "CLAUDE.md");
        fs.mkdirSync(path.dirname(contextFile), { recursive: true });
        fs.writeFileSync(contextFile, "用户正文\n前端 frontend-craft\n");
        const before = fs.readFileSync(native);
        const result = await installRuntime(ctx);
        assert.equal(result.status, "complete");
        assert.deepEqual(fs.readFileSync(native), before);
        assert.ok(
          fs.existsSync(
            path.join(target.skillsDir!, "cc-go-project-standard/SKILL.md"),
          ),
        );
        assert.equal(
          fs.existsSync(
            path.join(target.skillsDir!, "bec-go-project-standard"),
          ),
          false,
        );
        assert.equal(
          fs.readdirSync(path.join(ctx.baseDir, "agents")).length,
          8,
        );
        if (runtime === "codex") {
          const role = parseToml(
            fs.readFileSync(
              path.join(ctx.baseDir, "agents/bec-code-reviewer.toml"),
              "utf8",
            ),
          );
          assert.ok(role.developer_instructions);
          assert.equal(
            fs.existsSync(path.join(ctx.baseDir, "commands")),
            false,
          );
        } else
          assert.equal(
            fs.readdirSync(path.join(ctx.baseDir, "commands")).length,
            8,
          );
        assert.match(
          fs.readFileSync(contextFile, "utf8"),
          /backend-craft:start/,
        );
        assert.deepEqual(
          (await installRuntime({ ...ctx, mode: "update" })).changed,
          [],
        );
        await uninstallRuntime(ctx);
        assert.equal(
          fs.readFileSync(contextFile, "utf8"),
          "用户正文\n前端 frontend-craft\n",
        );
        assert.deepEqual(fs.readFileSync(native), before);
      });
