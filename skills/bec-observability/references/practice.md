# Backend observability

## Specialist checks

1. Start from operational questions and service objectives; identify the entry, dependency and storage signals needed to answer them.

2. Use metrics for aggregates, traces for causal request paths and structured logs for bounded event details; define stable correlation fields.

3. Keep metric dimensions bounded: route templates/status categories rather than user IDs or arbitrary URLs.

4. Redact credentials and minimize personal data before emission. Apply retention/access controls instead of relying on a report reader to remove secrets.

5. Budget collection overhead, sampling and export failure; diagnostic collection must have duration/volume limits and respect production permissions.

6. Exercise one controlled request/failure to verify correlation and field filtering. Report coverage gaps, not just the volume of logs.

<a id="scope"></a>
## Scope and examples

Use for:
- Correlate backend request traces with database waits
- Control metric cardinality and sensitive fields
- Design bounded sampling for error diagnostics
- Verify service latency and error telemetry end to end

Telemetry is evidence for diagnosis, not a substitute for reproduction or a guaranteed root cause; avoid unbounded labels and secrets.

## Evidence to deliver

- Repository/contract evidence and the exact affected scope.
- Chosen approach, invariants, resource/error or failure boundaries.
- Commands actually run and results, unrun checks and unproven claims.
- Compatibility, recovery/rollback or follow-up limits; review findings need verified locations.

## Primary reference

[Relevant official/project documentation](https://opentelemetry.io/docs/concepts/signals/) (checked 2026-11-06). Match the actual project version before applying version-sensitive details; the page version does not authorize an upgrade.
