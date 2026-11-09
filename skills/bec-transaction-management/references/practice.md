# Transaction and side-effect consistency

## Specialist checks

1. List durable state, consistency invariants, transaction owner and every external effect. Identify what the actual storage engine can guarantee.

2. Keep the local atomic unit short and explicit. Choose isolation/locking from the anomaly to prevent, with bounded contention and retry behavior.

3. For commit-then-publish gaps consider a durable outbox in the same local transaction, an owned dispatcher and idempotent consumers.

4. External payment or remote calls need business operation identifiers, uncertain-result reconciliation and explicit compensation where applicable.

5. Bound retries, preserve deduplication state and make exhausted work observable/replayable. Avoid promising exactly-once delivery across arbitrary systems.

6. Inject failures before/after commit, during publication and acknowledgement, plus duplicate/out-of-order delivery. Use real storage for isolation claims.

<a id="scope"></a>
## Scope and examples

Use for:
- Handle commit success followed by message publication failure
- Design retry-safe payment side effects
- Review isolation and concurrent updates
- Test outbox replay and duplicate delivery

A local database transaction does not provide atomicity with an external service; use API and database workflows for their narrower contract details.

## Evidence to deliver

- Repository/contract evidence and the exact affected scope.
- Chosen approach, invariants, resource/error or failure boundaries.
- Commands actually run and results, unrun checks and unproven claims.
- Compatibility, recovery/rollback or follow-up limits; review findings need verified locations.

## Primary reference

[Relevant official/project documentation](https://www.postgresql.org/docs/current/transaction-iso.html) (checked 2026-11-06). Match the actual project version before applying version-sensitive details; the page version does not authorize an upgrade.

## Java service domain boundaries

3. Place transaction scope around the actual consistency unit, not arbitrary controller methods. Specify rollback behavior and avoid unmanaged external effects inside a local transaction.

5. Test use-case invariants, absent records, repeated operations and repository failures. Only a real database test supports claims about isolation/rollback.
