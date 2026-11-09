---
name: bec-testing-strategy
description: "Use when Backend risk coverage, unit/integration/contract/system test boundaries, database concurrency tests or release validation gaps need planning or assessment."
---

# Backend testing strategy

Enumerate business invariants, trust boundaries, side effects and important failure modes before choosing a test framework.

## Apply the workflow

1. Locate the actual project, task boundary and existing contracts; load only the language and domain material needed now.
2. Apply the [specialist checks](references/practice.md), establishing the input evidence before selecting the smallest change.
3. Verify affected behavior with existing repository tools. Explicitly report missing tools, environments or execution; a plan is not a passing result.
4. Deliver scope, specialist decisions, actual verification and remaining risk. A review-only task stays read-only.

## Task boundary

This plans test coverage; use TDD for implementing a particular behavior and debugging for explaining an existing failure.

## Engineering practices

Read the [local engineering decisions](references/engineering-practices.md) for this task and follow their links to relevant shared principles. Apply levels and exceptions against actual project contracts; product frontend/backend labels do not constrain language or role.
