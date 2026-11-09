---
practiceCards:
  - id: "bec-testing-strategy:fault-matrix"
    level: "required"
    sourceIds: ["ms-playbook","ms-faults"]
    caseIds: ["EP-SVC-01"]
    evidence: "review-only"
  - id: "bec-testing-strategy:real-integration"
    level: "required"
    sourceIds: ["ms-playbook","ms-faults"]
    caseIds: ["EP-SVC-01"]
    evidence: "review-only"
---

# Local engineering decisions

Locate the actual role, toolchain and existing conventions, then read relevant [shared principles](common/engineering-practices.md). These conditions apply to this entry, not every project. Structure checks do not prove all semantics or execution.

<a id="bec-testing-strategy:fault-matrix"></a>
## Choose tests from failure impact

Level: required

### Risk
Happy paths alone miss rejected inputs and post-commit failures.

### Applies
For changed contracts and reliability-sensitive paths.

### Decision
Select the smallest useful layer for input rejection, owned cleanup, concurrent duplicates and uncertain outcomes; keep existing tools. Pair an actual assertion counterexample with its protected path.

### Exceptions
Do not demand new tests for every reversible cosmetic edit or add a second test framework. A compile error is not a business counterexample.

### Examples
Better: a real HTTP client observes replay and effect count. Worse: a fake response always says PASS.

### Verification
Require named nonzero executed cases, actual exit/counts and failure markers; preserve missing tools/skips separately.

### Sources
ms-playbook, ms-faults — [registry and limits](common/engineering-practices.sources.json).

Evidence IDs: EP-SVC-01; review-only.  Execution status and scope require actual records; a related ID does not prove every decision on this card.

<a id="bec-testing-strategy:real-integration"></a>
## Match claims to the executed boundary

Level: required

### Risk
A substitute can pass while the real framework or storage semantics differ.

### Applies
When asserting engine, framework or deployment behavior.

### Decision
Use actual compatible dependencies and real boundary tests for the claimed property; isolate preparation, lock inputs and record tool versions, hashes, commands and logs.

### Exceptions
Unit/in-memory tests remain useful for their scope; they cannot prove database isolation, distributed durability or production authentication. Do not expand scope merely to fill a matrix.

### Examples
Better: mark DB integration NOT RUN beside the HTTP result. Worse: rename an in-memory test a transaction integration.

### Verification
Verify packed/isolated inputs and explicit missing/skip outcomes; report platform and remaining gaps.

### Sources
ms-playbook, ms-faults — [registry and limits](common/engineering-practices.sources.json).

Evidence IDs: EP-SVC-01; review-only.  Execution status and scope require actual records; a related ID does not prove every decision on this card.
