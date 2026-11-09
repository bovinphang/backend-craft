---
practiceCards:
  - id: "bec-code-review:evidence-severity"
    level: "required"
    sourceIds: ["google-review"]
    caseIds: ["EP-SVC-01"]
    evidence: "review-only"
  - id: "bec-code-review:compatibility"
    level: "required"
    sourceIds: ["google-review","ms-playbook"]
    caseIds: ["EP-SVC-01"]
    evidence: "review-only"
---

# Local engineering decisions

Locate the actual role, toolchain and existing conventions, then read relevant [shared principles](common/engineering-practices.md). These conditions apply to this entry, not every project. Structure checks do not prove all semantics or execution.

<a id="bec-code-review:evidence-severity"></a>
## Grade concrete user-visible effects

Level: required

### Risk
Preference-only blockers obscure defects and overload review.

### Applies
For a scoped review of actual changed files and behavior.

### Decision
Find the trigger, affected location, observed or justified effect and severity. Check existing project conventions and false positives before recommending the smallest correction.

### Exceptions
Public company style is not a universal blocker. Use the agreed review cadence; this task has one independent final review, not a new reviewer per card.

### Examples
Better: show a duplicate write after a lost response. Worse: block on personal naming taste.

### Verification
Reproduce important defects where possible, preserve the review and report unjudged boundaries.

### Sources
google-review — [registry and limits](common/engineering-practices.sources.json).

Evidence IDs: EP-SVC-01; review-only.  Execution status and scope require actual records; a related ID does not prove every decision on this card.

<a id="bec-code-review:compatibility"></a>
## Review actual consumers and migration states

Level: required

### Risk
A HEAD-only diff may omit existing untracked source and independently shipped consumers.

### Applies
For multi-repository/package changes and uncommitted baselines.

### Decision
Use the agreed actual baseline, include newly generated/untracked deliverables, and trace source → archive → installed consumer. Check old/new coexistence, ownership and user edit preservation.

### Exceptions
Do not review unrelated previous work as newly introduced or change another product implicitly. A directory count is not compatibility proof.

### Examples
Better: exercise old candidate conflict before any writes. Worse: bypass source ownership to make installation green.

### Verification
Validate exact archive bytes/pins plus relevant migration and consumer tests; state baseline and scope.

### Sources
google-review, ms-playbook — [registry and limits](common/engineering-practices.sources.json).

Evidence IDs: EP-SVC-01; review-only.  Execution status and scope require actual records; a related ID does not prove every decision on this card.
