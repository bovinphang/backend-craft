---
name: bec-doc-sync
description: "Use when Backend API, configuration, schema/migration, build commands, runtime behavior or release facts changed and repository documentation needs synchronization."
---

# Backend documentation synchronization

Use the local common fact-source method; inspect manifests, handlers/validators, contract sources, schemas, migrations and actual CLI/task definitions.

## Apply the workflow

1. Locate the actual project, task boundary and existing contracts; load only the language and domain material needed now.
2. Apply the [specialist checks](references/practice.md), establishing the input evidence before selecting the smallest change.
3. Verify affected behavior with existing repository tools. Explicitly report missing tools, environments or execution; a plan is not a passing result.
4. Deliver scope, specialist decisions, actual verification and remaining risk. A review-only task stays read-only.

Use the [local doc-sync method](references/common/doc-sync.md) when needed; the checks below specialize its backend subjects.

## Task boundary

Pure copy-editing is outside this workflow; generated output must be updated through its authoritative source and generator.
