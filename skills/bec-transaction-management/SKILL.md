---
name: bec-transaction-management
description: "Use when Local transaction boundaries, isolation, concurrent writes, message delivery, retries or distributed business consistency need design or diagnosis."
---

# Transaction and side-effect consistency

List durable state, consistency invariants, transaction owner and every external effect. Identify what the actual storage engine can guarantee.

## Apply the workflow

1. Locate the actual project, task boundary and existing contracts; load only the language and domain material needed now.
2. Apply the [specialist checks](references/practice.md), establishing the input evidence before selecting the smallest change.
3. Verify affected behavior with existing repository tools. Explicitly report missing tools, environments or execution; a plan is not a passing result.
4. Deliver scope, specialist decisions, actual verification and remaining risk. A review-only task stays read-only.

## Task boundary

A local database transaction does not provide atomicity with an external service; use API and database workflows for their narrower contract details.
