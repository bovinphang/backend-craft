import { npmPack } from "../../scripts/archive.js";
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";
import { packSkills } from "../../scripts/pack-skills.js";
import { packOpenClaw } from "../../scripts/pack-openclaw.js";
import { checkPackages } from "../../scripts/check-packages.js";
import { readProductCatalog } from "../../src/content/catalog.js";
import { hashBytes } from "../../src/content/snapshot.js";
const root = path.resolve(".");
function temporary(t: { after(fn: () => void): void }) {
  const out = fs.mkdtempSync(path.join(os.tmpdir(), "bec-packed-"));
  t.after(() => fs.rmSync(out, { recursive: true, force: true }));
  return out;
}
test("34 个技能包的双语完整资源与来源、许可证，不依赖相邻仓库", (t) => {
  const out = temporary(t),
    packages = packSkills(root, out);
  assert.equal(packages.length, 34);
  for (const language of ["en", "zh-CN"] as const)
    for (const skill of readProductCatalog(root, language).skills) {
      const pkg = packages.find((p) => p.id === skill.id)!;
      assert.equal(pkg.sourcePackage, skill.sourcePackage);
      assert.equal(pkg.version, skill.version);
      for (const file of skill.files) {
        const output = path.join(
          pkg.packagePath,
          language === "en" ? "" : "localized/zh-CN",
          file.relativePath,
        );
        assert.equal(hashBytes(fs.readFileSync(output)), file.hash);
      }
      assert.ok(fs.existsSync(path.join(pkg.packagePath, "LICENSE")));
    }
  assert.ok(
    fs.existsSync(
      path.join(out, "cc-drawio-studio/data/THIRD_PARTY_NOTICES.md"),
    ),
  );
  assert.ok(
    fs.existsSync(
      path.join(out, "bec-debug-framework/references/common/debug.md"),
    ),
  );
});
test("CLI 真实 npm tarball 脱离源码和 node_modules，包含双语与原生元数据", (t) => {
  const out = temporary(t);
  checkPackages(root);
  const archive = npmPack(root, out);
  const extractRoot = path.join(out, "isolated");
  fs.mkdirSync(extractRoot);
  assert.equal(
    spawnSync("tar", ["-xzf", archive, "-C", extractRoot]).status,
    0,
  );
  const extracted = path.join(extractRoot, "package");
  const cli = spawnSync(
    process.execPath,
    [path.join(extracted, "dist/bin/backend-craft.js"), "--version"],
    { cwd: out, encoding: "utf8" },
  );
  assert.equal(cli.status, 0, cli.stderr);
  assert.match(cli.stdout, /1.0.0/);
  const installed = spawnSync(
    process.execPath,
    [
      path.join(extracted, "dist/bin/backend-craft.js"),
      "runtime",
      "install",
      "claude",
      "--local",
      "--json",
    ],
    { cwd: out, encoding: "utf8", windowsHide: true },
  );
  assert.equal(installed.status, 0, installed.stderr);
  assert.equal(JSON.parse(installed.stdout).status, "complete");
  assert.ok(
    fs.existsSync(path.join(out, ".claude/skills/cc-tdd-methodology/SKILL.md")),
  );
  const removed = spawnSync(
    process.execPath,
    [
      path.join(extracted, "dist/bin/backend-craft.js"),
      "runtime",
      "uninstall",
      "claude",
      "--local",
      "--json",
    ],
    { cwd: out, encoding: "utf8", windowsHide: true },
  );
  assert.equal(removed.status, 0, removed.stderr);
  for (const lang of ["en", "zh-CN"] as const)
    assert.equal(readProductCatalog(extracted, lang).skills.length, 34);
  const render = spawnSync(
    process.execPath,
    [
      path.join(
        extracted,
        "skills/cc-technical-diagrams/scripts/tech-diagram-render.mjs",
      ),
      "--type",
      "architecture",
      "--input",
      path.join(
        extracted,
        "skills/cc-technical-diagrams/assets/quality-examples/architecture.json",
      ),
      "--output",
      path.join(out, "architecture.html"),
    ],
    { cwd: out, encoding: "utf8" },
  );
  assert.equal(render.status, 0, render.stderr);
});
test("OpenClaw 原生包包含完整专业/公共资源、显式命令与默认只读注册", async (t) => {
  const out = temporary(t);
  packOpenClaw(root, out);
  const manifest = JSON.parse(
    fs.readFileSync(path.join(out, "openclaw.plugin.json"), "utf8"),
  );
  assert.equal(manifest.id, "backend-craft");
  assert.equal(manifest.configSchema.properties.autoValidate.default, false);
  assert.ok(fs.existsSync(path.join(out, "skills/bec-init/SKILL.md")));
  assert.ok(
    fs.existsSync(path.join(out, "skills/cc-drawio-studio/styles/schema.json")),
  );
  const plugin = (
    await import(pathToFileURL(path.join(out, "dist/openclaw/index.js")).href)
  ).default;
  const hooks: string[] = [];
  plugin.register({ on: (name: string) => hooks.push(name) });
  assert.deepEqual(hooks, ["before_prompt_build"]);
});
test("干净 Git marketplace 指向精确 npm 归档，原生 Hook 随该归档存在并可运行", (t) => {
  const out = temporary(t),
    clean = path.join(out, "clean-marketplace");
  fs.mkdirSync(path.join(clean, ".claude-plugin"), { recursive: true });
  fs.copyFileSync(
    path.join(root, ".claude-plugin/marketplace.json"),
    path.join(clean, ".claude-plugin/marketplace.json"),
  );
  assert.equal(fs.existsSync(path.join(clean, "dist")), false);
  assert.equal(fs.existsSync(path.join(clean, "node_modules")), false);
  const marketplace = JSON.parse(
      fs.readFileSync(
        path.join(clean, ".claude-plugin/marketplace.json"),
        "utf8",
      ),
    ),
    source = marketplace.plugins[0].source;
  assert.deepEqual(source, {
    source: "npm",
    package: "@bovinphang/backend-craft",
    version: "1.0.0",
  });
  const archive = npmPack(root, out),
    unpacked = path.join(out, "artifact");
  fs.mkdirSync(unpacked);
  assert.equal(spawnSync("tar", ["-xzf", archive, "-C", unpacked]).status, 0);
  const plugin = path.join(unpacked, "package"),
    pkg = JSON.parse(
      fs.readFileSync(path.join(plugin, "package.json"), "utf8"),
    );
  assert.equal(pkg.name, source.package);
  assert.equal(pkg.version, source.version);
  const command = JSON.parse(
      fs.readFileSync(path.join(plugin, "hooks/hooks.json"), "utf8"),
    ).hooks.SessionStart[0].hooks[0].command,
    relative = /\$\{CLAUDE_PLUGIN_ROOT\}\/([^"]+)/.exec(command)?.[1];
  assert.ok(relative);
  const hook = path.join(plugin, relative!);
  assert.ok(fs.existsSync(hook));
  const result = spawnSync(process.execPath, [hook], {
    cwd: clean,
    encoding: "utf8",
    windowsHide: true,
  });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(JSON.parse(result.stdout).schemaVersion, 1);
});
