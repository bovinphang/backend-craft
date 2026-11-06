# Server authorization and security

## Specialist checks

1. Map entry points, trusted identity, tenant/object boundaries and sensitive operations. Separate authentication from authorization at every access path.

2. Derive authorization context from verified server-side identity and permissions, not client-supplied tenant/object claims alone.

3. Constrain queries and operations to authorized resources, including bulk/export/background paths; deny when required authorization cannot be confirmed.

4. Validate and bound input, parameterize database operations, and evaluate outbound requests/files/deserialization against actual trust boundaries.

5. Keep credentials and raw sensitive payloads out of logs/reports. Use minimal permissions and review rotation, expiry and revocation behavior.

6. Test unauthenticated, wrong-object, wrong-tenant, revoked and elevated-action cases. Report confirmed evidence and remaining bypass coverage separately.

<a id="scope"></a>
## Scope and examples

Use for:
- Fix tenant isolation in a server API
- Review object-level authorization after JWT validation
- Test forbidden cross-tenant and privilege paths
- Handle server secrets and untrusted service input

Gateway authentication or frontend hiding is not object authorization; do not disclose secrets or execute unapproved production attack tests.

## Evidence to deliver

- Repository/contract evidence and the exact affected scope.
- Chosen approach, invariants, resource/error or failure boundaries.
- Commands actually run and results, unrun checks and unproven claims.
- Compatibility, recovery/rollback or follow-up limits; review findings need verified locations.

## Primary reference

[Relevant official/project documentation](https://owasp.org/API-Security/editions/2023/en/0xa1-broken-object-level-authorization/) (checked 2026-11-06). Match the actual project version before applying version-sensitive details; the page version does not authorize an upgrade.
