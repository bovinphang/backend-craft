---
name: bec-gin-project-standard
description: Use when a Gin HTTP service needs work on binding and validation, middleware order and Abort semantics, context lifetime, error responses, cancellation, test routing or graceful shutdown. A Go CLI or library without Gin is outside this specialty.
---

# Gin service engineering

Locate the owning service and task boundary. Apply framework mechanisms to the locked version; language alone does not establish a service role.

1. Read framework/runtime versions, locks and existing configuration/layers before changing behavior or tooling.
2. Apply the [specialist practice](references/practice.md), identifying route/input contracts, resource ownership and failure/effect boundaries.
3. Use the [minimal example](examples/minimal/README.md) and [verification checklist](references/verification.md) for the same defective/fixed assertions. Missing environments are not a business RED.
4. Deliver evidence, actual results, compatibility decisions and gaps. Verify database, network, load and deployment claims separately.

## Engineering practices

Read the [local engineering decisions](references/engineering-practices.md) for this task and follow their links to relevant shared principles. Apply levels and exceptions against actual project contracts; product frontend/backend labels do not constrain language or role.
