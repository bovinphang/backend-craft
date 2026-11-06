---
name: bec-observability
description: "Use when Service logs, metrics, traces, correlation, cardinality, sampling, SLO signals or diagnostic instrumentation need design or review."
---

# Backend observability

Start from operational questions and service objectives; identify the entry, dependency and storage signals needed to answer them.

## Apply the workflow

1. Locate the actual project, task boundary and existing contracts; load only the language and domain material needed now.
2. Apply the [specialist checks](references/practice.md), establishing the input evidence before selecting the smallest change.
3. Verify affected behavior with existing repository tools. Explicitly report missing tools, environments or execution; a plan is not a passing result.
4. Deliver scope, specialist decisions, actual verification and remaining risk. A review-only task stays read-only.

## Task boundary

Telemetry is evidence for diagnosis, not a substitute for reproduction or a guaranteed root cause; avoid unbounded labels and secrets.
