---
name: bec-refactoring
description: "Use when Existing backend code needs responsibility extraction, module moves, control/data simplification or interface cleanup while preserving observable behavior."
---

# Backend behavior-preserving refactoring

Use the local common refactoring method; identify the structural problem and the observable input/output, error and side-effect contracts.

## Apply the workflow

1. Locate the actual project, task boundary and existing contracts; load only the language and domain material needed now.
2. Apply the [specialist checks](references/practice.md), establishing the input evidence before selecting the smallest change.
3. Verify affected behavior with existing repository tools. Explicitly report missing tools, environments or execution; a plan is not a passing result.
4. Deliver scope, specialist decisions, actual verification and remaining risk. A review-only task stays read-only.

Use the [local refactoring method](references/common/refactoring.md) when needed; the checks below specialize its backend subjects.

## Task boundary

Business-rule corrections, API behavior changes and dependency migrations must be identified separately from behavior-preserving refactoring.
