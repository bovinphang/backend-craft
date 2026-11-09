# Backend Craft

> Release status (2026-11-09): craft-common 2.0.0 is published on npm. Frontend 3.0.0 and backend 1.0.0 remain unreleased; product versions are unchanged. Earlier preparation notes describe the pre-publication state.


Backend engineering skills for Rust, Go, Java, Python, C and C++. Includes 21 service-domain skills, 21 shared `cc-*` skills, 8 agents and 8 command workflows in English and Simplified Chinese.

[简体中文](README.zh-CN.md) · [Runtime contracts](docs/research/runtime-contracts.md) · [Validation config](docs/validation-config.md)

Requires Node.js 22+. The precise common dependency is `@bovinphang/craft-common@2.0.0`. This final version is prepared for publication and must be published before a clean public-registry installation can succeed; local release artifacts are currently used for verification.

```sh
npm install -g @bovinphang/backend-craft@1.0.0
bec runtime install claude --local --lang en
bec project inspect . --json
bec validate . --dry-run --json
bec validate . --json
bec doctor claude --json
bec runtime update claude --local --lang en
bec runtime uninstall claude --local
```

Local scope is the default. Use `--global` for a user install, `--lang zh-CN` for Chinese content, and `--dry-run` to plan resource changes without writing. `bec matrix --json` reports artifacts, discovery status and manual steps for all 15 runtimes. File presence does not prove host activation.

Validation uses existing project tasks, explicit `.backend-craft.json`, or conservative offline language suggestions. It never installs a compiler or downloads a wrapper. Missing required tools, skipped required tests and zero tests do not count as success. Exit codes: 0 passed, 1 failed, 2 incomplete or invalid. JSON plans hide argument and environment values; inspect the local configuration before authorizing execution.

Automatic formatting and validation hooks are disabled. Claude native SessionStart provides read-only context. OpenClaw's `autoFormat` and `autoValidate` are explicit opt-ins; formatting requires a specified local StageSpec.

Choose either CLI installation or a native Claude/OpenClaw plugin for a runtime. Native packages contain complete resources for a single product; deduplication between two native products is outside this release. CLI installs share common resources by version, language and exact digest, using independent backend ownership records. Modified or unknown files are preserved and may require a second uninstall after resolving changes.

[Language guides](docs/languages/README.md), [coexistence](docs/coexistence.md), [extending languages](docs/extending-languages.md), [acceptance evidence](docs/verification/acceptance.md).

Development: `pnpm install`, `pnpm lint`, `pnpm typecheck`, `pnpm build`, `pnpm test`, `pnpm run pack:all`. The last command builds, tests, creates native and 42 standalone skill packages, and verifies their content. No publishing command runs automatically.

[Project structure and maintenance](docs/project-structure.md) (Simplified Chinese) describes source modules, generated common content and validation commands. The CLI does not support self-update or self-uninstall; use the original package manager to manage the CLI and `bec runtime update/uninstall` for runtime resources.

Run `pnpm build` before `pnpm test` in a fresh checkout: packaging tests execute the generated CLI, native hooks and OpenClaw bundle from `dist/`. Unlike frontend-craft, backend-craft does not build automatically in its `test` script.

## Cross-domain foundations and service specialties

Language engineering is shared across desktop, libraries, CLI and services through independent cc-* entries, including C and C++. This product owns service architecture, API, data, auth and five specialties: Spring Boot, FastAPI, Gin, Axum and Drogon. Both products deliver all 21 common entries.

`bec project inspect . --task-path services/api/main.go --task-kind api --json` adds full units and scoped recommendations while keeping the six-language projects view; validate still uses the existing six-language modules. Inspection is read-only and never executes build tools.

Run `bec runtime check-migration [runtime] --local --json` before upgrade. Only unchanged owned old language entries retire in the shared transaction; edited, unknown or linked entries block the batch. Exit old common consumers with the old CLIs before installing the matching product builds.

`pnpm run verify:frameworks -- --framework gin,drogon,axum,spring-boot --prepare` explicitly prepares isolated Docker examples; omit --prepare for offline replay. The five service boundary examples have real faulty/fixed verification. GUI/signing and external database/load/deployment are separate, unverified scopes.

<!-- engineering-practices-20261108 -->

## Conditional engineering practices

Fourteen existing service entries add scoped decisions for failure/recovery, API and storage evolution, authority, transaction uncertainty, diagnostics, testing, review, dependencies and five framework mechanisms. They consume the same eight core principles and source registry; language/library rules stay in common. Project conventions and compatibility take precedence over borrowed style preferences.

The [HTTP replay sample](skills/bec-api-design/examples/engineering/README.md) tests response failure after commit, changed intent and concurrent duplicates with real HTTP clients. Repository-only `pnpm run verify:engineering` uses the existing Go toolchain offline and isolated source copies; it does not install tools. Its in-memory mutex is not database durability, production authentication or distributed exactly-once. Framework checks retain their own actual boundaries. All42 entries remain independently distributable; [coordinated migration](docs/coexistence.md) protects existing consumers and edits.

[Unreleased changes](CHANGELOG.md) describe the current 1.0.0 scope. Publish and verify common 2.0.0 first; backend 1.0.0 remains unreleased and is not uploaded by this preparation.
