# Backend documentation synchronization

## Specialist checks

1. Use the local common fact-source method; inspect manifests, handlers/validators, contract sources, schemas, migrations and actual CLI/task definitions.

2. Map each changed fact to README, API reference, examples, environment/configuration docs and upgrade instructions.

3. Distinguish generated artifacts from authored sources; change the source and run the existing generator rather than manually masking drift.

4. Document default/error/permission semantics, rollout compatibility and migration prerequisites with evidence, without exposing real secrets.

5. Check links, sample commands, schema/contract consistency and required localized counterparts; preserve intended historical changelog facts.

6. Deliver a fact-to-document mapping, generated diff, executed checks and unresolved facts. Do not claim examples were run when they were only inspected.

<a id="scope"></a>
## Scope and examples

Use for:
- Synchronize API docs after backend request changes
- Map migration and configuration changes to release notes
- Refresh OpenAPI from its actual source
- Verify backend command examples against repository facts

Pure copy-editing is outside this workflow; generated output must be updated through its authoritative source and generator.

## Evidence to deliver

- Repository/contract evidence and the exact affected scope.
- Chosen approach, invariants, resource/error or failure boundaries.
- Commands actually run and results, unrun checks and unproven claims.
- Compatibility, recovery/rollback or follow-up limits; review findings need verified locations.

## Primary reference

[Relevant official/project documentation](https://www.rfc-editor.org/rfc/rfc9110.html) (checked 2026-11-06). Match the actual project version before applying version-sensitive details; the page version does not authorize an upgrade.
