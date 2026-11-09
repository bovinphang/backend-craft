---
name: bec-database-design
description: "Use when Backend schema, query/index design, database migrations, data constraints or database rollout/rollback risks need design or review."
---

# Database evolution and queries

Confirm engine/version, data volume/distribution, critical queries, constraints and deployment ownership. Read plans and lock/latency evidence when available.

## Apply the workflow

1. Locate the actual project, task boundary and existing contracts; load only the language and domain material needed now.
2. Apply the [specialist checks](references/practice.md), establishing the input evidence before selecting the smallest change.
3. Verify affected behavior with existing repository tools. Explicitly report missing tools, environments or execution; a plan is not a passing result.
4. Deliver scope, specialist decisions, actual verification and remaining risk. A review-only task stays read-only.

## Task boundary

Do not issue universal production DDL without the actual database/version and operational constraints; transaction orchestration is a separate focus.

## Engineering practices

Read the [local engineering decisions](references/engineering-practices.md) for this task and follow their links to relevant shared principles. Apply levels and exceptions against actual project contracts; product frontend/backend labels do not constrain language or role.
