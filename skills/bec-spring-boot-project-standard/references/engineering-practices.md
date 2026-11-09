---
practiceCards:
  - id: "bec-spring-boot-project-standard:validation-effects"
    level: "conditional"
    sourceIds: ["spring-tests","google-java"]
    caseIds: ["EP-SVC-01"]
    evidence: "review-only"
  - id: "bec-spring-boot-project-standard:lifecycle-boundary"
    level: "conditional"
    sourceIds: ["spring-tests","oracle-resources"]
    caseIds: ["EP-SVC-01"]
    evidence: "review-only"
---

# Local engineering decisions

Locate the actual role, toolchain and existing conventions, then read relevant [shared principles](common/engineering-practices.md). These conditions apply to this entry, not every project. Structure checks do not prove all semantics or execution.

<a id="bec-spring-boot-project-standard:validation-effects"></a>
## Reject MVC input before service effects

Level: conditional

### Risk
DTO constraints can exist without being applied on the actual MVC route.

### Applies
For the project’s Spring MVC/Bean Validation versions, not every Java library.

### Decision
Check actual request mapping, Jakarta validation activation and error mapping; rejected input must not reach service/repository effects. Exercise MockMvc or the appropriate real boundary.

### Exceptions
[Validation details](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-methods/requestbody.html) must match the project version. MockMvc is not a listening server or database proof; keep the current BOM.

### Examples
Better: invalid payload returns a client error and service effect count stays zero. Worse: unit-test a DTO without invoking MVC.

### Verification
Run the existing minimal Spring counterexample/fix; record the actual Boot/JDK. Related EP-SVC-01 does not prove Spring validation.

### Sources
spring-tests, google-java — [registry and limits](common/engineering-practices.sources.json).

Evidence IDs: EP-SVC-01; review-only.  Execution status and scope require actual records; a related ID does not prove every decision on this card.

<a id="bec-spring-boot-project-standard:lifecycle-boundary"></a>
## Locate the Spring resource and transaction owner

Level: conditional

### Risk
Unmanaged resources or an unexamined proxy path can escape cleanup/transaction expectations.

### Applies
For actual Spring-owned components, startup/shutdown and transaction changes.

### Decision
Use existing constructor injection/config validation; locate bean destruction and actual transaction proxy call paths, including self-invocation and rollback rules. Bound external effects separately.

### Exceptions
A local transaction does not atomically include remote HTTP. The MVC sample does not execute real DB rollback or deployment shutdown.

### Examples
Better: verify the actual configured owner releases its resource. Worse: assume an annotation proves every call is transactional.

### Verification
Select context/slice/integration tests by the property; use real storage for isolation claims and report missing shutdown/DB checks.

### Sources
spring-tests, oracle-resources — [registry and limits](common/engineering-practices.sources.json).

Evidence IDs: EP-SVC-01; review-only.  Execution status and scope require actual records; a related ID does not prove every decision on this card.
