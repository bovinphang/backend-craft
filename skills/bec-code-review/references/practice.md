# Backend code review

## Specialist checks

1. Establish diff scope, owning projects, contracts and actual verification results; read changed code and its callers before reporting risks.

2. Prioritize data corruption, authorization bypass, duplicated effects, deadlock/leaks and compatibility regressions over style.

3. For each finding include severity, verified file/line, trigger, user/business impact, minimal remedy and a regression scenario.

4. Inspect transaction/external-effect boundaries, cancellation/ownership, query scope and error mapping in context. Avoid reporting hypothetical exploits without a path.

5. Merge repeated low-level issues, acknowledge counter-evidence and distinguish missing test evidence from a proven runtime defect.

6. Save a concise review report with findings, verification and unresolved questions. Do not modify the implementation during a read-only review.

<a id="scope"></a>
## Scope and examples

Use for:
- Review a backend PR for transactions and retries
- Assess tenant authorization and API compatibility in a diff
- Check concurrency/resource regression evidence
- Write severity-ranked backend findings with locations

Review is read-only unless fixes are explicitly requested. Do not bury confirmed correctness/security defects under stylistic preferences.

## Evidence to deliver

- Repository/contract evidence and the exact affected scope.
- Chosen approach, invariants, resource/error or failure boundaries.
- Commands actually run and results, unrun checks and unproven claims.
- Compatibility, recovery/rollback or follow-up limits; review findings need verified locations.

## Primary reference

[Relevant official/project documentation](https://owasp.org/API-Security/editions/2023/en/0xa1-broken-object-level-authorization/) (checked 2026-11-06). Match the actual project version before applying version-sensitive details; the page version does not authorize an upgrade.
