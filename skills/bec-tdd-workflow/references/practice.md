# Backend test-driven workflow

## Specialist checks

1. Use the local common test-first method; choose one observable behavior and the narrowest test layer that can prove it.

2. Write a meaningful failing expectation, run it and verify failure is caused by the missing behavior rather than syntax, setup or a missing compiler.

3. Implement the smallest change, run the same test green and then refactor under the relevant suite. Keep actual command/results as evidence.

4. For concurrency use barriers and invariant assertions; for database atomicity use a real appropriate integration rather than a constant-success mock.

5. When code already exists, describe the work as regression verification, reproduce the old defect where feasible and do not invent a past test-first sequence.

6. If tools/environments are unavailable, deliver the test and explicit unrun steps; evidence remains NOT PROVEN until execution, regardless of deadline pressure.

<a id="scope"></a>
## Scope and examples

Use for:
- Reproduce a concurrent inventory bug before fixing it
- Implement a backend behavior through observable red and green
- Use real storage for a transactional TDD regression
- Report missing toolchains without claiming tests ran

A testing-strategy matrix is separate; tests added after existing code must not be mislabeled as a test-first cycle.

## Evidence to deliver

- Repository/contract evidence and the exact affected scope.
- Chosen approach, invariants, resource/error or failure boundaries.
- Commands actually run and results, unrun checks and unproven claims.
- Compatibility, recovery/rollback or follow-up limits; review findings need verified locations.

## Primary reference

[Relevant official/project documentation](https://docs.python.org/3/library/unittest.html) (checked 2026-11-06). Match the actual project version before applying version-sensitive details; the page version does not authorize an upgrade.
