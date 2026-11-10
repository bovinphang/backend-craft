# 工程结构与维护

[English](project-structure.md) · [文档导航](README.zh-CN.md)

Backend Craft 1.1.0 是 TypeScript / ESM 工具包，使用 esbuild 构建、Node.js node:test 测试。要求 Node.js 22+，pnpm 固定为 12.4.1。

## 模块职责

| 目录或文件 | 职责 |
| --- | --- |
| `bin/` | bec / backend-craft CLI 入口 |
| `src/cli.ts, src/cli/` | 公共命令调度与后端识别、验证适配 |
| `src/install/` | 资源事务、所有权、清单与 15 个 Runtime 适配器 |
| `src/project/` | 六语言验证、显式配置、执行与证据 |
| `src/content/` | 双语目录、公共来源与快照声明 |
| `src/hooks/, src/openclaw/` | 原生只读上下文与显式开启的 Hook 实现 |
| `skills/, agents/, commands/` | 21 个服务 Skill、21 个公共 Skill、8 个 Agent 与 8 个工作流 |
| `localized/zh-CN/` | 简体中文内容镜像 |
| `templates/, hooks/` | 规则、参考资料与 Claude 原生 Hook 配置 |
| `.claude-plugin/, openclaw.plugin.json` | 原生插件元数据 |
| `scripts/, tests/` | 构建、打包、内容检查与 Node.js 测试 |
| `docs/` | 用户指南、研究与历史证据 |

src/index.ts 提供公共 API，package.json 的 exports 指向 dist/index.js 与 dist/index.d.ts。两个 CLI 别名均指向 dist/bin/backend-craft.js。通用识别、任务推荐及安装算法来自 craft-common，后端保留服务框架声明和六语言验证投影。

## 生成内容边界

21 个 cc-* Skill 与内嵌公共方法来自精确 craft-common 2.1.0 依赖。common-content.lock.json 记录来源、版本和摘要。修改公共源后运行同步，产品索引变化后也需重新生成其摘要。领域内容需同步中文镜像及能力索引。

```sh
pnpm run sync:common
pnpm run check:common
pnpm run check:content
```

dist 由 pnpm build 生成；npm-packages-* 和独立 Skill 包由打包脚本生成。通过源文件与脚本维护这些产物。

## 日常验证

```sh
pnpm lint
pnpm typecheck
pnpm run check:common
pnpm run check:content
pnpm build
pnpm test
pnpm run pack:all
```

test 脚本递归发现 tests/**/*.test.ts，串行执行 Node.js 测试。首次检出或运行时代码变化后先构建，分发测试依赖 dist。pack:all 构建、测试、核验并生成 CLI、OpenClaw 和 42 个独立 Skill 包，共 44 个归档，输出 npm-packages-* 目录。

## 专项验证

```sh
pnpm run verify:coexistence --frontend-root ../frontend-craft
pnpm run verify:languages
pnpm run verify:frameworks -- --framework gin,drogon,axum,spring-boot --prepare
pnpm run verify:engineering
```

共存检查需要相邻前端源码与匹配的公共资源；语言夹具使用已有本地工具链。框架 --prepare 显式准备隔离 Docker 样例，省略后离线复验，FastAPI 环境及各框架要求见脚本与历史工具链证据。verify:engineering 使用现有 Go 工具和隔离源码副本验证进程内 HTTP 重放样例。记录实际覆盖范围，缺工具或未执行的项目应单独列出。

[贡献指南](../CONTRIBUTING.zh-CN.md) · [工具链证据](verification/toolchains.md) · [验证配置](validation-config.zh-CN.md)
