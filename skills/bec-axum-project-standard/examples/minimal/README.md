# Axum minimal boundary example

The defective rejection branch records work and returns 200. The fixed branch preserves JsonRejection as 4xx and records no work.

Real Axum Router and Tower oneshot requests, not a network server, database or load test.

Use the [verification instructions](../../references/verification.md). Prepare framework dependencies/tooling through the owning project workflow. All source resources are inside this package, with no neighboring skill dependency. Fault injection selects the same test case; normal application startup uses the protected implementation.
