# Cache consistency and resilience

## Specialist checks

1. State the authoritative source, key ownership, freshness target and impact of stale reads; permissions may need fail-closed or version revalidation.

2. Define key scope and serialization compatibility, including tenant and schema version. Avoid cross-tenant sharing caused by incomplete keys.

3. Coordinate invalidation with committed changes, bounded TTL and refill/version rules. Describe what happens when an invalidation event is lost.

4. Use bounded request coalescing, lock ownership/expiry and jitter where appropriate; a lock without completion and failure rules can create a new outage.

5. Plan cache-outage behavior with limited authoritative reads and recovery. Do not make a cache the only truth merely to improve hit rate.

6. Test revoke/read races, lost invalidations, old-value refill, saturation and recovery. Measure latency and source load as well as hit rate.

<a id="scope"></a>
## Scope and examples

Use for:
- Invalidate cached permissions after revocation
- Avoid cache stampedes without unbounded locks
- Specify bounded stale data and cache fallback
- Test cache refill racing a committed update

Caching is not a substitute for authoritative data or server authorization; frontend query caches are a separate domain.

## Evidence to deliver

- Repository/contract evidence and the exact affected scope.
- Chosen approach, invariants, resource/error or failure boundaries.
- Commands actually run and results, unrun checks and unproven claims.
- Compatibility, recovery/rollback or follow-up limits; review findings need verified locations.

## Primary reference

[Relevant official/project documentation](https://www.postgresql.org/docs/current/transaction-iso.html) (checked 2026-11-06). Match the actual project version before applying version-sensitive details; the page version does not authorize an upgrade.
