---
practiceCards:
  - id: "bec-drogon-project-standard:filter-continuation"
    level: "conditional"
    sourceIds: ["drogon-filters","cpp-core"]
    caseIds: ["EP-SVC-01"]
    evidence: "review-only"
  - id: "bec-drogon-project-standard:callback-lifetime"
    level: "conditional"
    sourceIds: ["drogon-filters","cpp-core"]
    caseIds: ["EP-SVC-01"]
    evidence: "review-only"
---

# Local engineering decisions

Locate the actual role, toolchain and existing conventions, then read relevant [shared principles](common/engineering-practices.md). These conditions apply to this entry, not every project. Structure checks do not prove all semantics or execution.

<a id="bec-drogon-project-standard:filter-continuation"></a>
## Complete one Filter branch once

Level: conditional

### Risk
Rejecting a Filter and invoking continuation can still execute the Controller.

### Applies
For the project’s callback-based Drogon Filter API.

### Decision
On denial invoke the rejection callback once and return; invoke the chain callback only for the allowed branch. Verify actual controller reachability and response count.

### Exceptions
The minimal example’s synthetic role header is not authentication. Match the actual Filter/Middleware or coroutine API rather than treating them as interchangeable.

### Examples
Better: denial produces one response and zero Controller effects. Worse: reject then call fccb.

### Verification
Run existing linked Drogon contract executable; distinguish in-process Filter/Controller behavior from listening HTTP and production auth.

### Sources
drogon-filters, cpp-core — [registry and limits](common/engineering-practices.sources.json).

Evidence IDs: EP-SVC-01; review-only.  Execution status and scope require actual records; a related ID does not prove every decision on this card.

<a id="bec-drogon-project-standard:callback-lifetime"></a>
## Keep callback captures alive through completion

Level: conditional

### Risk
Borrowed stack captures or competing completion paths can cause lifetime errors/double responses.

### Applies
For asynchronous Drogon request/client/ORM callbacks.

### Decision
Capture an intentional owning object or safe value, ensure exactly one response completion across success/error/timeout, and keep transaction handles alive for their actual async unit. Keep blocking work off the event loop.

### Exceptions
Callback syntax alone is not nonblocking or cancellation support. The local Filter test does not prove async ORM transactions or network shutdown.

### Examples
Better: explicit owner survives until completion. Worse: borrow a handler stack local after returning.

### Verification
Exercise changed async paths with actual library/driver and lifetime/concurrency tooling as available; mark unrun DB/shutdown claims.

### Sources
drogon-filters, cpp-core — [registry and limits](common/engineering-practices.sources.json).

Evidence IDs: EP-SVC-01; review-only.  Execution status and scope require actual records; a related ID does not prove every decision on this card.
