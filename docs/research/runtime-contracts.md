# Runtime 文件契约

核验时间：2026-11-06。参考前端 e24726dc2f62c49005eecf93afd2a168bfc5a7a8，仅复用路径事实与格式，不复制其产品身份或自管理逻辑。安装只证明文件契约，宿主信任、刷新、版本与实际启用由用户在宿主确认。

| Runtime | 本期资源与发现依据 | 边界 |
|---|---|---|
| Claude | .claude/skills、agents、commands、路径限定 rules；[官方 Skills](https://code.claude.com/docs/en/skills)、[Subagents](https://code.claude.com/docs/en/sub-agents) | CLI 不写项目 .claude-plugin；上下文只维护后端 marker |
| Codex | .agents/skills；.codex/agents/*.toml；[Skills](https://learn.chatgpt.com/docs/build-skills)、[Subagents](https://learn.chatgpt.com/docs/agent-configuration/subagents) | Agent 使用 name/description/developer_instructions；无本产品原生斜杠命令；CODEX_HOME 不改变标准用户 Skill 根 |
| Cursor | .cursor/skills、rules/*.mdc；[Skills](https://cursor.com/docs/skills) | 语言 globs；全局规则是否启用需宿主确认 |
| Windsurf | 沿用 F 的 .windsurf、全局 .codeium/windsurf、workflows/global_workflows | 旧官方文档重定向未能完整读取；按文件契约输出，明确人工确认，不把安装称为自动启用 |
| OpenCode | .opencode/skills、commands；[Skills](https://opencode.ai/docs/skills/) | 不修改现有权限配置；全局采用 XDG_CONFIG_HOME/opencode |
| Kilo | .kilo/skills、commands；[Skills](https://kilo.ai/docs/customize/skills) | IDE 与 CLI 全局目录可能不同；沿用 F 的 XDG kilo 路径，宿主确认 |
| Gemini | .gemini/skills、GEMINI.md；[Skills](https://geminicli.com/docs/cli/skills/) | 上下文条目合并；不虚构原生命令 |
| Copilot | .github/instructions/*.instructions.md、prompts/*.prompt.md；[自定义说明](https://code.visualstudio.com/docs/agent-customization/custom-instructions) | 本期保留 F 子集，不安装标准 Skill；全局说明采用共享 marker，IDE prompt 需 local |
| Antigravity | 兼容 .agent/skills；[官方文档](https://antigravity.google/docs/skills) | 官方默认已改 .agents/skills，但仍支持旧路径；为 F 共存保持兼容路径，global 需人工确认 |
| Augment | .augment/skills；[Skills](https://docs.augmentcode.com/using-augment/skills) | 不额外创建原生角色或命令 |
| Trae | .trae/rules 或 user_rules/backend-craft.md | 官方页面本次不可读取；保留 F 路径契约并要求宿主确认；无标准 Skill |
| CodeBuddy | .codebuddy/skills；[Skills](https://www.codebuddy.ai/docs/ide/Features/Skills) | 只交付本期 Skill 子集 |
| Cline | .clinerules/backend-craft.md，全局 Documents/Cline/Rules；[规则](https://docs.cline.bot/customization/cline-rules) | 无标准 Skill；旧单文件 .clinerules 拒绝自动迁移 |
| OpenClaw | workspace/skills；全局 .openclaw/skills；[Skills](https://docs.openclaw.ai/tools/skills) | 命令转换为显式调用 Skill；CLI 和原生渠道互斥，不承诺原生双插件去重 |
| Qoder | .qoder/skills、agents、commands、rules；[CLI Skills](https://docs.qoder.com/cli/Skills) | Skill 官方已核验，其他格式沿用 F 文件契约，实际启用需宿主确认 |

所有全局路径支持明确的环境覆盖；测试注入隔离 home。没有标准 Skill 的三个 Runtime 将完整专业资料放到 backend-craft/reference-skills，由后端规则按任务选择读取，不把参考资料标成宿主原生 Skill，也不登记公共消费者。Hooks 默认不启用自动格式或验证。
