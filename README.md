# Backend Craft

Backend engineering skills for Rust, Go, Java, Python, C and C++. Includes 27 professional skills, 7 shared `cc-*` skills, 8 agents and 8 command workflows in English and Simplified Chinese.

[简体中文](README.zh-CN.md) · [Runtime contracts](docs/research/runtime-contracts.md) · [Validation config](docs/validation-config.md)

Requires Node.js 22+. The precise common dependency is `@bovinphang/craft-common@1.0.1`. That repair release must be published before a clean public-registry installation can succeed; local release artifacts are currently used for verification.

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

Development: `pnpm install`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`, `pnpm run pack:all`. The last command builds, tests, creates native and 34 standalone skill packages, and verifies their content. No publishing command runs automatically.
