---
practiceCards:
  - id: "bec-database-design:migration-compatibility"
    level: "required"
    sourceIds: ["google-review","ms-playbook"]
    caseIds: ["EP-SVC-01"]
    evidence: "review-only"
  - id: "bec-database-design:query-bounds"
    level: "recommended"
    sourceIds: ["aws-retry","ms-playbook"]
    caseIds: ["EP-SVC-01"]
    evidence: "review-only"
---

# Local engineering decisions

Locate the actual role, toolchain and existing conventions, then read relevant [shared principles](common/engineering-practices.md). These conditions apply to this entry, not every project. Structure checks do not prove all semantics or execution.

<a id="bec-database-design:migration-compatibility"></a>
## Keep migrations compatible with deployed readers

Level: required

### Risk
Schema removal or reinterpretation can break running older code.

### Applies
For persisted representation changes and independently deployed clients.

### Decision
Use the actual engine/migration conventions, separate expansion, bounded backfill and contraction where needed; verify constraints, old readers/writers and recovery with real storage.

### Exceptions
Do not mandate a universal migration framework or transaction syntax. An in-memory HTTP map cannot prove schema/locking/rollback semantics.

### Examples
Better: measure backfill and validate before removing the old column. Worse: call a destructive migration reversible because code can be reverted.

### Verification
Run relevant engine integration and rollback/recovery checks; record locks, data volume and any untested engine/version.

### Sources
google-review, ms-playbook — [registry and limits](common/engineering-practices.sources.json).

Evidence IDs: EP-SVC-01; review-only.  Execution status and scope require actual records; a related ID does not prove every decision on this card.

<a id="bec-database-design:query-bounds"></a>
## Bound queries from actual access patterns

Level: recommended

### Risk
Unbounded work amplifies load and timeouts under retries.

### Applies
For query endpoints and background data processing.

### Decision
Set project-appropriate pagination, stable ordering, batch/timeout limits and cancellation ownership; inspect actual query plans and indexes for evidenced hot paths.

### Exceptions
No universal page size or index count is imposed. In-memory benchmarks do not establish database performance.

### Examples
Better: an indexed bounded query with a deadline. Worse: fetch all records and paginate in the UI.

### Verification
Verify bounds and representative plans against the real engine/data scale; test cancellation and exhausted budgets separately.

### Sources
aws-retry, ms-playbook — [registry and limits](common/engineering-practices.sources.json).

Evidence IDs: EP-SVC-01; review-only.  Execution status and scope require actual records; a related ID does not prove every decision on this card.
