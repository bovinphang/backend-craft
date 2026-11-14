# Contributing

[简体中文](CONTRIBUTING.zh-CN.md) · [Documentation](docs/README.md)

Contributions can include reproducible issues, documentation fixes, skills, runtime adapters and tests. Read the target module and existing patterns first, and keep changes focused.

## Development environment

- Node.js 22+ and pnpm 12.4.1, as declared in package.json.
- Git and the local language tools needed for the checks you intend to execute.
- Use pnpm-lock.yaml and run `pnpm install --frozen-lockfile` for a fresh checkout.
- This source depends on craft-common 2.1.0. See README for public registry availability. Before dependency publication, maintainers must provide a matching verified dependency source.

The project uses TypeScript, ESM, esbuild and Node.js `node:test`. See [project structure](docs/project-structure.md) for module responsibilities.

## Local development

```sh
pnpm install --frozen-lockfile
pnpm build
node dist/package/dist/bin/backend-craft.js version
node dist/package/dist/bin/backend-craft.js setup codex --local --lang en --dry-run --json
pnpm test
```

Build before testing in a fresh checkout or after runtime changes. Distribution tests execute the generated CLI, hooks and OpenClaw bundle. Run an existing individual test with `node --import tsx --test tests/cli/parity.test.ts`.

Use temporary workspaces and isolated homes for installation tests, and verify that previews write nothing. CLI self-management refuses unknown development installation sources. Use explicit runtime commands for resource debugging.

## Content and language policy

English is the public documentation entry language. Synchronize names, counts, commands, defaults, paths, versions and capability boundaries in Simplified Chinese. Check both languages when changing READMEs, guides, prompts or capability indexes.

Service-domain content lives in skills, agents, commands, templates and localized/zh-CN. The 21 cc-* skills and embedded common methods are generated from the exact craft-common dependency. Change the common source first, then run `pnpm run sync:common`. Use `pnpm run check:common` to verify provenance and digests. Index changes also require synchronization to refresh generated digests.

Build and packaging scripts generate dist and package directories. Research and dated acceptance records retain their original versions, environments and results.

## Verification

```sh
pnpm lint
pnpm typecheck
pnpm run check:common
pnpm run check:content
pnpm build
pnpm test
node dist/package/dist/bin/backend-craft.js sync-metadata --check --json
pnpm run pack:all
```

Lint checks source. check:content validates bilingual content separately. pack:all builds, tests and produces 44 archives. Run language, framework, engineering and real-product coexistence checks according to the change. See [project structure](docs/project-structure.md) for commands and prerequisites. Record executed, missing and unrun checks.

## Pull request checklist

- Explain the problem, change scope and compatibility impact.
- Add regression coverage where behavior needs it, and run lint, type checks, build and tests.
- Synchronize user guides, both content languages and version metadata. Check local links and examples.
- State specialty-check environments and remaining limitations.
- Use Conventional Commits, such as `docs: refresh backend guides`.
- Preserve existing user changes and keep generated archives, dependencies and secrets out of commits.

For [GitHub Issues](https://github.com/bovinphang/backend-craft/issues), include Node.js and package versions, OS, runtime, installation scope and sanitized reproduction steps.

## Build-time common content

Maintain common skills and methods in craft-common. Product source skills and bilingual indexes contain domain-owned entries. `pnpm run prepare:content` assembles the complete bilingual product in `dist/package/`; `pnpm run check:common` verifies that output without writing. `pnpm run build` also compiles executable entries.

For local development and Git submodules, install dependencies and build before loading `--plugin-dir <repository>/dist/package`. Use `pnpm run pack:all` to produce complete release archives. Publish a verified archive or the assembled directory. Packing or publishing the source root fails with a workflow hint. Generated common resources and the provenance lock belong exclusively to build output.

Assembly uses `dist/.content.lock` to prevent concurrent replacement. After a forcibly terminated build, inspect any lock and `.package-previous` backup, confirm no build is active, restore the previous complete output if needed, then remove stale temporary state and retry.
