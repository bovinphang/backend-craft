---
name: bec-architecture-design
description: "Use when Backend module/service boundaries, data ownership, dependency direction, consistency requirements or architecture tradeoffs need design or review."
---

# Backend architecture decisions

Read actual modules, call paths, deployment constraints and ownership before proposing a new topology. Capture current invariants and pain with evidence.

## Apply the workflow

1. Locate the actual project, task boundary and existing contracts; load only the language and domain material needed now.
2. Apply the [specialist checks](references/practice.md), establishing the input evidence before selecting the smallest change.
3. Verify affected behavior with existing repository tools. Explicitly report missing tools, environments or execution; a plan is not a passing result.
4. Deliver scope, specialist decisions, actual verification and remaining risk. A review-only task stays read-only.

## Task boundary

Do not turn an existing modular monolith into microservices without evidence; detailed API, database and runtime incidents have narrower workflows.

## Engineering practices

Read the [local engineering decisions](references/engineering-practices.md) for this task and follow their links to relevant shared principles. Apply levels and exceptions against actual project contracts; product frontend/backend labels do not constrain language or role.
