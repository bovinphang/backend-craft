# Spring Boot minimal boundary example

Missing MVC validation accepts an empty name with 201 and calls the service. The fixed @Valid controller returns 400 with an unchanged write counter.

Real Spring context + MockMvc validation and service-call boundary; no database or socket server.

Use the [verification instructions](../../references/verification.md). Prepare framework dependencies/tooling through the owning project workflow. All source resources are inside this package, with no neighboring skill dependency. Fault injection selects the same test case; normal application startup uses the protected implementation.
