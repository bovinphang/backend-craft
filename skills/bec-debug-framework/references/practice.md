# Backend diagnosis workflow

## Specialist checks

1. Apply the local common diagnosis method; record symptom, affected scope, environment and what changed before selecting experiments.

2. Build competing falsifiable hypotheses with required evidence and a result that would reject each one.

3. Collect bounded correlation, pool/query/downstream timings and relevant traces without credentials or raw personal payloads.

4. Reproduce or narrow the failure and change one relevant variable at a time; concurrent unrelated patches destroy attribution.

5. Repair the confirmed path, then test the original trigger, error recovery and adjacent behavior using the existing language tools.

6. Report facts, rejected/remaining hypotheses, actual checks and limits. Mark NOT PROVEN when evidence cannot establish the claimed root cause or fix.

<a id="scope"></a>
## Scope and examples

Use for:
- Investigate an intermittent backend 500 without guessing
- Compare connection-pool and downstream timeout hypotheses
- Reproduce a backend build or data failure
- Verify the smallest service bug fix with regression evidence

Performance measurement and security assessment can be narrower follow-ups; a symptom or colleague guess alone is not a root cause.

## Evidence to deliver

- Repository/contract evidence and the exact affected scope.
- Chosen approach, invariants, resource/error or failure boundaries.
- Commands actually run and results, unrun checks and unproven claims.
- Compatibility, recovery/rollback or follow-up limits; review findings need verified locations.

## Primary reference

[Relevant official/project documentation](https://docs.oracle.com/en/java/javase/21/troubleshoot/) (checked 2026-11-06). Match the actual project version before applying version-sensitive details; the page version does not authorize an upgrade.
