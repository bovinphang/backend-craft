# Backend project initialization

## Specialist checks

1. Inspect existing root and nearest directory instructions, manifests and CI tasks before changing context files.

2. Identify project roots and task-local languages; retain multiple projects and mark unresolved native/build ambiguity.

3. Propose minimal references to relevant rules instead of copying every language into a global instruction file.

4. Preserve user and frontend context; use product-scoped fragments or separate supported files, and show the intended changes before initialization writes.

5. Base quality commands on actual manifests/tasks and explicit configuration, with missing tools and integration requirements reported separately.

6. Validate references, scope and configuration shape; provide a file list and remaining setup steps. Do not auto-install compilers, databases or dependencies.

<a id="scope"></a>
## Scope and examples

Use for:
- Initialize backend rules in a mixed frontend/backend monorepo
- Preserve existing AGENTS while adding Go and native context
- Select language-scoped validation configuration
- Report missing toolchains without installing them

This initializes engineering context, not a universal application generator or permission to install system toolchains.

## Evidence to deliver

- Repository/contract evidence and the exact affected scope.
- Chosen approach, invariants, resource/error or failure boundaries.
- Commands actually run and results, unrun checks and unproven claims.
- Compatibility, recovery/rollback or follow-up limits; review findings need verified locations.

## Primary reference

[Relevant official/project documentation](https://go.dev/doc/effective_go) (checked 2026-11-06). Match the actual project version before applying version-sensitive details; the page version does not authorize an upgrade.
