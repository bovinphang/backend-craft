import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  collectSkillResources,
  readCapabilityCandidates,
} from "@bovinphang/craft-common";
import { readProductCatalog } from "../../src/content/catalog.js";
const root = path.resolve(".");
for (const framework of ["spring-boot", "fastapi", "gin", "axum", "drogon"])
  test(`${framework} is a standalone bilingual specialty, not a language alias`, () => {
    for (const language of ["en", "zh-CN"] as const) {
      const base =
          language === "en" ? root : path.join(root, "localized/zh-CN"),
        id = `bec-${framework}-project-standard`,
        catalog = readProductCatalog(root, language);
      const files = collectSkillResources(path.join(base, "skills", id)).map(
        (file) => file.relativePath,
      );
      for (const file of [
        "SKILL.md",
        "references/practice.md",
        "references/verification.md",
        "examples/minimal/README.md",
      ])
        assert.ok(files.includes(file), file);
      const metadata = JSON.parse(
        fs.readFileSync(path.join(base, "skills/metadata.json"), "utf8"),
      );
      const candidate = readCapabilityCandidates(
        metadata,
        Object.fromEntries(
          catalog.skills.map((skill) => [skill.id, skill.sourcePackage]),
        ),
      ).find((item) => item.id === id);
      assert.deepEqual(candidate?.applicability?.frameworks, [framework]);
      assert.deepEqual(candidate?.applicability?.roles, ["service"]);
      const queries = JSON.parse(
        fs.readFileSync(path.join(base, "skills/eval_queries.json"), "utf8"),
      )[id];
      assert.ok(queries.should_trigger.length >= 8);
      assert.ok(queries.should_not_trigger.length >= 8);
    }
  });
