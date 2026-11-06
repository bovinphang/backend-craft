# Backend dependency changes

## Specialist checks

1. Read manifest, lock, resolver/toolchain versions and actual dependency graph; distinguish direct and transitive introduction paths.

2. Verify official advisories, affected ranges, triggering conditions and fixed versions. Presence of a package is not proof of exploitability.

3. Choose the smallest supported upgrade/override and check API, ABI, minimum toolchain and build-plugin compatibility.

4. Use the repository package manager and deterministic lock workflow; preserve unrelated resolutions and inspect generated lock changes.

5. Validate resolution, build and affected behavior, including serialization/runtime boundaries where relevant. Keep a rollback artifact or known lock state.

6. Report evidence, exact changes and untested combinations. Source/network/policy failures require explanation, not a silent global configuration relaxation.

<a id="scope"></a>
## Scope and examples

Use for:
- Assess whether a transitive vulnerability affects this backend
- Make a minimal dependency and lockfile upgrade
- Keep the declared toolchain while fixing a package issue
- Plan dependency rollback and compatibility checks

Do not replace all dependencies with latest versions, delete every lock or weaken package-source policies to make installation pass.

## Evidence to deliver

- Repository/contract evidence and the exact affected scope.
- Chosen approach, invariants, resource/error or failure boundaries.
- Commands actually run and results, unrun checks and unproven claims.
- Compatibility, recovery/rollback or follow-up limits; review findings need verified locations.

## Primary reference

[Relevant official/project documentation](https://doc.rust-lang.org/cargo/commands/cargo-test.html) (checked 2026-11-06). Match the actual project version before applying version-sensitive details; the page version does not authorize an upgrade.
