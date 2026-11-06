---
name: bec-rust-async
description: "Use when Rust futures, Tokio tasks, cancellation safety, bounded async concurrency, blocking boundaries or shutdown behavior need implementation or diagnosis."
---

# Rust async lifecycle

Identify runtime/version and every suspension point, resource owner and cancellation boundary. Check the actual future documentation before assuming cancellation safety.

## Apply the workflow

1. Locate the actual project, task boundary and existing contracts; load only the language and domain material needed now.
2. Apply the [specialist checks](references/practice.md), establishing the input evidence before selecting the smallest change.
3. Verify affected behavior with existing repository tools. Explicitly report missing tools, environments or execution; a plan is not a passing result.
4. Deliver scope, specialist decisions, actual verification and remaining risk. A review-only task stays read-only.

## Task boundary

Use the project standard for crate layout; only apply Tokio-specific behavior when Tokio and its actual version are present.
