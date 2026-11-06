---
name: bec-cpp-project-standard
description: "Use when C++ module/header boundaries, resource lifetime, exception safety, ABI, build-standard conventions or project-wide C++ checks need design or review."
---

# C++ project engineering

Read the actual C++ standard, standard library, compiler matrix, build presets and exported ABI before choosing features.

## Apply the workflow

1. Locate the actual project, task boundary and existing contracts; load only the language and domain material needed now.
2. Apply the [specialist checks](references/practice.md), establishing the input evidence before selecting the smallest change.
3. Verify affected behavior with existing repository tools. Explicitly report missing tools, environments or execution; a plan is not a passing result.
4. Deliver scope, specialist decisions, actual verification and remaining risk. A review-only task stays read-only.

## Task boundary

Do not upgrade the C++ standard or replace the build system without a task need; pure C interfaces retain their own contract.
