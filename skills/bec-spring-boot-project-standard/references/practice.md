# Spring Boot service engineering

1. Locate the actual Boot/JDK/BOM and Maven or Gradle wrapper, active configuration sources and component-scan boundaries. Do not upgrade the dependency platform implicitly.

2. Keep constructor injection and validated configuration properties explicit. Separate request DTO validation from application/service and persistence contracts.

3. Use the appropriate Jakarta validation annotation on MVC input. Rejected input must return a client error before a service/repository effect; test the negative boundary.

4. For transactions, inspect the real proxy call path, self-invocation, rollback rules and consistency unit. A local transaction does not atomically include external HTTP or messaging.

5. Choose MVC slices or a full Spring context from the question being tested. MockMvc tests MVC behavior without proving a listening server or real database isolation.

6. Own startup/shutdown resources and restrict Actuator/config exposure. Test database rollback/isolation against the actual database when making those claims.

## Version and official sources

Checked 2026-11-08; example target: Spring Boot 3.5.16 / Java 17。Match moving documentation to the actual project lock before applying it; these sources do not authorize a framework upgrade.

- [Boot 3.5 testing](https://docs.spring.io/spring-boot/3.5/reference/testing/spring-boot-applications.html)
- [Spring transaction annotations](https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/annotations.html)
