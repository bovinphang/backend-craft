# Backend Craft

> 发布状态更新（2026-11-09）：craft-common 2.0.0 已发布至 npm。frontend 3.0.0、backend 1.0.0 继续未发布，产品版本号不变；下方原发布准备说明保留当时状态。


面向 Rust、Go、Java、Python、C、C++ 的后端专业 AI Coding 插件。包含 21 个服务领域 Skill、21 个公共 cc-* Skill、8 个 Agent 与 8 个命令工作流，提供英文与简体中文内容。

要求 Node.js 22+。精确依赖 craft-common@2.0.0；该正式版本号当前待发布，公开发布前，干净公开源安装尚不能完成。目前使用本地构建包验证，不以本地成功冒充公开发布。

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

开发使用 pnpm：lint、typecheck、test、build、check:common；pack:all 按构建、测试、原生与独立包构建、包核验顺序执行，产出 npm CLI、OpenClaw 包与 42 个独立 Skill 包，不自动发布。

[工程结构与维护入口](docs/project-structure.md)列出源码模块、公共内容生成边界与校验命令。首版 CLI 不提供自升级、自卸载；使用原包管理器管理 CLI，使用 `bec runtime update/uninstall` 管理运行时资源。

首次检出应先运行 `pnpm build`，再运行 `pnpm test`；分发测试依赖 `dist/` 中的 CLI、原生 Hook 和 OpenClaw bundle。后端的 `test` 脚本不会自动构建。

## 跨领域底座与服务专项

语言工程由 cc-* 入口共享，适用于桌面、原生库、CLI 和服务，C 与 C++ 均有独立入口。本产品维护服务架构、API、数据、安全，以及 Spring Boot、FastAPI、Gin、Axum、Drogon 五个专项；两个产品都交付全部 21 个公共入口。

`bec project inspect . --task-path services/api/main.go --task-kind api --json` 新增完整 units 与任务推荐，保留原六语言 projects 视图；validate 仍使用既有六语言模块。识别只读，不执行构建工具。

升级前执行 `bec runtime check-migration [runtime] --local --json`。只有未修改的托管旧入口可随共享事务退役，未知文件、修改或链接会阻断整批安装。先用旧 CLI 退出旧公共消费者，再安装匹配的产品构建。

显式使用 `pnpm run verify:frameworks -- --framework 'gin,drogon,axum,spring-boot' --prepare` 准备隔离 Docker 样例，省略 --prepare 可离线复验。五项服务边界已有真实缺陷/修复验证；GUI、签名、外部数据库、负载及部署属于另行验证范围。

<!-- engineering-practices-20261108 -->

## 按条件适用的工程实践

14个既有服务入口补充故障恢复、API/存储演进、权限、事务不确定性、诊断、测试、评审、依赖与五框架实际机制，共同消费八项原则及来源记录；语言/库规范留在common。项目现有约定和兼容优先于外部风格偏好。

[HTTP重放样例](skills/bec-api-design/examples/engineering/README.md)通过真实HTTP客户端验证提交后响应失败、意图变化与并发重复。源码仓的`pnpm run verify:engineering`离线使用现有Go工具及隔离源码副本，不安装工具；内存互斥不代表数据库持久性、生产鉴权或分布式恰好一次。框架验证保持各自实际边界。42入口仍可独立分发，[协调迁移](docs/coexistence.md)继续保护已有消费者与用户编辑。

[未发布变更](CHANGELOG.zh-CN.md)记录当前1.0.0范围。先发布并核验common2.0.0，backend1.0.0仍保留为未发布版本，本轮不上传产品。
