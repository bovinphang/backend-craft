---
practiceCards:
  - id: "bec-transaction-management:commit-ambiguity"
    level: "required"
    sourceIds: ["aws-idempotency","aws-retry"]
    caseIds: ["EP-SVC-01"]
    evidence: "review-only"
  - id: "bec-transaction-management:replay-boundaries"
    level: "required"
    sourceIds: ["aws-idempotency","ms-faults"]
    caseIds: ["EP-SVC-01"]
    evidence: "review-only"
---

# Local engineering decisions

Locate the actual role, toolchain and existing conventions, then read relevant [shared principles](common/engineering-practices.md). These conditions apply to this entry, not every project. Structure checks do not prove all semantics or execution.

<a id="bec-transaction-management:commit-ambiguity"></a>
## Preserve uncertainty after a lost response

Level: required

### Risk
A caller timeout can occur after a successful commit.

### Applies
For state-changing operations across a response or acknowledgement boundary.

### Decision
Separate known rejection, known success and unknown outcome. Reconcile by operation identity; retry only within a safe replay contract and deadline. Record causes without exposing internals.

### Exceptions
Cancellation is not remote rollback. Database atomicity and external effects need their actual transaction/outbox or reconciliation design.

### Examples
Better: reuse the same intent/key to learn the committed result. Worse: compensate blindly after every timeout.

### Verification
Inject a failure after the effect and before success acknowledgement. EP-SVC-01 covers process memory/HTTP only, not real transactional isolation.

### Sources
aws-idempotency, aws-retry — [registry and limits](common/engineering-practices.sources.json).

Evidence IDs: EP-SVC-01; review-only.  Execution status and scope require actual records; a related ID does not prove every decision on this card.

<a id="bec-transaction-management:replay-boundaries"></a>
## Give replay a consistency owner

Level: required

### Risk
Uncoordinated duplicate consumers can repeat irreversible effects.

### Applies
For retrying transactions, dispatchers and message consumers.

### Decision
Identify the durable atomic unit, key retention and external effects; use existing engine guarantees and explicit idempotent consumers or reconciliation. Bound replay and expose exhausted work.

### Exceptions
Outbox does not automatically make arbitrary external services exactly-once. A process mutex has no crash or multi-process guarantee.

### Examples
Better: durable effect/result and dedupe state share an intentional consistency design. Worse: claim exactly-once from a local map or happy-path test.

### Verification
Use real engine/message tests for their guarantees and controlled duplicates/out-of-order/crash windows; mark absent integration NOT RUN.

### Sources
aws-idempotency, ms-faults — [registry and limits](common/engineering-practices.sources.json).

Evidence IDs: EP-SVC-01; review-only.  Execution status and scope require actual records; a related ID does not prove every decision on this card.
