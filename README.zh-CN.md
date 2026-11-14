<div align="center">

# Backend Craft

面向 AI 编程助手的后端工程工作流。

[![CI](https://github.com/bovinphang/backend-craft/actions/workflows/ci.yml/badge.svg)](https://github.com/bovinphang/backend-craft/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/@bovinphang/backend-craft)](https://www.npmjs.com/package/@bovinphang/backend-craft)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
![Node.js](https://img.shields.io/badge/Node.js-22%2B-5FA04E)

[English](README.md) · **简体中文**

</div>

Backend Craft 将架构、API、数据、安全、测试与故障诊断工作流接入 **15 个 AI 编程 Runtime**。提供 **21 个后端 Skill**、**21 个公共工程 Skill**、**8 个 Agent** 与 **8 个命令工作流**，包含英文和简体中文内容。

服务工程覆盖 Rust、Go、Java、Python、C、C++，提供 Spring Boot、FastAPI、Gin、Axum、Drogon 专项。公共 `cc-*` 底座还覆盖 TypeScript、Electron、Tauri。

[文档导航](docs/README.zh-CN.md) · [示例提示词](docs/example-prompts.zh-CN.md) · [贡献指南](CONTRIBUTING.zh-CN.md) · [变更日志](CHANGELOG.zh-CN.md)

## 核心能力

- 使用架构、API、存储、缓存和事务工作流规划服务演进。
- 结合公共语言规范与五个框架专项，遵循已有项目约定。
- 使用代码、安全、性能、调试和测试规划 Agent 处理工程任务。
- 只读识别项目，预览验证计划，使用现有本地工具执行检查。
- 为不同助手生成适配资源，跟踪所有权，并与 Frontend Craft 共享公共内容。

## 安装

要求 **Node.js 22+**，CLI 面向 Windows、macOS 和 Linux。后端验证还需要项目已有工具链及准备完成的依赖。

### 全局 CLI

```sh
npm install -g @bovinphang/backend-craft@latest
cd your-backend-project
bec runtime install codex --local --lang zh-CN
bec doctor codex --local --json
```

npm 命令安装 `bec` 和 `backend-craft` 终端命令，`runtime install` 将指定 Runtime 接入项目。用户级接入使用 `--global`，英文资源使用 `--lang en`。

### 临时 npx 运行

```sh
cd your-backend-project
npx @bovinphang/backend-craft@latest runtime install codex --local --lang zh-CN
npx @bovinphang/backend-craft@latest matrix --json
```

### Claude Code 原生插件

在 Claude Code 内添加 Marketplace 并安装插件。

```text
/plugin marketplace add bovinphang/backend-craft
/plugin install backend-craft@backend-craft
```

从本地源码加载插件时，先构建，再在仓库根目录运行 `claude --plugin-dir .`。详见 [Runtime 安装指南](docs/runtimes/README.zh-CN.md)。

每个 Runtime 选择一种安装渠道。安装后刷新宿主，在宿主中确认发现与启用状态。

### 从源码构建

在仓库根目录使用 pnpm 12.4.1 构建 CLI，再用 Node.js 直接运行。当前源码精确依赖 `@bovinphang/craft-common@2.1.0`。

```sh
pnpm install --frozen-lockfile
pnpm build
node dist/bin/backend-craft.js setup codex --local --lang zh-CN --dry-run --json
```

### 接入 Runtime

安装 CLI 后，在目标项目目录执行以下命令。`setup` 要求 Backend Craft 1.1.0 或更高版本。

```sh
bec setup
bec setup codex --local --lang zh-CN
bec setup all --local --lang zh-CN
bec runtime install --all --global --lang zh-CN --dry-run --json
```

`setup` 默认接入当前项目。普通交互安装询问 Runtime、语言与位置；普通非交互安装默认 Claude、全局、英文。脚本中显式指定 `--local` 或 `--global`。详见 [CLI 管理](docs/cli-management.zh-CN.md)。

## 快速开始

### 识别和验证项目

```sh
bec project inspect . --json
bec project inspect . --task-path services/api/main.go --task-kind api --json
bec validate . --dry-run --json
bec validate . --json
```

识别读取工程证据并推荐适用能力。执行前先审阅验证计划。验证使用显式配置、项目已有任务或保守语言候选。退出码 `0` 表示通过，`1` 表示失败，`2` 表示不完整或输入无效。缺少必需工具、必需阶段被跳过、零测试均无法通过。

### 与助手协作

```text
按照本仓库架构与 API 约定规划订单服务。
评审 services/orders 中的授权与事务边界。
诊断这个 Go 取消传播问题，用现有测试验证修复。
```

Claude Code 提供 `/bec-review`、`/bec-debug` 等工作流。Codex 通过 Skill 和 Agent 完成任务，其他宿主的资源形式见 [Runtime 指南](docs/runtimes/README.zh-CN.md)。

## 能力目录

### 后端 Skill

| 领域 | Skill |
| --- | --- |
| 服务设计 | `bec-architecture-design`、`bec-api-design` |
| 数据与一致性 | `bec-database-design`、`bec-cache-design`、`bec-transaction-management` |
| 安全与运行保障 | `bec-auth-security`、`bec-observability`、`bec-performance-optimization` |
| 交付与维护 | `bec-project-init`、`bec-code-review`、`bec-debug-framework`、`bec-testing-strategy`、`bec-tdd-workflow`、`bec-refactoring`、`bec-dependency-management`、`bec-doc-sync` |
| 服务框架 | `bec-spring-boot-project-standard`、`bec-fastapi-project-standard`、`bec-gin-project-standard`、`bec-axum-project-standard`、`bec-drogon-project-standard` |

### 公共工程 Skill

| 领域 | Skill |
| --- | --- |
| 语言 | `cc-typescript-project-standard`、`cc-rust-project-standard`、`cc-go-project-standard`、`cc-java-project-standard`、`cc-python-project-standard`、`cc-c-project-standard`、`cc-cpp-project-standard` |
| 运行时与并发 | `cc-rust-async`、`cc-go-concurrency`、`cc-java-runtime`、`cc-python-async`、`cc-native-memory-safety` |
| 桌面 | `cc-electron-project-standard`、`cc-tauri-project-standard` |
| 工程方法 | `cc-source-driven-development`、`cc-doc-sync-core`、`cc-debug-methodology`、`cc-refactoring-core`、`cc-tdd-methodology` |
| 图表 | `cc-drawio-studio`、`cc-technical-diagrams` |

### Agent

| Agent | 用途 |
| --- | --- |
| `bec-architect` | 架构与模块边界规划 |
| `bec-code-reviewer` | 后端代码评审 |
| `bec-security-reviewer` | 认证、授权与服务安全评审 |
| `bec-performance-optimizer` | 性能诊断与优化 |
| `bec-debugger` | 故障诊断与验证修复 |
| `bec-test-planner` | 基于风险的测试策略 |
| `bec-refactoring-expert` | 保持行为的重构 |
| `bec-doc-updater` | 文档同步 |

### 助手命令

| 命令 | 用途 |
| --- | --- |
| `/bec-init` | 初始化项目指导内容 |
| `/bec-plan` | 架构或测试规划 |
| `/bec-review` | 后端代码评审 |
| `/bec-debug` | 诊断与修复故障 |
| `/bec-tdd` | 测试驱动工作流 |
| `/bec-refactor` | 结合行为验证重构 |
| `/bec-doc-sync` | 同步项目文档 |
| `/bec-validate` | 预览和执行工程验证 |

这些是助手工作流，终端验证使用 `bec validate`。报告写入 `reports/backend-craft/`，Agent 在该目录使用各自定义的文件名。

## 配置与验证

- [语言指南](docs/languages/README.zh-CN.md)介绍六语言验证，公共 Skill 的语言覆盖单独维护。
- [验证配置](docs/validation-config.zh-CN.md)介绍 `.backend-craft.json`、阶段执行与测试证据，集成阶段需显式启用。
- 自动格式与验证默认关闭。Claude 原生 SessionStart Hook 提供只读上下文；OpenClaw 原生插件可开启 `autoValidate`，配置 `formatStage` 后可开启 `autoFormat`。
- [HTTP 重放样例](skills/bec-api-design/examples/engineering/README.md)演示幂等场景。

## 更新与卸载

CLI 自管理命令 `bec update` 和 `bec uninstall` 要求 Backend Craft 1.1.0 或更高版本。

```sh
bec update --dry-run
bec update
bec runtime update codex --local --dry-run --json
bec runtime update codex --local
bec runtime uninstall codex --local --dry-run --json
bec runtime uninstall codex --local
bec uninstall --yes
```

`bec update` 核实原 npm/pnpm 来源，升级 CLI 后刷新当前项目及全局托管资源。`runtime update` 使用当前包内容，默认沿用每个安装的语言。`bec uninstall` 卸载 CLI 并保留资源，添加 `--purge` 可先清理发现的本产品资源。

用户修改与未知文件受到保护。跨产品共享 `cc-*` 要求公共包版本、语言与内容摘要一致。升级混合安装前，按实际 Runtime 和安装范围运行 `bec runtime check-migration codex --local --json`。详见[共存与迁移](docs/coexistence.zh-CN.md)。

## 文档

[文档导航](docs/README.zh-CN.md)汇总安装、提示词、配置、迁移和维护入口。

## 贡献

[贡献指南](CONTRIBUTING.zh-CN.md)介绍开发环境、双语维护和校验流程。通过 [GitHub Issues](https://github.com/bovinphang/backend-craft/issues)反馈可复现问题。

## 许可证

[MIT](LICENSE) © bovinphang。

公共内容在 craft-common 统一维护。本源码仓库仅保存领域技能；`pnpm run build` 在 `dist/package/` 生成完整双语产品。开发及 Git 子模块使用 `--plugin-dir <仓库>/dist/package`。发行归档通过 `pnpm run pack:all` 生成，具体步骤见 CONTRIBUTING.zh-CN.md。
