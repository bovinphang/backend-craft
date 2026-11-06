# 安装与启用

Claude marketplace 元数据从 Git 读取目录，但插件来源精确指向 npm 的 @bovinphang/backend-craft@1.0.0；发布包包含原生 Hook 的 dist 构建产物。不能把未构建的 Git 根目录当作完整插件目录加载。正式发布后，可在 Claude 中添加 bovinphang/backend-craft marketplace 并安装 backend-craft@backend-craft；也可将已解包的完整 npm 插件目录交给 --plugin-dir 测试。公开包尚未发布时，该原生安装入口同样未完成公开源验收。

使用 bec matrix --json 查看实际能力与手动步骤，[已核验路径和来源](../research/runtime-contracts.md) 为当前实现依据。

标准 Skill 平台安装完整 bec-* 与共享 cc-*。Codex 项目 Skill 为 .agents/skills，Agent 为 .codex/agents TOML；OpenClaw 项目为 workspace/skills。Copilot、Trae、Cline 本期不建立标准 Skill 和公共消费者，规则引用完整专业参考目录。

全局目录覆盖支持 CODEX_HOME、CLAUDE_CONFIG_DIR、各 Runtime 的 *_CONFIG_DIR、OPENCLAW_STATE_DIR 及 OpenCode/Kilo 的 XDG_CONFIG_HOME。全局 Codex Skill 始终为用户 .agents/skills；测试必须注入隔离 home。

doctor 只读检查后端清单、资源摘要及公共指针；enabled 始终为 unknown，需在宿主中确认。保留已有共享文本和配置。自动格式、验证 Hook 默认关闭。Claude/OpenClaw 的原生包与 CLI 安装二选一。
