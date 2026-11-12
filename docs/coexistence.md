# Coexistence with Frontend Craft and migration

[简体中文](coexistence.zh-CN.md) · [Documentation](README.md)

## Common resource contract

Backend specialties use bec-*, frontend specialties use fec-* and shared engineering capabilities use cc-*. This source pins craft-common 2.1.0. See [installation](../README.md#install) for npm and source setup.

CLI installations share resources by exact common version, language and content digest. Coexisting products must match all three values; conflicts block installation. Backend uses its own backend-craft.manifest.json and tracks ownership of individual entries in shared files.

Copilot, Trae and Cline use private reference-skills directories managed through the product manifest.

## Coordinated upgrade

1. Record runtime, local/global scope and language. Back up user edits and inspect installations with the old product CLIs.
2. Use each old product CLI's runtime uninstall to release old common consumers. Resolve preserved edits and retry. Partial removal can retain common references.
3. Obtain verified product builds with matching common versions and languages. Run migration checks before installation.
4. Install both products and inspect their doctor output and the shared dependencies.lock.json consumer entries.
5. Refresh resources in the host and confirm discovery and activation.

```sh
bec runtime check-migration codex --local --json
bec runtime install codex --local --lang en --dry-run --json
bec doctor codex --local --json
```

Moving from common 2.0.0 to 2.1.0 requires old consumers to exit first. Upgrading only one product can update its CLI while resource refresh reports a conflict. Complete the coordinated procedure and retry.

## Legacy skill migration

| Retired entry | Current entry |
| --- | --- |
| bec-{rust,go,java,python,c,cpp}-project-standard | cc-{rust,go,java,python,c,cpp}-project-standard |
| bec-rust-async | cc-rust-async |
| bec-go-concurrency | cc-go-concurrency |
| bec-java-runtime | cc-java-runtime |
| bec-python-async | cc-python-async |
| bec-native-memory-safety | cc-native-memory-safety |

Only unchanged legacy entries with valid ownership can retire in the shared transaction. Edits, unknown files, links or invalid ownership block the whole installation. Migration checks return 0 for no findings, 1 for reviewable references or owned retired entries, and 2 for invalid arguments, scan failures or retirement conflicts.

## File and channel protection

Modified and unknown files are preserved. Shared text manages product-owned entries, with other products retaining their ownership. --force applies only to resource removal of modified private files owned by this product.

An older frontend installation with whole-file ownership can conservatively retain shared files after backend markers are inserted. Remove backend first, then retry with the old frontend CLI. Uninstall the previous channel before switching between CLI and native installation. Native packages deliver complete single-product resources; two native plugins require separate coexistence verification.

[Historical coexistence evidence](verification/coexistence.md) records its original environment and versions.
