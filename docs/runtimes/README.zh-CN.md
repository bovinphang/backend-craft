# Runtime 安装与启用

[English](README.md) · [文档导航](../README.zh-CN.md)

通过 npm 安装或从源码构建的步骤见[安装](../../README.zh-CN.md#安装)。

## CLI 接入

```sh
bec runtime install codex --local --lang zh-CN --dry-run --json
bec runtime install codex --local --lang zh-CN
bec doctor codex --local --json
bec matrix --json
```

每次在实际项目目录执行；通过 --global 选择用户级目录。setup 默认本地，普通非交互 install 默认 Claude、全局、英文。完整默认值与批量操作见 [CLI 管理](../cli-management.zh-CN.md)。

## 适配器资源矩阵

表中路径相对于项目根目录，能力来自当前适配器。命令的宿主形式可能是斜杠命令、prompt、workflow 或显式调用 Skill。

| Runtime | 资源根目录 | Skill 路径 | Agent | 命令 | 规则 |
| --- | --- | --- | --- | --- | --- |
| `claude` | `.claude` | `.claude/skills` | 是 | 是 | 是 |
| `codex` | `.codex` | `.agents/skills` | 是 | — | 是 |
| `cursor` | `.cursor` | `.cursor/skills` | — | — | 是 |
| `windsurf` | `.windsurf` | `.windsurf/skills` | — | 是 | 是 |
| `opencode` | `.opencode` | `.opencode/skills` | — | 是 | — |
| `kilo` | `.kilo` | `.kilo/skills` | — | 是 | — |
| `gemini` | `.gemini` | `.gemini/skills` | — | — | — |
| `copilot` | `.github` | — | — | 是 | 是 |
| `antigravity` | `.agent` | `.agent/skills` | — | — | — |
| `augment` | `.augment` | `.augment/skills` | — | — | — |
| `trae` | `.trae` | — | — | — | 是 |
| `codebuddy` | `.codebuddy` | `.codebuddy/skills` | — | — | — |
| `cline` | `.` | — | — | — | 是 |
| `openclaw` | `.openclaw` | `skills` | — | 是 | — |
| `qoder` | `.qoder` | `.qoder/skills` | 是 | 是 | 是 |

- Codex Agent 写入 `.codex/agents/*.toml`，项目 Skill 位于 `.agents/skills`。全局 Skill 使用用户 `.agents/skills`，CODEX_HOME 可覆盖其他 Codex 配置位置。
- Copilot、Trae、Cline 将完整资料安装到资源根下的 `backend-craft/reference-skills`。Copilot 仅在本地安装 prompt 文件。
- Windsurf 区分本地 workflows 与全局 global_workflows。OpenClaw 将命令转换为显式调用 Skill，项目 Skill 位于工作区 skills 目录。
- Antigravity 使用兼容路径 `.agent/skills`。Windsurf、Copilot、Antigravity、Trae、Qoder 的宿主目录与启用步骤需人工核对。
- 所有 CLI 适配器的 Hook 能力均关闭。原生插件 Hook 单独配置。

## 全局位置与状态检查

支持 CODEX_HOME、CLAUDE_CONFIG_DIR、Runtime 专属 *_CONFIG_DIR、OPENCLAW_STATE_DIR，以及 OpenCode/Kilo 的 XDG_CONFIG_HOME。具体路径通过目标 Runtime 的安装预览确认。

doctor 检查后端清单、摘要与公共引用，enabled 保持 unknown。安装完成后重启或刷新宿主，按宿主信任策略启用资源，并发起一次相关任务确认发现结果。

## 原生插件

Claude Marketplace 的来源精确指向 npm 包，当前源码指向 1.1.0。公开可用版本见项目首页；发布前使用指向已发布包的 Marketplace Git 修订，或按下列流程测试源码目录。

```sh
pnpm build
claude --plugin-dir .
```

命令在 backend-craft 仓库根执行。原生 Claude SessionStart 提供只读工程上下文。OpenClaw 原生插件通过打包产物交付，在宿主插件配置中可设置 autoValidate、autoFormat 和 formatStage；后二者配合显式本地格式阶段使用。详情见[验证配置](../validation-config.zh-CN.md)。

同一 Runtime 的 CLI 与原生渠道互斥，切换前先卸载旧渠道。双原生产品的公共资源发现去重需单独核验。历史路径依据见 [Runtime 契约](../research/runtime-contracts.md)。
