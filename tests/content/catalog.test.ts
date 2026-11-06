import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

function fixture(t: { after(fn: () => void): void }) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "后端目录 space "));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.writeFileSync(
    path.join(root, "package.json"),
    JSON.stringify({ name: "@bovinphang/backend-craft", version: "1.0.0" }),
  );
  const skill = path.join(root, "skills/bec-example");
  fs.mkdirSync(skill, { recursive: true });
  fs.writeFileSync(
    path.join(skill, "SKILL.md"),
    "---\nname: bec-example\ndescription: Use when testing the content boundary.\n---\n",
  );
  return root;
}

test("产品身份、清单与前端隔离", async () => {
  const { PRODUCT } = await import("../../src/product.js");
  assert.equal(PRODUCT.name, "@bovinphang/backend-craft");
  assert.equal(PRODUCT.version, "1.0.0");
  assert.equal(PRODUCT.manifestName, "backend-craft.manifest.json");
});
test("完整资源、来源和含空格中文路径可读取", async (t) => {
  const root = fixture(t);
  const { readProductCatalog } = await import("../../src/content/catalog.js");
  fs.writeFileSync(path.join(root, "skills/bec-example/data.json"), "{}");
  const result = readProductCatalog(root, "en");
  assert.equal(result.skills[0].id, "bec-example");
  assert.equal(result.skills[0].sourcePackage, "@bovinphang/backend-craft");
  assert.equal(result.skills[0].files.length, 2);
  assert.equal(result.skills[0].version, "1.0.0");
});
test("拒绝 fec 目录、错误 frontmatter 与符号链接", async (t) => {
  const root = fixture(t);
  const { readProductCatalog } = await import("../../src/content/catalog.js");
  fs.mkdirSync(path.join(root, "skills/fec-unknown"));
  assert.throws(() => readProductCatalog(root, "en"), /命名空间|ID/);
  fs.rmdirSync(path.join(root, "skills/fec-unknown"));
  const entry = path.join(root, "skills/bec-example/SKILL.md");
  fs.writeFileSync(entry, "---\nname: wrong\ndescription: Wrong.\n---\n");
  assert.throws(() => readProductCatalog(root, "en"), /名称|name/);
  fs.writeFileSync(
    entry,
    "---\nname: bec-example\ndescription: Use when testing.\n---\n",
  );
  const real = path.join(root, "real");
  fs.mkdirSync(real);
  fs.symlinkSync(
    real,
    path.join(root, "skills/bec-link"),
    process.platform === "win32" ? "junction" : "dir",
  );
  assert.throws(() => readProductCatalog(root, "en"), /链接/);
});
test("公共目录没有来源锁不能被当成后端自有内容", async (t) => {
  const root = fixture(t);
  fs.mkdirSync(path.join(root, "skills/cc-example"));
  fs.writeFileSync(
    path.join(root, "skills/cc-example/SKILL.md"),
    "---\nname: cc-example\ndescription: Use when testing.\n---\n",
  );
  const { readProductCatalog } = await import("../../src/content/catalog.js");
  assert.throws(() => readProductCatalog(root, "en"), /公共|锁/);
});
