---
practiceCards:
  - id: "bec-dependency-management:platform-compatibility"
    level: "recommended"
    sourceIds: ["typescript-publishing","google-review"]
    caseIds: ["EP-SVC-01"]
    evidence: "review-only"
  - id: "bec-dependency-management:artifact-consumer"
    level: "required"
    sourceIds: ["typescript-publishing","ms-playbook"]
    caseIds: ["EP-SVC-01"]
    evidence: "review-only"
---

# Local engineering decisions

Locate the actual role, toolchain and existing conventions, then read relevant [shared principles](common/engineering-practices.md). These conditions apply to this entry, not every project. Structure checks do not prove all semantics or execution.

<a id="bec-dependency-management:platform-compatibility"></a>
## Respect the evidenced platform contract

Level: recommended

### Risk
A guideline’s newer dependency can break an existing runtime or deployment.

### Applies
For language/framework/dependency changes.

### Decision
Inspect exact manifests/locks, engines, peer/platform and migration notes; choose a scoped compatible update, isolate sample dependencies and preserve reproducible builds.

### Exceptions
A source document’s newest release does not authorize upgrading the user project. Keep the current package manager and safety policy.

### Examples
Better: explicit compatible sample toolchain. Worse: lower supply-chain checks to install an unpublished candidate.

### Verification
Run existing lint/types/build and affected runtime/consumer tests; record minimum versions that were declared but not actually tested.

### Sources
typescript-publishing, google-review — [registry and limits](common/engineering-practices.sources.json).

Evidence IDs: EP-SVC-01; review-only.  Execution status and scope require actual records; a related ID does not prove every decision on this card.

<a id="bec-dependency-management:artifact-consumer"></a>
## Validate the artifact consumers install

Level: required

### Risk
Sibling workspace sources can hide incomplete published files or integrity drift.

### Applies
For shipped packages and shared content updates.

### Decision
Inspect actual archive files, exact immutable version/SRI and isolated supported consumers. Regenerate common references from the installed authoritative package, not a neighbor checkout.

### Exceptions
Do not overwrite consumed version bytes or replace dependencies with file/link paths. An unpublished local artifact remains local evidence until publication.

### Examples
Better: both products pin one verified archive. Worse: copy a missing source file by hand and leave the lock unchanged.

### Verification
Check package closure, bilingual code/locks, ownership-safe migrations and no build caches; retain artifacts and provenance.

### Sources
typescript-publishing, ms-playbook — [registry and limits](common/engineering-practices.sources.json).

Evidence IDs: EP-SVC-01; review-only.  Execution status and scope require actual records; a related ID does not prove every decision on this card.
