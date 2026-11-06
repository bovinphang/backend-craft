# Backend behavior-preserving refactoring

## Specialist checks

1. Use the local common refactoring method; identify the structural problem and the observable input/output, error and side-effect contracts.

2. Create characterization or regression evidence for current boundaries, including money rounding, ordering and partial failures where relevant.

3. Separate a desired business fix from the structural move; define its changed expectation in a distinct work item rather than hiding it in cleanup.

4. Choose small reversible transformations, keep old call boundaries until consumers migrate and run the same relevant checks after each step.

5. Compare errors, transaction scope, resource lifetime and externally visible timing/ordering assumptions, not just returned values.

6. Deliver structural rationale and PASS/PARTIAL/NOT PROVEN behavior evidence with scope limits. Inspection alone cannot prove complete equivalence.

<a id="scope"></a>
## Scope and examples

Use for:
- Move a billing calculation without changing rounding
- Extract a backend module with baseline behavior tests
- Simplify service logic in reversible verified steps
- Prove a refactor preserves errors and side effects

Business-rule corrections, API behavior changes and dependency migrations must be identified separately from behavior-preserving refactoring.

## Evidence to deliver

- Repository/contract evidence and the exact affected scope.
- Chosen approach, invariants, resource/error or failure boundaries.
- Commands actually run and results, unrun checks and unproven claims.
- Compatibility, recovery/rollback or follow-up limits; review findings need verified locations.

## Primary reference

[Relevant official/project documentation](https://www.postgresql.org/docs/current/transaction-iso.html) (checked 2026-11-06). Match the actual project version before applying version-sensitive details; the page version does not authorize an upgrade.
