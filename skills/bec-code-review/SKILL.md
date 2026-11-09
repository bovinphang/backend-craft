---
name: bec-code-review
description: "Use when A backend diff, pull request or release change needs read-only review for correctness, concurrency, consistency, security, compatibility and test evidence."
---

# Backend code review

Establish diff scope, owning projects, contracts and actual verification results; read changed code and its callers before reporting risks.

## Apply the workflow

1. Locate the actual project, task boundary and existing contracts; load only the language and domain material needed now.
2. Apply the [specialist checks](references/practice.md), establishing the input evidence before selecting the smallest change.
3. Verify affected behavior with existing repository tools. Explicitly report missing tools, environments or execution; a plan is not a passing result.
4. Deliver scope, specialist decisions, actual verification and remaining risk. A review-only task stays read-only.

## Task boundary

Review is read-only unless fixes are explicitly requested. Do not bury confirmed correctness/security defects under stylistic preferences.

## Engineering practices

Read the [local engineering decisions](references/engineering-practices.md) for this task and follow their links to relevant shared principles. Apply levels and exceptions against actual project contracts; product frontend/backend labels do not constrain language or role.
