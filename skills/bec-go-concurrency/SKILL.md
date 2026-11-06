---
name: bec-go-concurrency
description: "Use when Go goroutine leaks, channel ownership, cancellation propagation, synchronization, worker bounds or race conditions need implementation or diagnosis."
---

# Go concurrency lifecycle

List goroutine starters, stop signals, blocking operations and the party that waits for completion. A request return does not prove worker exit.

## Apply the workflow

1. Locate the actual project, task boundary and existing contracts; load only the language and domain material needed now.
2. Apply the [specialist checks](references/practice.md), establishing the input evidence before selecting the smallest change.
3. Verify affected behavior with existing repository tools. Explicitly report missing tools, environments or execution; a plan is not a passing result.
4. Deliver scope, specialist decisions, actual verification and remaining risk. A review-only task stays read-only.

## Task boundary

Use broader Go engineering guidance for module/package organization; buffering alone does not establish a safe lifecycle.
