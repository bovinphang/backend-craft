---
name: bec-java-runtime
description: "Use when Java thread pools, JVM memory/GC, JFR or thread-dump evidence, blocking contention or runtime latency need diagnosis or controlled tuning."
---

# Java runtime diagnosis

Align throughput, latency percentiles, errors, queue waits, CPU, allocation/GC and downstream timings on the same interval.

## Apply the workflow

1. Locate the actual project, task boundary and existing contracts; load only the language and domain material needed now.
2. Apply the [specialist checks](references/practice.md), establishing the input evidence before selecting the smallest change.
3. Verify affected behavior with existing repository tools. Explicitly report missing tools, environments or execution; a plan is not a passing result.
4. Deliver scope, specialist decisions, actual verification and remaining risk. A review-only task stays read-only.

## Task boundary

Application package design uses the Java project standard; tuning without runtime evidence is not an optimization result.
