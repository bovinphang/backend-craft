# CLI management

[简体中文](cli-management.zh-CN.md) · [Documentation](README.md)

This guide describes the 1.1.0 CLI. See the [project home](../README.md#version-availability) for public package availability.

Both products use craft-common's command dispatcher, interactive prompts, npm/pnpm installation detection and CLI lifecycle. Replace bec with fec for frontend-craft.

`bec setup [runtime]` and `bec setup all` connect the current project locally. `--global/-g` overrides this. Ordinary `bec`, `bec install` or `bec runtime install` prompts for runtime(s), language and location in a terminal; without a terminal it defaults to Claude, global and English. This changes backend-craft's former default local installation. Use `--local/-l` explicitly in existing scripts. Use `--lang en|zh-CN` or `--lang=zh-CN`.

`bec update` / `bec upgrade` updates the CLI using its verified original npm/pnpm installation, then refreshes current-project and global managed resources with the new CLI. An already-current CLI still refreshes resources. Unknown/local development sources and shared pnpm groups are refused. Temporary npx runs must already be latest and cannot uninstall themselves.

`bec uninstall` / `bec remove` removes the CLI and retains resources. Add `--purge` to clean this product's discovered resources first. Noninteractive uninstall requires `--yes/-y`. Modified resources remain protected; a cleanup error retains the CLI.

`bec runtime update|upgrade [runtime]` uses the installed package content; omit runtime to refresh discovered local and global installations. `bec runtime uninstall|remove [runtime]` removes discovered manifest-owned resources; `--force` permits removal of modified product-owned files, never another product's resources. Filter with `--local` or `--global`. Updates preserve each installation's language unless overridden. `--all` supports bulk operations.

Use `--dry-run` to preview resource changes and self-management without mutation. CLI update may query its registry during preview. `list` enumerates supported runtimes; `matrix` describes capabilities; `doctor [runtime]` defaults to Claude. `doctor claude --fix-cache [--dry-run]` only considers this product's stale Claude cache, protects current installs and refuses deletion without reliable native metadata. CLI and native Marketplace sources remain mutually exclusive. `sync-metadata --check` checks metadata consistency without editing it.

Backend-only `validate`, `project inspect`, existing JSON outputs and `runtime list` remain supported. JSON output is a single JSON value; diagnostics go to stderr.

## Coordinated common upgrade

The shared resource ledger still requires an exact common version, language and digest. Existing 2.0.0 consumers must exit using their old product CLIs before matching 2.1.0 product builds install resources. Updating only one product can therefore leave its new CLI ready while resource refresh reports a compatibility conflict; follow the existing common migration procedure and retry. Do not use force to take over another consumer.

## Common operations

```sh
bec setup codex --local --lang en --dry-run --json
bec setup codex --local --lang en
bec runtime install --all --global --lang en --dry-run --json
bec runtime list --local --json
bec runtime update codex --local --dry-run --json
bec runtime uninstall codex --local --dry-run --json
bec update --dry-run
bec uninstall --purge --yes --dry-run
```

Use setup all for bulk setup and runtime install --all for bulk resource installation. runtime list enumerates managed installations in the selected scope; list enumerates supported runtimes. For source debugging, prefix subcommands with node dist/bin/backend-craft.js.
