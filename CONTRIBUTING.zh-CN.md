# 贡献指南

[English](CONTRIBUTING.md) · [文档导航](docs/README.zh-CN.md)

欢迎提交可复现问题、文档修正、Skill 改进、Runtime 适配与测试。先阅读目标模块和已有实现，保持变更聚焦。

## 开发环境

- Node.js 22+，pnpm 12.4.1，以 package.json 的约定为准。
- Git，以及需要执行的专项验证所依赖的本地语言工具。
- 使用 pnpm-lock.yaml，首次安装执行 `pnpm install --frozen-lockfile`。
- 当前源码依赖 craft-common 2.1.0，公开 registry 的可用性见 README。依赖未公开时，维护者需提供匹配的已验证依赖来源。

本项目使用 TypeScript、ESM、esbuild 和 Node.js `node:test`。目录职责见[工程结构](docs/project-structure.zh-CN.md)。

## 本地开发

```sh
pnpm install --frozen-lockfile
pnpm build
node dist/package/dist/bin/backend-craft.js version
node dist/package/dist/bin/backend-craft.js setup codex --local --lang zh-CN --dry-run --json
pnpm test
```

首次检出或修改运行时代码后先构建再测试，分发测试依赖 dist 中的 CLI、Hook 和 OpenClaw 产物。可用 `node --import tsx --test tests/cli/parity.test.ts` 执行已有的单文件测试。

安装测试应使用临时工作目录和隔离 home，预览时检查无写入。源码目录的 CLI 自管理会拒绝未知安装来源，资源调试使用显式 runtime 命令。

## 内容与双语政策

英文作为公共文档主入口，简体中文同步名称、数量、命令、默认值、路径、版本和能力边界。更新 README、指南、提示词和能力索引时同时检查对应语言。

服务领域内容维护在 skills、agents、commands、templates 及 localized/zh-CN 中。21 个 cc-* Skill 和内嵌公共方法由精确 craft-common 依赖生成。先修改公共源，再运行 `pnpm run sync:common`；用 `pnpm run check:common` 检查来源与摘要。索引变化后也需运行同步脚本以更新生成摘要。

dist 和打包目录由脚本生成。研究与历史验收文档保留原始版本、环境及结果。

## 验证

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

lint 检查源码，check:content 单独检查双语内容。pack:all 构建、测试并产出 44 个归档。语言、框架、工程实践和真实前后端共存验证按改动范围执行，所需环境与命令见[工程结构](docs/project-structure.zh-CN.md)。报告应注明实际执行、缺失及未运行项。

## Pull Request 检查清单

- 说明问题、修改范围与兼容性影响。
- 补充受影响行为所需的回归测试，执行 lint、类型检查、构建和测试。
- 同步用户指南、双语内容与版本元数据，检查本地链接和示例。
- 说明专项验证环境及剩余限制。
- 提交遵循 Conventional Commits，例如 `docs: refresh backend guides`。
- 保留用户已有变更，避免提交生成归档、依赖目录或敏感信息。

通过 [GitHub Issues](https://github.com/bovinphang/backend-craft/issues)提交问题时，附上 Node.js、包版本、系统、Runtime、安装范围和脱敏复现步骤。

## 构建时组合公共内容

公共技能和方法在 craft-common 维护。本仓库的 skills 和 localized/zh-CN/skills 仅维护领域内容及领域索引。

运行 `pnpm run prepare:content` 在 `dist/package/` 生成完整双语产品，运行 `pnpm run check:common` 只读验证生成结果。`pnpm run build` 同时编译运行入口。生成目录已由 dist 的忽略规则覆盖。

本地开发及 Git 子模块需先安装依赖并构建，再通过 `--plugin-dir <仓库>/dist/package` 加载。`pnpm run pack:all` 从组合目录生成完整归档；正式发布应使用验证过的归档或组合目录。源码根目录直接 pack/publish 会报错，避免交付缺失公共内容的包。公共生成文件和来源锁只能存在于产物目录。

构建使用 `dist/.content.lock` 阻止并发替换。进程被强制终止后，如存在锁或 `.package-previous`，先确认没有构建进程并检查备份，恢复上一份完整产物后清理遗留锁和临时目录，再重试。
