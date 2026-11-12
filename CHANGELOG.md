# Changelog

[简体中文](CHANGELOG.zh-CN.md)

## [1.1.0] - 2026-11-10

### Added

- `bec update` upgrades the globally installed CLI through its original npm or pnpm source and refreshes managed resources in the current project and global scope. `bec uninstall` removes only the CLI by default. Use `--purge` to also remove managed resources while preserving user edits. Non-interactive uninstall requires `--yes`.
- `bec doctor claude --fix-cache` cleans stale backend-craft caches while protecting the active installation. Use `--dry-run` to preview cleanup.

### Changed

- `bec setup` defaults to the current project. In an interactive terminal, ordinary installation prompts for runtimes, language and scope. Non-interactive installation now defaults to Claude, English and global scope. Existing scripts that expect project-local installs must pass `--local` or `-l`.
- Shared resources now use `@bovinphang/craft-common@2.1.0`. When upgrading from 2.0.0, release old shared-resource references from each installed product before installing builds that use the matching version. See the [coexistence and migration guide](docs/coexistence.md).

## [1.0.0] - 2026-11-09

### Added

- 21 service-domain entries, 8 agents and 8 command workflows, with English and Simplified Chinese resources. Five framework specialties cover Spring Boot, FastAPI, Gin, Axum and Drogon.
- The pinned `@bovinphang/craft-common@2.0.0` dependency delivers 21 bilingual shared entries, including seven language foundations with separate C and C++ entries. Backend validation retains its six-language contract.
- Shared installation planning, ownership, version/language/digest conflicts, transactional recovery, read-only migration checks and task-scoped inspection. Existing edits and unknown files are preserved; no-Skill hosts receive private reference material.
- Conditional service engineering decisions and isolated real-framework examples, plus an HTTP idempotency example for commit-before-response failure, changed intent and concurrent replay. The latter is process-local memory evidence, not durable/distributed exactly-once or authentication.
- Existing-tool validation planning/execution and complete CLI, native OpenClaw and standalone-skill distribution. Hooks remain read-only by default; optional mutation/formatting requires explicit configuration.

When installed alongside Frontend Craft 3.0.0, both products must use the same shared package version, language and content digest. See the [coexistence and migration guide](docs/coexistence.md).
