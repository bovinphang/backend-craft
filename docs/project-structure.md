# 工程结构与维护入口

backend-craft 1.0.0 是 TypeScript / ESM 工具包，使用 esbuild 构建，测试使用 Node.js `node:test`。Node.js 最低版本为 22，包管理器固定为 pnpm 12.4.1；它不是 Vite 应用。

```text
backend-craft/
├── bin/backend-craft.ts       # bec / backend-craft CLI 入口
├── src/
│   ├── cli.ts                # CLI 分发及退出码
│   ├── cli/                  # 参数、inspect、validate、runtime 输出
│   ├── content/              # 产品目录、双语快照和公共来源
│   ├── install/              # 安装生命周期、清单、产品事务和共享配置
│   │   ├── adapters/         # 15 个 Runtime 适配器
│   │   └── shared-config/    # 文本、JSON、TOML 条目所有权
│   ├── project/              # 工程识别、配置、计划、执行和测试证据
│   │   └── languages/        # Rust、Go、Java、Python、C、C++ 语言模块
│   ├── hooks/                # session-start、format、validate
│   ├── openclaw/             # 原生插件入口
│   ├── product.ts            # 产品标识及版本
│   └── index.ts              # 对外 API
├── skills/                   # 27 个 bec-* + 7 个 cc-*，以及能力索引
├── agents/                   # 8 个后端 Agent
├── commands/                 # 8 个命令工作流
├── localized/zh-CN/          # 中文内容镜像
├── templates/shared/rules/   # 核心、六语言规则及公共方法引用
├── hooks/                    # 原生 Claude Hook 配置
├── .claude-plugin/           # Claude 插件及 marketplace 清单
├── openclaw.plugin.json      # OpenClaw 配置 schema
├── common-content.lock.json  # 公共快照来源、精确版本与摘要
├── scripts/                  # 构建、同步、打包及专项验证
├── tests/                    # 单元、集成、隔离分发及共存测试
└── docs/                     # 使用指南、平台研究和历史验收证据
```

`dist/` 由 `pnpm build` 生成，包含 CLI、Hook、OpenClaw 入口与声明，不手工修改。`package.json` 的 `exports` 指向 `dist/index.js` 和 `dist/index.d.ts`；命令别名 `bec` 与 `backend-craft` 指向同一个构建入口。

领域内容在本仓库维护。七个 `cc-*` Skill 与内嵌公共方法由精确依赖 `@bovinphang/craft-common@1.0.1` 生成；先修改公共源，再运行 `pnpm run sync:common`，用 `pnpm run check:common` 只读比对，不直接修改公共副本。领域内容变化需要同步中文镜像、能力索引及相关文档。

日常校验使用 `pnpm lint`、`pnpm typecheck`、`pnpm build`、`pnpm test` 和 `pnpm run check:content`。`pnpm run verify:coexistence --frontend-root ../frontend-craft`、`pnpm run verify:languages` 分别验证真实前后端共存与本地语言夹具；环境要求及结果边界见 [共存证据](verification/coexistence.md) 和 [工具链证据](verification/toolchains.md)。

`pnpm run pack:all` 构建、测试、核验并生成 npm CLI、OpenClaw 及 34 个独立 Skill 包，共 36 个归档；输出到脚本创建的 `npm-packages-*` 目录，不执行发布。

[验证配置](validation-config.md) · [扩展语言](extending-languages.md) · [Runtime 安装与启用](runtimes/README.md) · [共存与迁移](coexistence.md)

首次检出或修改运行时代码后，先执行 `pnpm build`，再执行 `pnpm test`。后端测试脚本仅启动测试发现与执行，分发测试需要已生成的 `dist/bin/backend-craft.js`、`dist/hooks/` 和 `dist/openclaw/`。
