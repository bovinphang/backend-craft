# Verification contract

The defective handler calls AbortWithStatusJSON and continues into business work. The fixed handler returns immediately and invalid input has zero effects.

Run inside the local [example directory](../examples/minimal/README.md):

```sh
go test -mod=readonly -count=1 -v ./...
```

Set CRAFT_EXAMPLE_DEFECTIVE=1 using the host shell to select the explicit faulty test variant; reset to 0 and require the same assertions to pass. Do not use the faulty variant for normal application startup.

Real Gin router + httptest binding and effect counts, without a listening server or database.

Record RED→GREEN only after actual business assertions fail and the normal version passes. Missing tools/dependencies and build failures are MISSING/FAIL, not behavior evidence. This example does not prove database isolation/rollback, a network server, load behavior or a deployed container. The product repository can explicitly prepare Docker environments; this standalone skill does not depend on that helper.

## Recorded execution

On 2026-11-08 the same business assertions produced RED→GREEN.

```text
go version go1.25.14 linux/amd64
github.com/gin-gonic/gin v1.11.0
```

This covers the in-process boundary above, not databases, load or deployment.
