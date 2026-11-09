# Backend architecture decisions

## Specialist checks

1. Read actual modules, call paths, deployment constraints and ownership before proposing a new topology. Capture current invariants and pain with evidence.

2. Assign business capabilities and data ownership explicitly. Keep dependency direction and public contracts understandable at module boundaries.

3. Compare the smallest viable alternatives against change frequency, failure isolation and operational cost. Preserve a working monolith when it meets the need.

4. Describe consistency units, retries, message delivery, timeout budgets and recovery ownership; no diagram substitutes for failure semantics.

5. Plan reversible migration slices and compatibility boundaries. Separate assumptions from verified constraints and identify decisions requiring product input.

6. Deliver an ADR with problem, alternatives, decision, evidence, consequences and validation. Use common diagram tools only when a diagram clarifies relationships.

<a id="scope"></a>
## Scope and examples

Use for:
- Define module boundaries for an existing backend
- Compare a modular monolith with service extraction
- Clarify data ownership and failure boundaries
- Write an architecture decision with migration and rollback

Do not turn an existing modular monolith into microservices without evidence; detailed API, database and runtime incidents have narrower workflows.

## Evidence to deliver

- Repository/contract evidence and the exact affected scope.
- Chosen approach, invariants, resource/error or failure boundaries.
- Commands actually run and results, unrun checks and unproven claims.
- Compatibility, recovery/rollback or follow-up limits; review findings need verified locations.

## Primary reference

[Relevant official/project documentation](https://www.rfc-editor.org/rfc/rfc9110.html) (checked 2026-11-06). Match the actual project version before applying version-sensitive details; the page version does not authorize an upgrade.

## Java service domain boundaries

Java service application, transport and persistence boundaries follow deployment and business consistency units; do not impose service layers on libraries or desktop modules.
