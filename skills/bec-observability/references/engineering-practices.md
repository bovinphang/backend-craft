---
practiceCards:
  - id: "bec-observability:correlated-errors"
    level: "required"
    sourceIds: ["aws-retry","google-review"]
    caseIds: ["EP-SVC-01"]
    evidence: "review-only"
  - id: "bec-observability:safe-diagnostics"
    level: "required"
    sourceIds: ["google-review","ms-playbook"]
    caseIds: ["EP-SVC-01"]
    evidence: "review-only"
---

# Local engineering decisions

Locate the actual role, toolchain and existing conventions, then read relevant [shared principles](common/engineering-practices.md). These conditions apply to this entry, not every project. Structure checks do not prove all semantics or execution.

<a id="bec-observability:correlated-errors"></a>
## Correlate failure without changing its meaning

Level: required

### Risk
Swallowed causes or repeated logs hide the failing operation and retry owner.

### Applies
For request/job failures and recovery paths.

### Decision
Preserve the cause chain internally, assign a stable operation/correlation identity, expose bounded stable public errors and record retry/commit uncertainty at its owner.

### Exceptions
Do not leak a native exception stack to callers or log the same full event at every layer. Existing telemetry tools remain authoritative.

### Examples
Better: correlate the uncertain result and later replay without inventing success. Worse: catch/log/return success.

### Verification
Check public errors and internal correlation with synthetic faults, including exhaustion and response failure.

### Sources
aws-retry, google-review — [registry and limits](common/engineering-practices.sources.json).

Evidence IDs: EP-SVC-01; review-only.  Execution status and scope require actual records; a related ID does not prove every decision on this card.

<a id="bec-observability:safe-diagnostics"></a>
## Bound diagnostic data and cardinality

Level: required

### Risk
Raw payloads, credentials or unbounded labels create disclosure and resource risks.

### Applies
For logs, metrics, traces and failure reports.

### Decision
Use approved safe fields, redaction and bounded sizes; keep operation IDs out of unbounded metric labels and avoid secrets/raw personal data in diagnostics. Confirm project retention/access policy.

### Exceptions
These are project boundary decisions, not a claim that every cited company uses identical logging policy. Do not read production secrets to create a test.

### Examples
Better: synthetic IDs and selected error codes. Worse: dump headers, tokens and environment on a failed test.

### Verification
Assert safe public/log fields with synthetic values and inspect label/size bounds; production access and retention remain deployment checks.

### Sources
google-review, ms-playbook — [registry and limits](common/engineering-practices.sources.json).

Evidence IDs: EP-SVC-01; review-only.  Execution status and scope require actual records; a related ID does not prove every decision on this card.
