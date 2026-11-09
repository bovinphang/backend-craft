# Verification contract

The defective lifespan omits initialization and requests receive 503 instead of 200. The fixed lifespan initializes before yield and closes in finally, including after a failed request.

Run inside the local [example directory](../examples/minimal/README.md):

```sh
python -m unittest -v test_lifespan.py
```

Set CRAFT_EXAMPLE_DEFECTIVE=1 using the host shell to select the explicit faulty test variant; reset to 0 and require the same assertions to pass. Do not use the faulty variant for normal application startup.

Actual TestClient lifecycle and request behavior; the resource is local, not a real database pool.

Record RED→GREEN only after actual business assertions fail and the normal version passes. Missing tools/dependencies and build failures are MISSING/FAIL, not behavior evidence. This example does not prove database isolation/rollback, a network server, load behavior or a deployed container. The product repository can explicitly prepare Docker environments; this standalone skill does not depend on that helper.

## Recorded execution

On 2026-11-08 the same business assertions produced RED→GREEN.

```text
Python 3.14.7; FastAPI 0.141.1; Starlette 1.6.0; httpx 0.28.1
```

This covers the in-process boundary above, not databases, load or deployment.
