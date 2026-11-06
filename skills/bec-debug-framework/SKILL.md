---
name: bec-debug-framework
description: "Use when Backend build failures, service errors, data inconsistencies, resource leaks or intermittent runtime symptoms need evidence-based investigation and repair."
---

# Backend diagnosis workflow

Apply the local common diagnosis method; record symptom, affected scope, environment and what changed before selecting experiments.

## Apply the workflow

1. Locate the actual project, task boundary and existing contracts; load only the language and domain material needed now.
2. Apply the [specialist checks](references/practice.md), establishing the input evidence before selecting the smallest change.
3. Verify affected behavior with existing repository tools. Explicitly report missing tools, environments or execution; a plan is not a passing result.
4. Deliver scope, specialist decisions, actual verification and remaining risk. A review-only task stays read-only.

Use the [local debug method](references/common/debug.md) when needed; the checks below specialize its backend subjects.

## Task boundary

Performance measurement and security assessment can be narrower follow-ups; a symptom or colleague guess alone is not a root cause.
