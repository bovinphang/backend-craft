---
practiceCards:
  - id: "bec-gin-project-standard:abort-return"
    level: "conditional"
    sourceIds: ["gin-binding","go-context"]
    caseIds: ["EP-SVC-01"]
    evidence: "review-only"
  - id: "bec-gin-project-standard:context-lifecycle"
    level: "conditional"
    sourceIds: ["go-context","gin-binding"]
    caseIds: ["EP-SVC-01"]
    evidence: "review-only"
---

# Local engineering decisions

Locate the actual role, toolchain and existing conventions, then read relevant [shared principles](common/engineering-practices.md). These conditions apply to this entry, not every project. Structure checks do not prove all semantics or execution.

<a id="bec-gin-project-standard:abort-return"></a>
## Stop the current handler after rejecting input

Level: conditional

### Risk
Abort stops pending handlers but does not return from the current function.

### Applies
For Gin middleware/handler input rejection.

### Decision
Choose Bind/ShouldBind deliberately. On a handled ShouldBindJSON error, write the intended rejection, Abort where needed, and return before any service effect or second response.

### Exceptions
Do not assume a framework binder performs domain authorization. Respect current router/middleware registration and version.

### Examples
Better: explicit return after rejection and zero effects. Worse: AbortWithStatus then continue into a write.

### Verification
Exercise the actual Gin router through httptest and observe valid/invalid effects; EP-SVC-01 is a separate standard-library HTTP case.

### Sources
gin-binding, go-context — [registry and limits](common/engineering-practices.sources.json).

Evidence IDs: EP-SVC-01; review-only.  Execution status and scope require actual records; a related ID does not prove every decision on this card.

<a id="bec-gin-project-standard:context-lifecycle"></a>
## Keep request context within its lifetime

Level: conditional

### Risk
Gin reuses request context and a long-lived goroutine can read invalid or racing state.

### Applies
For async work launched by Gin handlers.

### Decision
Copy needed immutable values, propagate Request.Context deadlines for request-owned work and give deliberate background work a separate bounded lifecycle owner. Use c.Copy only within its read-only contract.

### Exceptions
A copied Gin context does not extend response writer safety or prove an external operation stopped. Do not keep the original *gin.Context in a goroutine.

### Examples
Better: pass an ID and context.Context to owned work. Worse: capture c and write a response after return.

### Verification
Use actual concurrency/shutdown tests (race tools when supported) and verify owned goroutines exit; router rejection tests do not prove this lifetime.

### Sources
go-context, gin-binding — [registry and limits](common/engineering-practices.sources.json).

Evidence IDs: EP-SVC-01; review-only.  Execution status and scope require actual records; a related ID does not prove every decision on this card.
