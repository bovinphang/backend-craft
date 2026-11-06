---
name: bec-python-project-standard
description: "Use when Python package layout, pyproject conventions, typing, import-time behavior, dependency boundaries or repository-wide Python quality checks need design or review."
---

# Python project engineering

Read pyproject, lock/environment conventions, supported Python versions and current package layout. Do not mix new installers or replace the environment implicitly.

## Apply the workflow

1. Locate the actual project, task boundary and existing contracts; load only the language and domain material needed now.
2. Apply the [specialist checks](references/practice.md), establishing the input evidence before selecting the smallest change.
3. Verify affected behavior with existing repository tools. Explicitly report missing tools, environments or execution; a plan is not a passing result.
4. Deliver scope, specialist decisions, actual verification and remaining risk. A review-only task stays read-only.

## Task boundary

Focused event-loop cancellation or blocking-I/O problems belong to the async specialty.
