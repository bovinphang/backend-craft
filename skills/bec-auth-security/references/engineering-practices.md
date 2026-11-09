---
practiceCards:
  - id: "bec-auth-security:verified-context"
    level: "required"
    sourceIds: ["electron-security","tauri-permissions","google-review"]
    caseIds: ["EP-SVC-01"]
    evidence: "review-only"
  - id: "bec-auth-security:object-scope"
    level: "required"
    sourceIds: ["google-review","ms-faults"]
    caseIds: ["EP-SVC-01"]
    evidence: "review-only"
---

# Local engineering decisions

Locate the actual role, toolchain and existing conventions, then read relevant [shared principles](common/engineering-practices.md). These conditions apply to this entry, not every project. Structure checks do not prove all semantics or execution.

<a id="bec-auth-security:verified-context"></a>
## Build authority from verified request context

Level: required

### Risk
Client-provided identity or role fields can impersonate authority.

### Applies
At service trust boundaries; desktop trust guidance is adapted by analogy, not a server authentication specification.

### Decision
Use the existing verified principal/session mechanism, validate issuer/audience/expiry where applicable, derive a minimal context and enforce permissions before effects. Keep parsing and authentication distinct.

### Exceptions
The service example uses a synthetic fixed test principal; it is not authentication. Do not prescribe a new identity provider or expose secrets to diagnose requests.

### Examples
Better: server-derived principal scopes a key. Worse: accept an X-Role or renderer payload as permission proof.

### Verification
Test absent/invalid identity and denied paths with the project auth stack; the related HTTP case only proves deduplication behavior.

### Sources
electron-security, tauri-permissions, google-review — [registry and limits](common/engineering-practices.sources.json).

Evidence IDs: EP-SVC-01; review-only.  Execution status and scope require actual records; a related ID does not prove every decision on this card.

<a id="bec-auth-security:object-scope"></a>
## Authorize the actual object and action

Level: required

### Risk
Authenticated callers may still cross tenant or object boundaries.

### Applies
For object access and writes involving caller-controlled identifiers.

### Decision
Apply object/action/tenant checks at the authoritative use-case boundary, before disclosure or mutation, and bind repeated operations to that verified scope. Minimize returned fields.

### Exceptions
A UI route guard, a valid ID or successful authentication alone does not prove object authorization. Batch and background paths need their actual owner.

### Examples
Better: test another tenant’s valid object ID. Worse: test only unauthenticated requests.

### Verification
Verify denied reads/writes produce no disclosure/effect and permitted paths still succeed, using synthetic data.

### Sources
google-review, ms-faults — [registry and limits](common/engineering-practices.sources.json).

Evidence IDs: EP-SVC-01; review-only.  Execution status and scope require actual records; a related ID does not prove every decision on this card.
