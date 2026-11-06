# Backend performance evidence

## Specialist checks

1. Fix workload, data size, concurrency, environment and measurement method before comparing runs. Record a repeatable baseline and variability.

2. Separate service time from queueing and downstream wait; collect evidence that distinguishes CPU, I/O, locks, allocations and query cost.

3. Change the smallest evidenced constraint and preserve correctness contracts, especially cancellation, authorization and consistency.

4. Compare equivalent load across repeated runs, observing errors, resource use and tail latency rather than only average time.

5. Define saturation and rollback thresholds; bound diagnostic load and distinguish capacity improvements from shifted bottlenecks.

6. Deliver baseline, profile/trace evidence, change, measured effect and unverified conditions. Never invent percentages when no measurement ran.

<a id="scope"></a>
## Scope and examples

Use for:
- Find the measured bottleneck in a slow service
- Compare backend p99 changes under equivalent load
- Profile database and CPU contributions to latency
- Set performance regression and rollback thresholds

Do not apply global caching, async conversion or pool expansion without a measured bottleneck; frontend rendering is outside scope.

## Evidence to deliver

- Repository/contract evidence and the exact affected scope.
- Chosen approach, invariants, resource/error or failure boundaries.
- Commands actually run and results, unrun checks and unproven claims.
- Compatibility, recovery/rollback or follow-up limits; review findings need verified locations.

## Primary reference

[Relevant official/project documentation](https://opentelemetry.io/docs/concepts/signals/) (checked 2026-11-06). Match the actual project version before applying version-sensitive details; the page version does not authorize an upgrade.
