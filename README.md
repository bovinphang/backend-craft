<div align="center">

# Backend Craft

Backend engineering workflows for AI coding assistants.

[![CI](https://github.com/bovinphang/backend-craft/actions/workflows/ci.yml/badge.svg)](https://github.com/bovinphang/backend-craft/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/@bovinphang/backend-craft)](https://www.npmjs.com/package/@bovinphang/backend-craft)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
![Node.js](https://img.shields.io/badge/Node.js-22%2B-5FA04E)

**English** · [简体中文](README.zh-CN.md)

</div>

Backend Craft brings architecture, API, data, security, testing and troubleshooting workflows to **15 AI coding runtimes**. It includes **21 backend skills**, **21 shared engineering skills**, **8 agents** and **8 command workflows**, with English and Simplified Chinese content.

Service guidance covers Rust, Go, Java, Python, C and C++, with dedicated Spring Boot, FastAPI, Gin, Axum and Drogon skills. Shared `cc-*` foundations also cover TypeScript, Electron and Tauri.

[Documentation](docs/README.md) · [Example prompts](docs/example-prompts.md) · [Contributing](CONTRIBUTING.md) · [Changelog](CHANGELOG.md)

## Core capabilities

- Plan service evolution with architecture, API, storage, caching and transaction workflows.
- Apply shared language standards and five framework specialties within existing project conventions.
- Use dedicated code, security, performance, debugging and test-planning agents.
- Inspect projects, preview validation plans and execute checks through existing local tools.
- Generate runtime-specific resources, track ownership and share common content with Frontend Craft.

## Install

Requires **Node.js 22+**. The CLI targets Windows, macOS and Linux. Backend validation also needs your project's existing toolchain and prepared dependencies.

### Global CLI

```sh
npm install -g @bovinphang/backend-craft@latest
cd your-backend-project
bec runtime install codex --local --lang en
bec doctor codex --local --json
```

The npm command installs the `bec` and `backend-craft` terminal commands. `runtime install` connects the selected runtime to your project. Use `--global` for user-wide resources and `--lang zh-CN` for Chinese content.

### Temporary npx execution

```sh
cd your-backend-project
npx @bovinphang/backend-craft@latest runtime install codex --local --lang en
npx @bovinphang/backend-craft@latest matrix --json
```

### Claude Code native plugin

Inside Claude Code, add the Marketplace and install the plugin.

```text
/plugin marketplace add bovinphang/backend-craft
/plugin install backend-craft@backend-craft
```

To load the plugin from a local checkout, build it first, then run `claude --plugin-dir .` from the repository root. See the [runtime installation guide](docs/runtimes/README.md).

Choose one installation channel per runtime. Refresh the host and confirm discovery and activation there.

### Build from source

From the repository root, build the CLI with pnpm 12.4.1 and run it directly with Node.js. This checkout pins `@bovinphang/craft-common@2.1.0`.

```sh
pnpm install --frozen-lockfile
pnpm build
node dist/bin/backend-craft.js setup codex --local --lang en --dry-run --json
```

### Configure runtimes

Run these commands from the target project with the installed CLI. The `setup` command requires Backend Craft 1.1.0 or later.

```sh
bec setup
bec setup codex --local --lang en
bec setup all --local --lang en
bec runtime install --all --global --lang en --dry-run --json
```

`setup` defaults to the current project. Ordinary interactive installation asks for runtimes, language and location. Ordinary non-interactive installation defaults to Claude, global scope and English. Specify `--local` or `--global` in scripts. See [CLI management](docs/cli-management.md).

## Quick start

### Inspect and validate a project

```sh
bec project inspect . --json
bec project inspect . --task-path services/api/main.go --task-kind api --json
bec validate . --dry-run --json
bec validate . --json
```

Inspection reads project evidence and recommends matching capabilities. Review the plan before execution. Validation uses explicit configuration, existing project tasks or conservative language suggestions. Exit codes are `0` for passed, `1` for failed and `2` for incomplete or invalid input. Missing required tools, skipped required stages and zero tests prevent a passing result.

### Work with your assistant

```text
Plan the order service using this repository's architecture and API conventions.
Review authorization and transaction boundaries in services/orders.
Diagnose this Go cancellation bug and verify the fix with existing tests.
```

Claude Code exposes `/bec-review` and `/bec-debug` workflows. Codex uses skills and agents for these tasks. Other hosts expose resources described in the [runtime guide](docs/runtimes/README.md).

## Capability catalog

### Backend skills

| Area | Skills |
| --- | --- |
| Service design | `bec-architecture-design`, `bec-api-design` |
| Data and consistency | `bec-database-design`, `bec-cache-design`, `bec-transaction-management` |
| Security and operations | `bec-auth-security`, `bec-observability`, `bec-performance-optimization` |
| Delivery and maintenance | `bec-project-init`, `bec-code-review`, `bec-debug-framework`, `bec-testing-strategy`, `bec-tdd-workflow`, `bec-refactoring`, `bec-dependency-management`, `bec-doc-sync` |
| Service frameworks | `bec-spring-boot-project-standard`, `bec-fastapi-project-standard`, `bec-gin-project-standard`, `bec-axum-project-standard`, `bec-drogon-project-standard` |

### Shared engineering skills

| Area | Skills |
| --- | --- |
| Languages | `cc-typescript-project-standard`, `cc-rust-project-standard`, `cc-go-project-standard`, `cc-java-project-standard`, `cc-python-project-standard`, `cc-c-project-standard`, `cc-cpp-project-standard` |
| Runtime and concurrency | `cc-rust-async`, `cc-go-concurrency`, `cc-java-runtime`, `cc-python-async`, `cc-native-memory-safety` |
| Desktop | `cc-electron-project-standard`, `cc-tauri-project-standard` |
| Engineering methods | `cc-source-driven-development`, `cc-doc-sync-core`, `cc-debug-methodology`, `cc-refactoring-core`, `cc-tdd-methodology` |
| Diagrams | `cc-drawio-studio`, `cc-technical-diagrams` |

### Agents

| Agent | Purpose |
| --- | --- |
| `bec-architect` | Architecture and module-boundary planning |
| `bec-code-reviewer` | Backend code review |
| `bec-security-reviewer` | Authentication, authorization and service security review |
| `bec-performance-optimizer` | Performance diagnosis and optimization |
| `bec-debugger` | Failure diagnosis and verified repair |
| `bec-test-planner` | Risk-based test strategy |
| `bec-refactoring-expert` | Behavior-preserving refactoring |
| `bec-doc-updater` | Documentation synchronization |

### Assistant commands

| Command | Purpose |
| --- | --- |
| `/bec-init` | Initialize project guidance |
| `/bec-plan` | Plan architecture or testing |
| `/bec-review` | Review backend code |
| `/bec-debug` | Diagnose and repair failures |
| `/bec-tdd` | Apply a test-driven workflow |
| `/bec-refactor` | Refactor with behavior checks |
| `/bec-doc-sync` | Synchronize documentation |
| `/bec-validate` | Preview and execute validation |

These are assistant workflows. Run terminal validation with `bec validate`. Workflow reports use `reports/backend-craft/`. Agents specify filenames within that directory.

## Configuration and validation

- [Language guide](docs/languages/README.md) describes six-language validation. Shared skill coverage is maintained separately.
- [Validation configuration](docs/validation-config.md) covers `.backend-craft.json`, stage execution and test evidence. Integration stages require explicit enablement.
- Automatic formatting and validation are disabled by default. Native Claude SessionStart provides read-only context. Native OpenClaw can opt into `autoValidate` and, with a configured `formatStage`, `autoFormat`.
- The [HTTP replay example](skills/bec-api-design/examples/engineering/README.md) demonstrates idempotency scenarios.

## Update and uninstall

CLI self-management commands `bec update` and `bec uninstall` require Backend Craft 1.1.0 or later.

```sh
bec update --dry-run
bec update
bec runtime update codex --local --dry-run --json
bec runtime update codex --local
bec runtime uninstall codex --local --dry-run --json
bec runtime uninstall codex --local
bec uninstall --yes
```

`bec update` verifies the original npm/pnpm installation, upgrades the CLI and refreshes managed resources in the current project and globally. `runtime update` uses installed content and preserves each installation's language unless overridden. `bec uninstall` removes the CLI and retains resources. Add `--purge` to clean discovered product resources first.

Modified and unknown files are protected. Shared `cc-*` resources require matching common versions, languages and content digests. Before upgrading a mixed installation, run `bec runtime check-migration codex --local --json` with the applicable runtime and scope. See [coexistence and migration](docs/coexistence.md).

## Documentation

The [documentation index](docs/README.md) covers installation, prompts, configuration, migration and maintenance.

## Contributing

See the [contributing guide](CONTRIBUTING.md) for development setup, bilingual maintenance and checks. Report reproducible problems through [GitHub Issues](https://github.com/bovinphang/backend-craft/issues).

## License

[MIT](LICENSE) © bovinphang.

Common content is maintained in craft-common. This source repository stores domain skills; `pnpm run build` assembles the complete bilingual product in `dist/package/`. Local development and Git submodules load `--plugin-dir <repository>/dist/package`. Build release archives with `pnpm run pack:all`; see CONTRIBUTING.md.
