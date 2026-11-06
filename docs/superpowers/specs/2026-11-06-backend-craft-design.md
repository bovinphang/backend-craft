# backend-craft 1.0 首期设计

日期：2026-11-06

状态：独立可实施性审阅通过，用户于 2026-11-06 明确回复“符合”，设计已批准；下一步编写并审阅实施计划，不提前实现。

实施修订：用户于本轮确认公共包升级至精确 1.0.1，修复大事务日志恢复；先用本地修复包验证，公开发布另行授权。

## 1. 意图与已确认决策

面向后端工程师和同时使用 frontend-craft 的全栈工程师，建设独立专业插件 backend-craft。首期覆盖 Rust、Go、Java、Python、C、C++ 的工程开发闭环，后续可增加其他语言。

用户已确认：参考 frontend-craft；前后端保持独立；采用“后端独立落地、复用现有 craft-common”的路线；首期建设语言与后端通用工程能力，框架实现遵循项目已有技术栈，不穷举独立框架技能。

下文的具体入口、数量、默认配置和验收方案是设计者建议，用户批准本文后成为实施范围。此前针对前端抽取任务的 Git 授权不自动扩展到本项目提交、推送或 npm 发布。

## 2. 当前事实与约束

- backend-craft 当前仅有 LICENSE，main 与 origin/main 一致。
- frontend-craft 3.0 使用 TypeScript、Node >=22、ESM、pnpm 12.4.1、esbuild、ESLint、node:test；不将工作区通用示例中的 Vite/Vitest 套用到插件 CLI。
- 前端现有 15 个 Runtime，能力各异；安装成功不等于宿主已实际启用全部能力。
- craft-common 1.0.0 已提供七项公共入口、方法资源、内容目录与共享部署事务；不存在可直接复用的完整产品安装底座。
- 前端产品安装器包含写死的清单名、前缀、模板路径与产品环境变量。可以参考实现及测试，不能机械全局替换并宣称共存可靠。
- 特别注意现有 Claude 安装器会写项目 .claude-plugin/plugin.json，Codex 遇现有配置会保留；后端必须单独设计这类共享入口，不能覆盖前端或安装后静默不可发现。
- 不假定 npm 公共包已发布。规划时核验 registry 可用性；开发可使用真实 tarball 隔离联调，最终依赖和锁不能依赖相邻源码路径或临时源。

## 3. 目标、非目标、反目标

目标：六个独立语言规范覆盖用户的五类语言；具备初始化、架构、实现、测试、诊断、评审、重构、文档闭环；多语言 Monorepo 按子项目定位；后端独立安装和与前端共存；完整中英文内容、CLI、原生渠道、独立 Skill 包及自动验证。

非目标：本期不建设 fullstack-craft；不提供一键创建所有框架应用的代码生成器；不新增独立 Spring/FastAPI/Axum/Gin 等框架 Skill；不重构前端安装底座；不自动部署生产服务、执行数据库迁移或发布制品；不将每种语言的每个专项都拆成单独 Skill。

反目标：不能只有语言提示词而没有工程验证；不能把所有语言规范一次性塞进上下文；不能声称已测试缺失工具链；不能为了满足检测把整个仓库误判成单一语言；不能误删前端文件或用户配置。

## 4. Approaches：已比较并选择的路线

| 路线 | 优点 | 代价与选择 |
| --- | --- | --- |
| 后端独立落地，消费已有 common | 将投入集中在后端专业内容与共存验收，不要求前端同步重构 | 产品适配层暂时分别维护；用户已选择 |
| 先统一产品安装底座再开发后端 | 长期减少适配代码重复 | 本次同时影响三个仓库及前端回归，用户未选择 |

明确复用 common 的内容和事务契约，产品专属适配参考前端代码并保留来源记录。发现前端缺陷只记录；若真实共存验收必须修改前端，先说明最小范围与原因，不能悄悄扩大改动。

## 5. 产品形态与目录

设计者建议：npm 包 @bovinphang/backend-craft，首版 1.0.0，CLI backend-craft / bec，专业内容统一 bec-*；公共内容维持 cc-*，精确依赖 @bovinphang/craft-common@1.0.1。

沿用前端默认英文、localized/zh-CN 内容结构；设计、报告和交流使用中文。产品维护 Skills、Agents、Commands、Rules、Templates 与有限 Hooks，公共快照由脚本生成，不手改。

```text
backend-craft/
  .claude-plugin/       # 本产品原生插件元数据
  agents/ commands/ skills/
  localized/zh-CN/
  templates/shared/rules/
  templates/<runtime>/
  hooks/
  src/install/         # 后端产品身份、生命周期及 Runtime 适配
  src/project/         # 多语言发现、工具链与验证计划
  src/hooks/ src/openclaw/
  scripts/ tests/ docs/
  common-content.lock.json
  package.json
```

产品身份集中为明确的常量或配置，禁止散布 frontend-craft 清单名和 FRONTEND_CRAFT_* 变量。接口内部用语言模块注册表扩展，不建立多 npm 语言子包。

## 6. 首期能力清单

27 个后端 Skill，加七个公共 Skill，共 34 个分发入口。数量是本设计的范围边界，不作为能力质量证据。

| 分组 | 入口 |
| --- | --- |
| 语言规范（6） | bec-rust-project-standard、bec-go-project-standard、bec-java-project-standard、bec-python-project-standard、bec-c-project-standard、bec-cpp-project-standard |
| 语言专项（5） | bec-rust-async、bec-go-concurrency、bec-java-runtime、bec-python-async、bec-native-memory-safety |
| 后端专业（11） | bec-architecture-design、bec-api-design、bec-database-design、bec-transaction-management、bec-auth-security、bec-cache-design、bec-observability、bec-performance-optimization、bec-testing-strategy、bec-dependency-management、bec-code-review |
| 领域流程（5） | bec-project-init、bec-debug-framework、bec-doc-sync、bec-refactoring、bec-tdd-workflow |

语言规范负责现有项目约定、模块边界、依赖与构建、错误处理、资源管理和对应质量工具；专项深入解决异步取消、并发共享、JVM 行为、阻塞与事件循环、C/C++ 内存生命周期等区别，避免逐字复制通用方法。

C 与 C++ 规范分开：C 关注接口和分配约定、清理路径、未定义行为；C++ 关注 RAII、所有权、异常安全、模板/编译边界与 ABI。共同内存安全 Skill 依据实际语言分别分流，不能向 C 项目建议 C++ 机制。

后端专业技能涉及：API 兼容与幂等、数据模型/查询/迁移、事务边界和并发一致性、认证授权/输入与服务端安全、缓存失效与一致性、日志指标追踪、证据驱动性能诊断、测试分层和依赖供应链。按实际框架版本查项目依赖、源码和官方资料，不内置未经核验的“最新版本”建议。

调试、文档、重构、TDD 领域流程内嵌 common 方法引用，独立打包不依赖相邻 Skill。所有入口有明确正向/反向触发样例、局部加载 references、输入证据、执行步骤、交付与验证要求。

八个 Agents：bec-architect、bec-code-reviewer、bec-security-reviewer、bec-debugger、bec-test-planner、bec-performance-optimizer、bec-doc-updater、bec-refactoring-expert。由语言上下文进入对应规范，不为每种语言复制八套角色。报告存入 reports/backend-craft/，纯评审默认不改业务代码。

八个 Commands：bec-init、bec-plan、bec-review、bec-debug、bec-tdd、bec-refactor、bec-doc-sync、bec-validate。不支持原生命令的 Runtime 通过能力矩阵明确降级，不伪造宿主支持。

## 7. 语言发现、按需上下文与质量执行

语言模块分别声明标识、文件与清单证据、构建根选择、相关规则、可用工具检测及验证候选。以当前任务路径和最近的子项目清单为起点，同时保留多语言结果；嵌套工程不继承无关兄弟目录规则。

发现范围：选定工作区内，忽略 .git、依赖、构建目录、外部链接和敏感文件；有深度/数量上限，截断必须报告。Cargo.toml、go.mod/go.work、pom.xml、Gradle 设置与构建文件、pyproject.toml，以及 CMake/Meson/Make/源文件作为证据。CMakeLists.txt 单独不能判定 C 或 C++；优先显式工程语言/源文件证据，模糊时保留未确定状态。

识别和 doctor 是只读操作。禁止执行构建文件、导入目标 Python 模块或启动应用来“检测”语言。存在多个构建入口时列出候选，不能任选一个并隐瞒其他结果。

提供 `bec project inspect [path] [--json]` 与 `bec validate [path] [--dry-run] [--json]`。前者输出子项目、语言、证据与工具状态；后者先生成按构建根分组的验证计划，再明确执行已选项目的质量命令。存在歧义时拒绝自动执行并要求指定路径或已有验证配置。

执行优先级：用户显式项目验证配置 > 仓库已有任务/脚本 > 语言模块安全默认。项目配置以版本化数据 schema 表示工具、参数数组、工作目录、超时与阶段，不以任意字符串拼接 shell；执行仓库自己的构建工具仍是执行项目代码，不能当成沙箱。

Rust 使用已有 Cargo 工作流；Go 使用已有格式、静态与测试入口；Java 尊重 Maven/Gradle 及 wrapper；Python 使用已配置的检查和测试工具；C/C++ 使用现有构建目录/preset 或明确配置，未提供时只输出建议，不能擅自生成和运行构建命令。具体命令选择在实施研究中依据实际工具版本核验。

默认验证不修复文件、不安装依赖、不访问生产环境、不执行迁移和部署；集成测试需配置明确启用，不默认启动外部服务。缺失工具、跳过、超时、失败必须与通过分别报告；必需阶段未运行不算成功。推荐退出码 0 全部必需阶段通过、1 阶段失败、2 计划/工具/配置不能完成必需验证；JSON 报告不混入普通日志。

Hook 默认只报告项目上下文和可用验证入口。格式化及自动验证默认关闭；开启后也仅使用已有工具和明确项目范围，不调用 npx 自动下载工具，不在每次 Stop 重复全量构建或重写用户代码。不提供正则过滤命令即可保证安全的承诺。

## 8. CLI 与安装生命周期

遵循前端 3.0 的命令语义：`bec runtime install/update/uninstall [runtime]` 管理资源；`list`、`doctor`、`matrix`、`version`、`help` 提供状态与帮助。支持 local/global、en/zh-CN、dry-run、JSON 的适用组合，参数不合法在写入前报错。

首版不实现 CLI 自升级/自卸载：交给 npm/pnpm，避免复制与专业工程无关的包管理器来源推断；顶层 update/uninstall 提示使用 runtime 子命令或包管理器，不静默改变含义。也不实现旧 bec 命令迁移，因为没有已发布旧版后端产品。

覆盖前端现有 15 Runtime：Claude、Codex、Cursor、Windsurf、OpenCode、Kilo、Gemini、Copilot、Antigravity、Augment、Trae、CodeBuddy、Cline、OpenClaw、Qoder。能力子集以所参考前端矩阵为起点，实施时核验宿主官方契约，不因名字相同承诺统一功能。

公共目标按各 Runtime 实际 Skill 路径解析，Codex 为 .agents/skills，OpenClaw 项目为 workspace/skills；没有标准 Skill 支持的 Runtime 延用规则/命令降级，不创建假公共依赖。

后端独立清单 backend-craft.manifest.json 管理 bec 文件和本产品精确配置条目，并保存 common 依赖指针。调用 common 的 plan/execute/recover，先暂存产品变更，再一次事务写入公共资源、账本与产品文件。版本、语言、摘要不一致在写入前冲突；重复安装幂等，用户修改保留，部分卸载保留 common 引用，最后消费者退出仅清理未修改公共文件。

## 9. 前后端共存与共享配置

- 命名空间隔离 bec/fec/cc；后端不能认领或覆盖 fec 文件及公共账本。
- 后端 CLI 不向用户项目的 .claude-plugin/plugin.json 或 marketplace.json 写本产品原生元数据；这些元数据只在分发仓库和原生包中。避免与现有前端安装冲突。
- 已有 AGENTS.md、CLAUDE.md、GEMINI.md 等入口保留原内容，通过本产品有标记片段或宿主支持的独立文件引入后端规则；卸载仅移除逐字未变的本产品片段，修改片段保留并报告。需要共享文本更新时纳入产品事务。
- JSON/TOML 等结构化配置只操作本产品键或精确 hook 条目，记录条目级所有权；禁止认领整个共享文件。键冲突或格式损坏时零写入报错，不能“修复”为默认模板。
- 不能用“文件已经复制”替代可发现性：每个 Runtime 的 matrix 明确哪些能力自动加载、哪些需要用户按指南启用；doctor 区分资源存在和启用状态未知。若宿主支持独立配置文件，优先使用；如需修改现有共享配置，使用相应格式解析器而非正则拼装。
- 双产品 CLI 共存为强制验收，至少包含 Claude 和 Codex 的真实安装器交叉测试，其余 Runtime 按本机文件契约做双顺序回归。若前端更新会保留旧清单外的共享改动，应以实际测试证明，不能推断。

Claude/OpenClaw 原生渠道首期交付单产品完整快照及渠道互斥提示；不承诺双原生插件的公共发现去重。CLI 双消费者的通过不外推到原生渠道。

## 10. 分发、文档与测试

生成公共快照、领域方法副本、来源锁和组合 metadata/relations/eval_queries，复用 common 内容契约。公共资源完整性必须覆盖 data/styles/scripts/references/许可证；过期生成文件按旧锁与哈希安全清理，未知和修改文件阻断。

交付 npm CLI、Claude 原生元数据、OpenClaw 原生包、独立 Skill 包。公开依赖精确固定 1.0.1；bec 独立包随产品版本，cc 包保留 common 来源版本。不要求用户安装第三个插件。写中英文 README、能力矩阵、语言使用指南、共存说明与扩展新语言指南。

验证分层：

1. 静态：lint/typecheck、资源闭合、metadata/关系/正负触发、两语言一致、生成锁漂移及完整分发检查。
2. CLI：参数、语言/范围、dry-run 零写、用户修改、损坏清单、共享配置条目所有权、路径/链接、失败回滚、公共不兼容、真实包隔离安装。
3. 共存：前后端两种安装顺序、重复安装、各自更新、任一先卸载、最后卸载、部分卸载、不同语言/摘要冲突；本地与模拟全局根隔离测试，禁止触及真实 HOME。
4. 语言模块：六语言及混合/嵌套/模糊工程检测；候选命令、参数边界、工作目录、工具缺失、超时、失败和 JSON 输出。工具替身只能证明调度，不能证明语言真实编译成功。
5. 真实工具链：每种语言至少一个微型工程，在 CI 对应环境运行构建/测试；C 与 C++ 分开。运行明确配置的格式/静态检查，记录编译器与工具版本；未安装的可选分析工具标记未验证。
6. 能力应用：针对 27 个 bec Skill 准备正向/反向任务及决策压力情景，先记录无 Skill 基线，再验证加载后行为；不能编造基线失败。六语言各覆盖至少一个实现→测试→评审闭环，专项覆盖取消、资源/内存、并发或事务错误路径。

CI 基础矩阵 Windows/Linux、Node 22；语言作业按各自工具链独立执行。实施计划列明哪些门禁本机执行、哪些只能交 CI，不把计划中的 CI 称为已通过。正式发布前需验证公开 registry 干净安装；本地 tarball 验收不能替代。

## 11. 留给实施者的选择

实施者可以决定：模块/文件细分、必要格式解析依赖、测试夹具组织、工具命令具体参数、reference 拆分、CI 作业结构，以及不改变上述契约的内部复用。新增依赖先检查已有模式，版本与平台契约以官方资料及实际代码核验。

必须明确记录的设计者默认：1.0.0、英文及简体中文、15 Runtime 能力子集、27+7 Skills、8 Agents/8 Commands、默认关闭自动格式化/验证、首版无 CLI 自管理、原生双产品去重不在范围。

本项目体量较大，但用户选择一次设计完整首期。实施按垂直切片排序：内容/识别契约→语言与领域能力→产品生命周期及共存→Runtime 渠道与分发→真实工程验收。只有本文批准后才进入 writing-plans；不提前创建产品脚手架、安装依赖或写业务实现。

## 12. 独立可实施性审阅

2026-11-06，由独立上下文的 backend_design_builder_check 按 brainstorming 的 builder check 要求只读审阅。结论：没有影响实施计划的重要未决问题；交付边界、共存约束、执行安全和验收标准已明确，其余选择可按本文第 11 节在实施研究中确定。

本轮仅新增设计文档，尚未创建产品脚手架、安装依赖、实现代码或执行 Git 提交。

规划阶段事实更新（2026-11-06）：对公开 registry 执行 `npm view @bovinphang/craft-common@1.0.0 version --registry=https://registry.npmjs.org` 已成功返回 1.0.0。实施仍需核对实际发布包的 API、完整性和内容摘要与前端快照一致，不能由版本号相同推断内容兼容。
