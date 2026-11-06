---
name: bec-rust-project-standard
description: "Use when Rust crate or workspace structure, module boundaries, ownership-facing APIs, Result conventions, Cargo dependencies or engineering checks need design or review."
---

# Rust project engineering

Read Cargo.toml, workspace membership, edition, MSRV and existing aliases before proposing modules or dependencies. Work in the owning crate rather than upgrading the entire workspace.

## Apply the workflow

1. Locate the actual project, task boundary and existing contracts; load only the language and domain material needed now.
2. Apply the [specialist checks](references/practice.md), establishing the input evidence before selecting the smallest change.
3. Verify affected behavior with existing repository tools. Explicitly report missing tools, environments or execution; a plan is not a passing result.
4. Deliver scope, specialist decisions, actual verification and remaining risk. A review-only task stays read-only.

## Task boundary

Existing Tokio cancellation or scheduling defects belong to the async specialty; unrelated frontend structure is outside this scope.
