---
name: bec-auth-security
description: "Use when Backend authentication, object/tenant authorization, untrusted input, service credentials, server-side attack surfaces or security regression tests need implementation or review."
---

# Server authorization and security

Map entry points, trusted identity, tenant/object boundaries and sensitive operations. Separate authentication from authorization at every access path.

## Apply the workflow

1. Locate the actual project, task boundary and existing contracts; load only the language and domain material needed now.
2. Apply the [specialist checks](references/practice.md), establishing the input evidence before selecting the smallest change.
3. Verify affected behavior with existing repository tools. Explicitly report missing tools, environments or execution; a plan is not a passing result.
4. Deliver scope, specialist decisions, actual verification and remaining risk. A review-only task stays read-only.

## Task boundary

Gateway authentication or frontend hiding is not object authorization; do not disclose secrets or execute unapproved production attack tests.
