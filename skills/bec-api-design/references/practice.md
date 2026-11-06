# Backend API contracts

## Specialist checks

1. Start from actual operations, clients, trust boundaries and deployed contract versions; distinguish missing business decisions from endpoint mechanics.

2. Specify validation, stable errors, status semantics and transport-independent business outcomes. Internal exceptions must not become public payloads.

3. For retries define key scope, payload conflicts, atomic uniqueness, in-progress behavior, result replay and retention. POST alone does not guarantee idempotency.

4. Evolve additive fields conservatively, keep old consumers working, and define deprecation/compatibility checks before removing fields.

5. For lists define stable ordering, pagination bounds and filtering behavior; for writes define concurrency/version preconditions and authorization at the server.

6. Validate with old-client contracts, invalid input, duplicate concurrent requests and timeout-after-commit cases. Document unresolved compatibility assumptions.

<a id="scope"></a>
## Scope and examples

Use for:
- Make order creation retries idempotent
- Evolve a request schema without breaking old clients
- Define stable API errors and validation boundaries
- Test pagination and concurrent retry contracts

Frontend data-fetching integration and product requirement handoff are separate; API shape does not replace authorization or database consistency.

## Evidence to deliver

- Repository/contract evidence and the exact affected scope.
- Chosen approach, invariants, resource/error or failure boundaries.
- Commands actually run and results, unrun checks and unproven claims.
- Compatibility, recovery/rollback or follow-up limits; review findings need verified locations.

## Primary reference

[Relevant official/project documentation](https://www.rfc-editor.org/rfc/rfc9110.html) (checked 2026-11-06). Match the actual project version before applying version-sensitive details; the page version does not authorize an upgrade.
