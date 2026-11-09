---
practiceCards:
  - id: "bec-axum-project-standard:rejection-contract"
    level: "conditional"
    sourceIds: ["axum-extractors","rust-api"]
    caseIds: ["EP-SVC-01"]
    evidence: "review-only"
  - id: "bec-axum-project-standard:state-lifecycle"
    level: "conditional"
    sourceIds: ["axum-extractors","tokio-join"]
    caseIds: ["EP-SVC-01"]
    evidence: "review-only"
---

# Local engineering decisions

Locate the actual role, toolchain and existing conventions, then read relevant [shared principles](common/engineering-practices.md). These conditions apply to this entry, not every project. Structure checks do not prove all semantics or execution.

<a id="bec-axum-project-standard:rejection-contract"></a>
## Preserve extractor rejection semantics

Level: conditional

### Risk
Extraction failure can be hidden as success or effects can precede validation.

### Applies
For the actual Axum/Tower route and extractor versions.

### Decision
Order extractors by their contract, with body-consuming Json last. Handle JsonRejection deliberately without converting invalid client input to success; effects follow validated extraction.

### Exceptions
Not all rejections are one status. Follow actual version/error mapping and route layers; compiling a handler is not router execution.

### Examples
Better: Router/Tower oneshot rejects malformed input and no effect occurs. Worse: catch all extraction errors and return an OK body.

### Verification
Run existing minimal Router rejection/valid pair; record that network, DB and deployment remain separate.

### Sources
axum-extractors, rust-api — [registry and limits](common/engineering-practices.sources.json).

Evidence IDs: EP-SVC-01; review-only.  Execution status and scope require actual records; a related ID does not prove every decision on this card.

<a id="bec-axum-project-standard:state-lifecycle"></a>
## Own State and spawned work explicitly

Level: conditional

### Risk
Shared State can hide blocking locks, unbounded work or abandoned tasks.

### Applies
For service state, handler concurrency and graceful shutdown.

### Decision
Share deliberate owners, keep critical sections short and avoid blocking mutex guards across await. Bound blocking work and explicitly stop/await spawned tasks on their owning lifecycle.

### Exceptions
A timeout response does not prove side effects stopped; dropping a Tokio JoinHandle does not cancel its task. Use project runtime/version conventions.

### Examples
Better: extract needed data, release the guard, then await. Worse: detach work and declare shutdown complete.

### Verification
Verify real runtime/lifecycle effects with owned-task tests; extractor tests alone do not prove State cleanup or DB isolation.

### Sources
axum-extractors, tokio-join — [registry and limits](common/engineering-practices.sources.json).

Evidence IDs: EP-SVC-01; review-only.  Execution status and scope require actual records; a related ID does not prove every decision on this card.
