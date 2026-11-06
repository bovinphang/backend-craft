---
name: bec-performance-optimization
description: "Use when Backend latency, throughput, resource saturation, query cost, profiling, contention or performance regression need measurement and optimization."
---

# Backend performance evidence

Fix workload, data size, concurrency, environment and measurement method before comparing runs. Record a repeatable baseline and variability.

## Apply the workflow

1. Locate the actual project, task boundary and existing contracts; load only the language and domain material needed now.
2. Apply the [specialist checks](references/practice.md), establishing the input evidence before selecting the smallest change.
3. Verify affected behavior with existing repository tools. Explicitly report missing tools, environments or execution; a plan is not a passing result.
4. Deliver scope, specialist decisions, actual verification and remaining risk. A review-only task stays read-only.

## Task boundary

Do not apply global caching, async conversion or pool expansion without a measured bottleneck; frontend rendering is outside scope.
