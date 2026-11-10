# Project structure and maintenance

[简体中文](project-structure.zh-CN.md) · [Documentation](README.md)

Backend Craft 1.1.0 is a TypeScript / ESM toolkit built with esbuild and tested with Node.js node:test. It requires Node.js 22+ and pins pnpm 12.4.1.

## Module responsibilities

| Directory or file | Responsibility |
| --- | --- |
| `bin/` | bec / backend-craft CLI entry |
| `src/cli.ts, src/cli/` | Shared command dispatch and backend inspection/validation adapters |
| `src/install/` | Resource transactions, ownership, manifests and 15 runtime adapters |
| `src/project/` | Six-language validation, explicit configuration, execution and evidence |
| `src/content/` | Bilingual catalog, common provenance and snapshot declarations |
| `src/hooks/, src/openclaw/` | Native read-only context and opt-in hook implementations |
| `skills/, agents/, commands/` | 21 service skills, 21 common skills, 8 agents and 8 workflows |
| `localized/zh-CN/` | Simplified Chinese content mirror |
| `templates/, hooks/` | Rules, references and native Claude hook configuration |
| `.claude-plugin/, openclaw.plugin.json` | Native plugin metadata |
| `scripts/, tests/` | Build, packaging, content checks and Node.js tests |
| `docs/` | User guides, research and historical evidence |

src/index.ts exposes the public API. package.json exports resolve to dist/index.js and dist/index.d.ts. Both CLI aliases use dist/bin/backend-craft.js. General discovery, task recommendations and installation algorithms come from craft-common; backend owns service-framework declarations and the six-language validation projection.

## Generated content boundaries

The 21 cc-* skills and embedded common methods come from the exact craft-common 2.1.0 dependency. common-content.lock.json records provenance, version and digests. Synchronize after common-source edits and regenerate index digests after product-index changes. Domain edits require matching Chinese content and capability indexes.

```sh
pnpm run sync:common
pnpm run check:common
pnpm run check:content
```

pnpm build generates dist. Packaging scripts generate npm-packages-* and standalone skill packages. Maintain these outputs through source files and scripts.

## Routine checks

```sh
pnpm lint
pnpm typecheck
pnpm run check:common
pnpm run check:content
pnpm build
pnpm test
pnpm run pack:all
```

The test script recursively discovers tests/**/*.test.ts and runs Node.js tests serially. Build first after checkout or runtime changes because distribution tests execute dist. pack:all builds, tests, verifies and produces CLI, OpenClaw and 42 standalone skill archives, totaling 44 archives in an npm-packages-* directory.

## Specialty checks

```sh
pnpm run verify:coexistence --frontend-root ../frontend-craft
pnpm run verify:languages
pnpm run verify:frameworks -- --framework gin,drogon,axum,spring-boot --prepare
pnpm run verify:engineering
```

Coexistence checks require the adjacent frontend source and matching common resources. Language fixtures use existing local toolchains. Framework --prepare explicitly prepares isolated Docker examples; omit it for offline replay. Consult scripts and historical toolchain evidence for FastAPI and individual framework requirements. verify:engineering uses the existing Go toolchain and isolated sources for process-local HTTP replay checks. Record actual coverage and list missing or unrun checks.

[Contributing](../CONTRIBUTING.md) · [Toolchain evidence](verification/toolchains.md) · [Validation configuration](validation-config.md)
