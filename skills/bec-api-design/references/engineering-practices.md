---
practiceCards:
  - id: "bec-api-design:idempotent-intent"
    level: "required"
    sourceIds: ["aws-idempotency","aws-retry"]
    caseIds: ["EP-SVC-01"]
    evidence: "case"
  - id: "bec-api-design:compatibility-window"
    level: "required"
    sourceIds: ["google-review","ms-playbook"]
    caseIds: ["EP-SVC-01"]
    evidence: "review-only"
---

# Local engineering decisions

Locate the actual role, toolchain and existing conventions, then read relevant [shared principles](common/engineering-practices.md). These conditions apply to this entry, not every project. Structure checks do not prove all semantics or execution.

<a id="bec-api-design:idempotent-intent"></a>
## Deduplicate an operation with the same intent

Level: required

### Risk
A response failure after commit can duplicate a write on retry.

### Applies
For write APIs whose clients may replay an uncertain request.

### Decision
Scope a key to verified caller/operation, bind it to canonical business intent, atomically own execution and record the result. Define in-progress, conflict, retention and replay behavior. Reuse the same key only for the same intent; bound client retries.

### Exceptions
A key header alone provides no guarantee. Durable/multi-process effects need durable atomic deduplication or reconciliation, not a process map. Status codes in the example are its contract.

### Examples
Better: same key and intent reuses the stored result; changed intent is rejected. Worse: generate a new key on every retry or replay all 5xx writes.

### Verification
EP-SVC-01 uses real HTTP clients, commit-then-response failure, changed intent and concurrent duplicates; inspect actual effect count. Database, crash recovery and authentication are not covered.

### Sources
aws-idempotency, aws-retry — [registry and limits](common/engineering-practices.sources.json).

Evidence IDs: EP-SVC-01; case. [Local runnable example](../examples/engineering/README.md). Execution status and scope require actual records; a related ID does not prove every decision on this card.

<a id="bec-api-design:compatibility-window"></a>
## Evolve the contract for deployed consumers

Level: required

### Risk
A type-compatible source change may break deployed wire consumers.

### Applies
For public or independently deployed request/response contracts.

### Decision
Identify actual clients and version/absence/error semantics; prefer additive evolution, defined deprecation windows and tested adapters before removal. Validate untrusted input before effects.

### Exceptions
Unknown fields, enum additions and optionality are consumer-specific; do not assume every additive change is safe or force an API technology migration.

### Examples
Better: test old request/response fixtures against the changed boundary. Worse: infer wire compatibility from compiling the server alone.

### Verification
Exercise old-client behavior, invalid inputs and stable error semantics with current tooling; distinguish schema checks from runtime effects.

### Sources
google-review, ms-playbook — [registry and limits](common/engineering-practices.sources.json).

Evidence IDs: EP-SVC-01; review-only.  Execution status and scope require actual records; a related ID does not prove every decision on this card.
