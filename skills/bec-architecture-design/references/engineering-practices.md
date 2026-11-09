---
practiceCards:
  - id: "bec-architecture-design:failure-units"
    level: "required"
    sourceIds: ["aws-retry","ms-faults"]
    caseIds: ["EP-SVC-01"]
    evidence: "review-only"
  - id: "bec-architecture-design:reversible-change"
    level: "recommended"
    sourceIds: ["google-review","ms-playbook"]
    caseIds: ["EP-SVC-01"]
    evidence: "review-only"
---

# Local engineering decisions

Locate the actual role, toolchain and existing conventions, then read relevant [shared principles](common/engineering-practices.md). These conditions apply to this entry, not every project. Structure checks do not prove all semantics or execution.

<a id="bec-architecture-design:failure-units"></a>
## Design observable failure units

Level: required

### Risk
A network boundary can fail independently after a durable effect.

### Applies
For services crossing storage, queues or remote systems.

### Decision
List invariants, actual owners and failure/timeout boundaries; give each external effect a recovery or reconciliation path. Bound deadlines, admission and retry amplification at the appropriate owner.

### Exceptions
A local library does not need service infrastructure. Add queues, outboxes or breakers only for evidenced failure needs.

### Examples
Better: identify commit-success/response-loss as uncertain to the caller. Worse: label every timeout as rollback.

### Verification
Inject scoped faults before/after the real boundary and observe effects, results and recovery. The in-memory HTTP case does not prove database/distributed atomicity.

### Sources
aws-retry, ms-faults — [registry and limits](common/engineering-practices.sources.json).

Evidence IDs: EP-SVC-01; review-only.  Execution status and scope require actual records; a related ID does not prove every decision on this card.

<a id="bec-architecture-design:reversible-change"></a>
## Stage changes around recoverable states

Level: recommended

### Risk
A coordinated release can strand older consumers or irreversible data.

### Applies
For architecture migrations with independently deployed readers/writers.

### Decision
Prefer a small compatible stage, explicit old/new coexistence period, observable rollout and a rollback that remains valid for already-written data. Record decisions and evidence.

### Exceptions
Do not add feature flags or dual writes to a small local refactor without need; dual writes require an explicit consistency owner.

### Examples
Better: expand readers before producing a new required representation. Worse: rely on reverting code to undo destructive data changes.

### Verification
Exercise the affected old consumer and failure recovery; document data changes that prevent rollback.

### Sources
google-review, ms-playbook — [registry and limits](common/engineering-practices.sources.json).

Evidence IDs: EP-SVC-01; review-only.  Execution status and scope require actual records; a related ID does not prove every decision on this card.
