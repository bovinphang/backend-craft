import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { parseDocument } from "yaml";
import { readProductCatalog } from "../../src/content/catalog.js";
import { readCommonCatalog } from "../../src/content/common.js";
const root = path.resolve(".");
const cases = JSON.parse(
  fs.readFileSync(path.join(root, "tests/evals/scenarios.json"), "utf8"),
) as Array<{ id: string }>;
const expected = cases.map((item) => item.id).sort();
for (const id of expected)
  test(`技能契约：${id}`, () => {
    for (const language of ["en", "zh-CN"] as const) {
      const base =
        language === "en" ? root : path.join(root, "localized/zh-CN");
      const file = path.join(base, "skills", id, "SKILL.md");
      assert.ok(fs.existsSync(file), `缺少 ${language} ${id} 入口`);
      const body = fs.readFileSync(file, "utf8"),
        frontmatter = /^---\r?\n([\s\S]*?)\r?\n---/.exec(body);
      assert.ok(frontmatter);
      const fields = parseDocument(frontmatter[1]).toJS() as {
        name: string;
        description: string;
      };
      assert.equal(fields.name, id);
      assert.match(
        fields.description,
        language === "en" ? /^Use when/ : /[\u3400-\u9fff]/,
      );
      assert.ok(fields.description.length <= 500);
      assert.match(body, /\]\(references\//);
      const index = JSON.parse(
        fs.readFileSync(path.join(base, "skills/eval_queries.json"), "utf8"),
      ) as Record<
        string,
        { should_trigger: string[]; should_not_trigger: string[] }
      >;
      assert.ok(index[id].should_trigger.length >= 4);
      assert.ok(index[id].should_not_trigger.length >= 4);
    }
  });
test("21 个专业入口与 21 个公共入口双语完整，来源分离", () => {
  const en = readProductCatalog(root, "en"),
    zh = readProductCatalog(root, "zh-CN");
  assert.equal(expected.length, 21);
  assert.equal(en.skills.length, 42);
  assert.deepEqual(
    en.skills
      .filter((s) => s.id.startsWith("bec-"))
      .map((s) => s.id)
      .sort(),
    expected,
  );
  assert.deepEqual(
    zh.skills.map((s) => s.id),
    en.skills.map((s) => s.id),
  );
  for (const skill of en.skills)
    assert.equal(
      skill.sourcePackage,
      skill.id.startsWith("bec-")
        ? "@bovinphang/backend-craft"
        : "@bovinphang/craft-common",
    );
});
test("组合元数据与关系只有实际入口，领域方法可独立读取", () => {
  for (const language of ["en", "zh-CN"] as const) {
    const base = language === "en" ? root : path.join(root, "localized/zh-CN");
    const catalog = readProductCatalog(root, language),
      ids = new Set(catalog.skills.map((s) => s.id));
    const metadata = JSON.parse(
      fs.readFileSync(path.join(base, "skills/metadata.json"), "utf8"),
    ) as Array<{ id: string; version: string; repository: string }>;
    assert.deepEqual(metadata.map((m) => m.id).sort(), [...ids].sort());
    const relations = JSON.parse(
      fs.readFileSync(path.join(base, "skills/relations.json"), "utf8"),
    ) as Record<
      string,
      { relatedSkills?: string[]; boundaryWorkflows?: string[] }
    >;
    for (const [id, relation] of Object.entries(relations)) {
      assert.ok(ids.has(id));
      for (const related of [
        ...(relation.relatedSkills ?? []),
        ...(relation.boundaryWorkflows ?? []),
      ])
        assert.ok(ids.has(related), `${id} -> ${related}`);
    }
    for (const [id, method] of [
      ["bec-debug-framework", "debug"],
      ["bec-doc-sync", "doc-sync"],
      ["bec-refactoring", "refactoring"],
      ["bec-tdd-workflow", "tdd"],
    ])
      assert.ok(
        fs.existsSync(
          path.join(base, "skills", id, "references/common", `${method}.md`),
        ),
      );
    assert.equal(readCommonCatalog(root, language).skills.length, 21);
  }
});
