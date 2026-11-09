# FastAPI minimal boundary example

The defective lifespan omits initialization and requests receive 503 instead of 200. The fixed lifespan initializes before yield and closes in finally, including after a failed request.

Actual TestClient lifecycle and request behavior; the resource is local, not a real database pool.

Use the [verification instructions](../../references/verification.md). Prepare framework dependencies/tooling through the owning project workflow. All source resources are inside this package, with no neighboring skill dependency. Fault injection selects the same test case; normal application startup uses the protected implementation.
