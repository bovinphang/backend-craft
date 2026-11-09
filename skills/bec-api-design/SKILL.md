---
name: bec-api-design
description: "Use when Service API request/response semantics, compatibility, pagination, idempotency, error contracts or server-side API validation need design or review."
---

# Backend API contracts

Start from actual operations, clients, trust boundaries and deployed contract versions; distinguish missing business decisions from endpoint mechanics.

## Apply the workflow

1. Locate the actual project, task boundary and existing contracts; load only the language and domain material needed now.
2. Apply the [specialist checks](references/practice.md), establishing the input evidence before selecting the smallest change.
3. Verify affected behavior with existing repository tools. Explicitly report missing tools, environments or execution; a plan is not a passing result.
4. Deliver scope, specialist decisions, actual verification and remaining risk. A review-only task stays read-only.

## Task boundary

Frontend data-fetching integration and product requirement handoff are separate; API shape does not replace authorization or database consistency.

## Engineering practices

Read the [local engineering decisions](references/engineering-practices.md) for this task and follow their links to relevant shared principles. Apply levels and exceptions against actual project contracts; product frontend/backend labels do not constrain language or role.
