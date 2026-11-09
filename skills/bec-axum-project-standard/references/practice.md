# Axum service engineering

1. Confirm Axum/Tower/Tokio versions and actual dependency keys, route modules, State and layer placement; do not infer a service from Rust alone.

2. Model extraction order and ownership explicitly. Body-consuming extractors must follow the framework contract; preserve client failures as 4xx rather than translating them into success.

3. Keep State small and share only deliberate owners. Never hold a blocking mutex across await or perform unbounded blocking work in a handler.

4. Review request/body limits, timeout and middleware ordering from the actual service stack. Distinguish a timeout response from stopping an underlying side effect.

5. Exercise Router with Tower oneshot for rejection/success behavior and effect counts. A compiled handler is not proof of a working router or database transaction.

6. Own spawned work and graceful shutdown. Verify real network/database/load behavior separately when making operational claims.

## Version and official sources

Checked 2026-11-08; example target: Axum 0.8.9 / Rust 1.96 container。Match moving documentation to the actual project lock before applying it; these sources do not authorize a framework upgrade.

- [Axum extractors](https://docs.rs/axum/0.8.9/axum/extract/)
- [JsonRejection](https://docs.rs/axum/0.8.9/axum/extract/rejection/enum.JsonRejection.html)
