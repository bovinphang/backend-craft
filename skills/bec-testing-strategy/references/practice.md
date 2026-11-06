# Backend testing strategy

## Specialist checks

1. Enumerate business invariants, trust boundaries, side effects and important failure modes before choosing a test framework.

2. Use unit tests for local decisions, contracts for producer/consumer compatibility and real integrations for storage, isolation and resource behavior.

3. Cover duplicate delivery, timeout after commit, cancellation, concurrency and recovery with controlled events rather than arbitrary sleeps.

4. Choose representative system journeys for business outcomes; do not replace every lower-layer check with a costly end-to-end test.

5. Define fixture ownership, isolation, cleanup and external-service opt-in. Mock success does not prove database consistency or authorization enforcement.

6. Deliver a risk-to-layer-to-evidence matrix with commands, actual results and missing environments. Coverage percentage alone is not release safety.

<a id="scope"></a>
## Scope and examples

Use for:
- Map backend payment risks to test layers
- Plan database rollback and retry integration tests
- Assess API compatibility and failure-path coverage
- Report release verification gaps beyond coverage percentage

This plans test coverage; use TDD for implementing a particular behavior and debugging for explaining an existing failure.

## Evidence to deliver

- Repository/contract evidence and the exact affected scope.
- Chosen approach, invariants, resource/error or failure boundaries.
- Commands actually run and results, unrun checks and unproven claims.
- Compatibility, recovery/rollback or follow-up limits; review findings need verified locations.

## Primary reference

[Relevant official/project documentation](https://docs.python.org/3/library/unittest.html) (checked 2026-11-06). Match the actual project version before applying version-sensitive details; the page version does not authorize an upgrade.
