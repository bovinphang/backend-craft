---
name: bec-tdd-workflow
description: "Use when A backend behavior, defect or testable refactoring step needs a focused regression or test-first implementation using the project language and test tools."
---

# Backend test-driven workflow

Use the local common test-first method; choose one observable behavior and the narrowest test layer that can prove it.

## Apply the workflow

1. Locate the actual project, task boundary and existing contracts; load only the language and domain material needed now.
2. Apply the [specialist checks](references/practice.md), establishing the input evidence before selecting the smallest change.
3. Verify affected behavior with existing repository tools. Explicitly report missing tools, environments or execution; a plan is not a passing result.
4. Deliver scope, specialist decisions, actual verification and remaining risk. A review-only task stays read-only.

Use the [local tdd method](references/common/tdd.md) when needed; the checks below specialize its backend subjects.

## Task boundary

A testing-strategy matrix is separate; tests added after existing code must not be mislabeled as a test-first cycle.
