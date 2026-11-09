# FastAPI service engineering

1. Read the actual FastAPI, Starlette, Pydantic and Python versions, environment lock, application factory and router ownership before changing an API.

2. Keep application resources in lifespan and per-request resources in appropriately scoped dependencies. Acquire before use and release on normal, exceptional and cancelled paths.

3. Keep request and response contracts explicit and avoid leaking persistence/private fields through serialization. Overrides must be restored after tests.

4. Use async only with nonblocking work. Bound thread offloading, pool waits and background tasks; cancellation of a coroutine does not necessarily stop its underlying operation.

5. Enter lifespan in tests. A TestClient context manager starts and closes it; a bare ASGI transport does not by itself demonstrate lifespan initialization.

6. Use real infrastructure tests for driver cancellation, transactions and shutdown claims; the local resource example proves FastAPI lifecycle wiring only.

## Version and official sources

Checked 2026-11-08; example target: FastAPI 0.141.1 / Python 3.14.7 / httpx 0.28.1。Match moving documentation to the actual project lock before applying it; these sources do not authorize a framework upgrade.

- [Lifespan](https://fastapi.tiangolo.com/advanced/events/)
- [Testing lifespan](https://fastapi.tiangolo.com/advanced/testing-events/)
