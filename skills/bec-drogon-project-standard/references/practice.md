# Drogon service engineering

1. Read the actual Drogon/Trantor/compiler versions, CMake targets and Controller/Filter registration. Keep pure C++ library conventions separate from service mechanisms.

2. A rejected Filter must call its rejection callback once and return without calling the continuation. Test both response count and whether the actual Controller can run.

3. Own callback captures and request/response resources until completion. Avoid borrowed stack references in asynchronous callbacks and double completion on timeout/error paths.

4. Keep blocking work off event-loop threads. Choose async ORM/client APIs from actual driver contracts and define cancellation/backpressure rather than assuming callbacks are nonblocking.

5. Keep transaction objects alive across the required async unit. Test real database commit/rollback separately; callback tests do not prove persistence guarantees.

6. Use the existing Drogon test mechanism or a linked in-process contract executable, then verify HTTP routing, shutdown, target linking/runtime libraries and deployment separately.

## Version and official sources

Checked 2026-11-08; example target: Drogon 1.9 API / C++17; actual container version in evidence。Match moving documentation to the actual project lock before applying it; these sources do not authorize a framework upgrade.

- [Filter and middleware](https://github.com/drogonframework/drogon/wiki/ENG-05-Middleware-and-Filter)
- [Testing framework](https://github.com/drogonframework/drogon/wiki/ENG-19-Testing-Framework)
