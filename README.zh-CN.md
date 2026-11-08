# Backend Craft

面向 Rust、Go、Java、Python、C、C++ 的后端专业 AI Coding 插件。包含 27 个专业 Skill、7 个公共 cc-* Skill、8 个 Agent 与 8 个命令工作流，提供英文与简体中文内容。

要求 Node.js 22+。精确依赖 craft-common@1.0.1；该修复版公开发布前，干净公开源安装尚不能完成。目前使用本地构建包验证，不以本地成功冒充公开发布。

```sh
npm install -g @bovinphang/backend-craft@1.0.0
bec runtime install codex --local --lang zh-CN
bec project inspect . --json
bec validate . --dry-run --json
bec validate . --json
bec matrix --json
bec doctor codex --json
bec runtime update codex --local --lang zh-CN
bec runtime uninstall codex --local
```

默认 local；global 安装到对应用户配置目录。inspect 只读；validate 使用现有任务、显式配置或保守语言建议。不会下载编译器或 wrapper；缺工具、必需测试跳过、零测试均不能报成功。退出码 0 为通过、1 为失败、2 为不完整或参数错误。JSON 计划隐藏参数与环境值，执行前应审阅本地配置。

自动格式与验证默认关闭。Claude 原生 SessionStart 仅提供只读上下文；OpenClaw 可明确开启 autoValidate，或提供本地 StageSpec 后开启 autoFormat。文件存在、宿主可发现和实际启用是三个不同状态；doctor 不猜测宿主信任或启用状态。

CLI 与原生插件渠道二选一。CLI 通过版本、语言、摘要共享公共资源，使用独立 backend-craft.manifest.json 和共享条目所有权；保留未知、被用户修改的文件，部分卸载会保留公共引用。原生包保证单产品完整性，不承诺双原生产品去重。

参见：[平台契约](docs/research/runtime-contracts.md)、[语言指南](docs/languages/README.md)、[验证配置](docs/validation-config.md)、[共存与迁移](docs/coexistence.md)、[扩展语言](docs/extending-languages.md)、[验收证据](docs/verification/acceptance.md)。

开发使用 pnpm：lint、typecheck、test、build、check:common；pack:all 按构建、测试、原生与独立包构建、包核验顺序执行，产出 npm CLI、OpenClaw 包与 34 个独立 Skill 包，不自动发布。

[工程结构与维护入口](docs/project-structure.md)列出源码模块、公共内容生成边界与校验命令。首版 CLI 不提供自升级、自卸载；使用原包管理器管理 CLI，使用 `bec runtime update/uninstall` 管理运行时资源。

首次检出应先运行 `pnpm build`，再运行 `pnpm test`；分发测试依赖 `dist/` 中的 CLI、原生 Hook 和 OpenClaw bundle。后端的 `test` 脚本不会自动构建。
