---
name: bec-cache-design
description: "Use when Backend cache ownership, invalidation, stale data, hotspot contention, stampedes, consistency or cache-failure fallback need design or diagnosis."
---

# Cache consistency and resilience

State the authoritative source, key ownership, freshness target and impact of stale reads; permissions may need fail-closed or version revalidation.

## Apply the workflow

1. Locate the actual project, task boundary and existing contracts; load only the language and domain material needed now.
2. Apply the [specialist checks](references/practice.md), establishing the input evidence before selecting the smallest change.
3. Verify affected behavior with existing repository tools. Explicitly report missing tools, environments or execution; a plan is not a passing result.
4. Deliver scope, specialist decisions, actual verification and remaining risk. A review-only task stays read-only.

## Task boundary

Caching is not a substitute for authoritative data or server authorization; frontend query caches are a separate domain.
