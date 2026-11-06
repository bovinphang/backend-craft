---
name: bec-dependency-management
description: "Use when Backend dependencies, lockfiles, toolchain compatibility, transitive vulnerabilities or package/build upgrades need investigation or controlled migration."
---

# Backend dependency changes

Read manifest, lock, resolver/toolchain versions and actual dependency graph; distinguish direct and transitive introduction paths.

## Apply the workflow

1. Locate the actual project, task boundary and existing contracts; load only the language and domain material needed now.
2. Apply the [specialist checks](references/practice.md), establishing the input evidence before selecting the smallest change.
3. Verify affected behavior with existing repository tools. Explicitly report missing tools, environments or execution; a plan is not a passing result.
4. Deliver scope, specialist decisions, actual verification and remaining risk. A review-only task stays read-only.

## Task boundary

Do not replace all dependencies with latest versions, delete every lock or weaken package-source policies to make installation pass.
