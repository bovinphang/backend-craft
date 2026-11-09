---
practiceCards:
  - id: "bec-fastapi-project-standard:lifespan-ownership"
    level: "conditional"
    sourceIds: ["fastapi-lifespan","python-asyncio"]
    caseIds: ["EP-SVC-01"]
    evidence: "review-only"
  - id: "bec-fastapi-project-standard:cancellation-boundary"
    level: "conditional"
    sourceIds: ["python-asyncio","fastapi-lifespan"]
    caseIds: ["EP-SVC-01"]
    evidence: "review-only"
---

# Local engineering decisions

Locate the actual role, toolchain and existing conventions, then read relevant [shared principles](common/engineering-practices.md). These conditions apply to this entry, not every project. Structure checks do not prove all semantics or execution.

<a id="bec-fastapi-project-standard:lifespan-ownership"></a>
## Own application resources in actual lifespan

Level: conditional

### Risk
An import-time or unentered startup resource can be absent during requests or never close.

### Applies
For app-wide resources in the project’s FastAPI/Starlette lifecycle.

### Decision
Acquire/release in the configured async context-manager lifespan and use properly scoped dependencies for per-request resources. Enter TestClient as a context manager when testing startup/shutdown.

### Exceptions
Do not assume a bare ASGI transport starts lifespan or mix alternative startup mechanisms without checking actual behavior. No new framework upgrade is required.

### Examples
Better: request sees an acquired resource and exit records one close. Worse: only import the module and infer startup ran.

### Verification
Run the existing FastAPI minimal lifecycle pair; distinguish real lifespan wiring from driver transactions and production shutdown.

### Sources
fastapi-lifespan, python-asyncio — [registry and limits](common/engineering-practices.sources.json).

Evidence IDs: EP-SVC-01; review-only.  Execution status and scope require actual records; a related ID does not prove every decision on this card.

<a id="bec-fastapi-project-standard:cancellation-boundary"></a>
## Propagate cancellation to its actual owner

Level: conditional

### Risk
Coroutine cancellation may leave underlying I/O, threads or detached work running.

### Applies
For async routes/dependencies and owned background work.

### Decision
Preserve cancellation, release resources in finally/context managers, bound blocking offload and pool waits, and join owned work on shutdown according to actual driver behavior.

### Exceptions
A cancelled task does not prove a database command or remote write was undone. Shared application work may outlive one request by explicit design.

### Examples
Better: define who stops and awaits an owned task. Worse: catch cancellation and silently return success.

### Verification
Test the real driver/task boundary for cancellation claims; the lifespan sample alone does not cover them.

### Sources
python-asyncio, fastapi-lifespan — [registry and limits](common/engineering-practices.sources.json).

Evidence IDs: EP-SVC-01; review-only.  Execution status and scope require actual records; a related ID does not prove every decision on this card.
