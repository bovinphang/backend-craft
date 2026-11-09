import type { SnapshotDeclarations } from "@bovinphang/craft-common";
const ENGINEERING_TARGETS = ["bec-architecture-design","bec-api-design","bec-auth-security","bec-database-design","bec-transaction-management","bec-observability","bec-testing-strategy","bec-code-review","bec-dependency-management","bec-spring-boot-project-standard","bec-fastapi-project-standard","bec-gin-project-standard","bec-axum-project-standard","bec-drogon-project-standard"] as const;
export const SNAPSHOT_DECLARATIONS: SnapshotDeclarations = {
  domainMethods: [
    ...ENGINEERING_TARGETS.map(id => ({target:`skills/${id}/references/common/engineering-practices.md`,method:"engineering-practices" as const})),
    {
      target: "skills/bec-doc-sync/references/common/doc-sync.md",
      method: "doc-sync",
    },
    {
      target: "skills/bec-debug-framework/references/common/debug.md",
      method: "debug",
    },
    {
      target: "skills/bec-refactoring/references/common/refactoring.md",
      method: "refactoring",
    },
    {
      target: "skills/bec-tdd-workflow/references/common/tdd.md",
      method: "tdd",
    },
    {
      target:
        "templates/shared/rules/references/common/source-driven-development.md",
      method: "source-driven-development",
    },
  ],
  extraResources: ENGINEERING_TARGETS.flatMap(id => ["sources","rules"].map(kind => ({source:`methods/engineering-practices.${kind}.json`,target:`skills/${id}/references/common/engineering-practices.${kind}.json`}))),
  retiredIds: {
    "bec-rust-project-standard": "cc-rust-project-standard",
    "bec-go-project-standard": "cc-go-project-standard",
    "bec-java-project-standard": "cc-java-project-standard",
    "bec-python-project-standard": "cc-python-project-standard",
    "bec-c-project-standard": "cc-c-project-standard",
    "bec-cpp-project-standard": "cc-cpp-project-standard",
    "bec-rust-async": "cc-rust-async",
    "bec-go-concurrency": "cc-go-concurrency",
    "bec-python-async": "cc-python-async",
    "bec-java-runtime": "cc-java-runtime",
    "bec-native-memory-safety": "cc-native-memory-safety",
  },
};
