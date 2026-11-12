# Runtime installation and activation

[简体中文](README.zh-CN.md) · [Documentation](../README.md)

See [installation](../../README.md#install) for npm and source setup.

## CLI connection

```sh
bec runtime install codex --local --lang en --dry-run --json
bec runtime install codex --local --lang en
bec doctor codex --local --json
bec matrix --json
```

Run in the actual project directory. Use --global for user-wide resources. setup defaults local, while ordinary non-interactive install defaults to Claude, global and English. See [CLI management](../cli-management.md) for defaults and batch operations.

## Adapter resource matrix

Paths are relative to the project root. Capabilities reflect current adapters. Commands may become host slash commands, prompts, workflows or explicitly invoked skills.

| Runtime | Resource root | Skill path | Agents | Commands | Rules |
| --- | --- | --- | --- | --- | --- |
| `claude` | `.claude` | `.claude/skills` | Yes | Yes | Yes |
| `codex` | `.codex` | `.agents/skills` | Yes | — | Yes |
| `cursor` | `.cursor` | `.cursor/skills` | — | — | Yes |
| `windsurf` | `.windsurf` | `.windsurf/skills` | — | Yes | Yes |
| `opencode` | `.opencode` | `.opencode/skills` | — | Yes | — |
| `kilo` | `.kilo` | `.kilo/skills` | — | Yes | — |
| `gemini` | `.gemini` | `.gemini/skills` | — | — | — |
| `copilot` | `.github` | — | — | Yes | Yes |
| `antigravity` | `.agent` | `.agent/skills` | — | — | — |
| `augment` | `.augment` | `.augment/skills` | — | — | — |
| `trae` | `.trae` | — | — | — | Yes |
| `codebuddy` | `.codebuddy` | `.codebuddy/skills` | — | — | — |
| `cline` | `.` | — | — | — | Yes |
| `openclaw` | `.openclaw` | `skills` | — | Yes | — |
| `qoder` | `.qoder` | `.qoder/skills` | Yes | Yes | Yes |

- Codex agents use `.codex/agents/*.toml`; project skills use `.agents/skills`. Global skills use the user's `.agents/skills`; CODEX_HOME can override other Codex configuration paths.
- Copilot, Trae and Cline install complete reference material under `backend-craft/reference-skills` in the resource root. Copilot prompt files are local-only.
- Windsurf distinguishes local workflows from global_workflows. OpenClaw converts commands to explicitly invoked skills and uses the workspace skills directory locally.
- Antigravity uses the compatible `.agent/skills` path. Check host directories and activation manually for Windsurf, Copilot, Antigravity, Trae and Qoder.
- Hooks are disabled in all CLI adapters. Native plugin hooks are configured separately.

## Global paths and health checks

Overrides include CODEX_HOME, CLAUDE_CONFIG_DIR, runtime-specific *_CONFIG_DIR, OPENCLAW_STATE_DIR and XDG_CONFIG_HOME for OpenCode/Kilo. Inspect the target runtime's install preview for resolved paths.

doctor checks backend manifests, digests and common references. enabled remains unknown. Restart or refresh the host, apply its trust policy and run a relevant task to confirm discovery.

## Native plugins

The Claude Marketplace source pins an npm package version, currently 1.1.0 in this source. See the project home for public availability. Before publication, use a Marketplace Git revision targeting a published package, or test the source directory as follows.

```sh
pnpm build
claude --plugin-dir .
```

Run in the backend-craft repository root. Native Claude SessionStart provides read-only project context. The native OpenClaw package exposes autoValidate, autoFormat and formatStage in host plugin configuration. Formatting requires an explicit local format stage. See [validation configuration](../validation-config.md).

CLI and native channels are mutually exclusive for a runtime. Uninstall the previous channel before switching. Common-resource discovery deduplication across two native products needs separate verification. Historical path evidence is in [runtime contracts](../research/runtime-contracts.md).
