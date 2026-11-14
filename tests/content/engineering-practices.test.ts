import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { parseDocument } from "yaml";
const root = path.resolve(import.meta.dirname, "../../dist/package");
const targets: ReadonlyArray<readonly [string, readonly string[]]> = [
  [
    "bec-spring-boot-project-standard",
    ["validation-effects", "lifecycle-boundary"],
  ],
  [
    "bec-fastapi-project-standard",
    ["lifespan-ownership", "cancellation-boundary"],
  ],
  ["bec-gin-project-standard", ["abort-return", "context-lifecycle"]],
  ["bec-axum-project-standard", ["rejection-contract", "state-lifecycle"]],
  ["bec-drogon-project-standard", ["filter-continuation", "callback-lifetime"]],
  ["bec-architecture-design", ["failure-units", "reversible-change"]],
  ["bec-api-design", ["idempotent-intent", "compatibility-window"]],
  ["bec-auth-security", ["verified-context", "object-scope"]],
  ["bec-database-design", ["migration-compatibility", "query-bounds"]],
  ["bec-transaction-management", ["commit-ambiguity", "replay-boundaries"]],
  ["bec-observability", ["correlated-errors", "safe-diagnostics"]],
  ["bec-testing-strategy", ["fault-matrix", "real-integration"]],
  ["bec-code-review", ["evidence-severity", "compatibility"]],
  [
    "bec-dependency-management",
    ["platform-compatibility", "artifact-consumer"],
  ],
];
interface Card {
  id: string;
  level: string;
  sourceIds: string[];
  caseIds: string[];
  evidence: string;
}
test("backend local decisions retain bilingual contracts and authoritative source identities", () => {
  for (const [id, topics] of targets) {
    const languages: Card[][] = [];
    for (const prefix of ["", "localized/zh-CN/"]) {
      const file = path.join(
        root,
        prefix,
        "skills",
        id,
        "references/engineering-practices.md",
      );
      assert.ok(fs.existsSync(file), "missing backend decisions: " + id);
      const raw = fs.readFileSync(file, "utf8"),
        yaml = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
      assert.ok(yaml);
      const doc = parseDocument(yaml[1], { uniqueKeys: true });
      assert.equal(doc.errors.length, 0);
      const cards = doc.toJS().practiceCards as Card[];
      assert.deepEqual(
        cards.map((card) => card.id),
        topics.map((topic) => id + ":" + topic),
      );
      const sources = new Set(
        (
          JSON.parse(
            fs.readFileSync(
              path.join(
                root,
                prefix,
                "skills",
                id,
                "references/common/engineering-practices.sources.json",
              ),
              "utf8",
            ),
          ).sources as Array<{ id: string }>
        ).map((source) => source.id),
      );
      for (const card of cards) {
        assert.ok(
          ["required", "recommended", "conditional"].includes(card.level),
        );
        assert.ok(
          card.sourceIds.length &&
            card.sourceIds.every((source) => sources.has(source)),
        );
        assert.ok(card.caseIds.length);
        assert.ok(["case", "review-only", "not-run"].includes(card.evidence));
        assert.ok(raw.includes(`<a id="${card.id}"></a>`));
      }
      languages.push(cards);
    }
    assert.deepEqual(languages[0], languages[1]);
  }
});
