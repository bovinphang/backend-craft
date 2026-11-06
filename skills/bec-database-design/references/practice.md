# Database evolution and queries

## Specialist checks

1. Confirm engine/version, data volume/distribution, critical queries, constraints and deployment ownership. Read plans and lock/latency evidence when available.

2. Model keys, cardinality, nullability and uniqueness from invariants. ORM mappings do not replace database constraints or query review.

3. Use engine-appropriate index and query changes based on measured predicates, ordering and write cost; avoid claiming a generic online operation is lock-free.

4. Separate expand, compatible reads/writes, bounded backfill, validation and contract removal. Determine each phase failure and pause condition.

5. Specify rollback compatibility and treatment of newly written data. A destructive down migration is not automatically a safe rollback.

6. Rehearse with representative size and permissions; measure locks, replication lag and error rates. Do not run production migrations as part of automatic validation.

<a id="scope"></a>
## Scope and examples

Use for:
- Roll out a NOT NULL column on a large table
- Review indexes with actual query plans
- Design staged data backfill and constraint validation
- Plan schema compatibility and migration rollback

Do not issue universal production DDL without the actual database/version and operational constraints; transaction orchestration is a separate focus.

## Evidence to deliver

- Repository/contract evidence and the exact affected scope.
- Chosen approach, invariants, resource/error or failure boundaries.
- Commands actually run and results, unrun checks and unproven claims.
- Compatibility, recovery/rollback or follow-up limits; review findings need verified locations.

## Primary reference

[Relevant official/project documentation](https://www.postgresql.org/docs/current/sql-createindex.html) (checked 2026-11-06). Match the actual project version before applying version-sensitive details; the page version does not authorize an upgrade.
