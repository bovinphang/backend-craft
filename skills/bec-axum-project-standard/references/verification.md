# Verification contract

The defective rejection branch records work and returns 200. The fixed branch preserves JsonRejection as 4xx and records no work.

Run inside the local [example directory](../examples/minimal/README.md):

```sh
cargo test --offline --locked --features defective
cargo test --offline --locked
```



Real Axum Router and Tower oneshot requests, not a network server, database or load test.

Record RED→GREEN only after actual business assertions fail and the normal version passes. Missing tools/dependencies and build failures are MISSING/FAIL, not behavior evidence. This example does not prove database isolation/rollback, a network server, load behavior or a deployed container. The product repository can explicitly prepare Docker environments; this standalone skill does not depend on that helper.

## Recorded execution

On 2026-11-08 the same business assertions produced RED→GREEN.

```text
rustc 1.96.1 (31fca3adb 2026-06-26)
cargo 1.96.1 (356927216 2026-06-26)
axum v0.8.9
└── craft-axum-contract v0.1.0 (/work)
```

This covers the in-process boundary above, not databases, load or deployment.
