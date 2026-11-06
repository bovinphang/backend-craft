# Backend Craft 独立最终代码评审

评审日期为 2026-11-06。评审人为独立上下文代理，本轮只进行一次评审。

## 范围与方法

已读取批准设计、实施计划 Review Focus、review-package.md 及 progress.md 的 Ruling。B 的 Base/HEAD 均为 eea827f，本次按工作区新增实现审查，覆盖 src、bin、scripts、测试、专业内容、角色、命令、规则、原生元数据和 CI。另检查 C/F 本次实际 diff。评审分为项目发现与执行、安装与恢复、内容与分发、测试与相邻仓库四轮阅读。

本次未改业务源文件、索引、HEAD、分支或依赖。复现仅写入系统临时目录。本报告是唯一仓库写入。

## 优点

- 产品身份、公共来源和安装所有权分离。公共摘要冲突在事务写入前处理，用户修改与其他产品文件有明确保留机制。
- 产品 overlay、beforeHash 冲突检查和 prepared/committed 恢复形成完整的事务路径，测试包含真实子进程中断。
- 六语言默认命令采用离线、只读检查及显式 integration 开关。执行器区分工具缺失、失败、超时、取消和输出超限。
- 双语专业内容覆盖资源归属、取消、并发、事务与验证证据。独立 Skill 包复制引用资源，公共来源锁覆盖完整资源。
- C 的 base64 解码再编码校验解决大日志正则栈问题，回归还包含非规范编码。F 的 diff 保持在依赖、生成元数据/锁、属性和对应断言范围。

## 问题

### Critical

无已确认项。

### Important

#### I1 Windows 路径大小写差异会让安装路径检查无限循环

- 位置为 D:/code/github/craft-ai-coding/backend-craft/src/install/safe-path.ts 第 36–48 行。同类路径位于 D:/code/github/craft-ai-coding/craft-common/src/install/transaction.ts 第 267–278 行。
- Windows 的 path.relative 接受大小写等价边界，随后 while 使用大小写敏感的字符串相等判断。遍历到盘符根之后 dirname 不再变化，循环仍不会结束。
- 独立复现使用真实临时目录，对 safeDestination(file, [root.toUpperCase()]) 执行有界子进程，2 秒后返回 ETIMEDOUT。另通过 C 的公开 executeSharedPlan，传入正常 allowedProductRoots 与大写 productMutation.path，dryRun 同样 ETIMEDOUT。
- 用户提供大小写不同的配置目录、历史绝对路径或 API 参数时，安装或预览会持续占用进程，且同步循环阻止常规取消逻辑运行。C 的问题是既有实现，本次 B 复用后仍可到达。
- 建议统一采用平台路径等价比较，并在 parent === current 时安全失败。回归覆盖盘符及目录大小写、正反斜杠、尾分隔符、junction 根和内部链接，并用独立进程超时保护测试。
- 同类检查结论为 project/paths.ts、discover.ts、languages/shared.ts 与 test-evidence.ts 的循环通常由同一规范化边界拼接目标，当前未独立复现挂起。仍应保证循环在文件系统根有终止保护。

#### I2 全部测试被跳过仍会报告验证通过

- 位置为 D:/code/github/craft-ai-coding/backend-craft/src/project/test-evidence.ts 第 39–43、49–65 行，调用点为 D:/code/github/craft-ai-coding/backend-craft/src/project/execute.ts 第 97–105 行。
- 检测器把 Ran N tests、Tests run: N、Node tests 总数或 JUnit tests 属性大于零当成已实际运行测试，未扣除 skipped/disabled。JUnit 分支同样只看总数。
- 独立复现运行真实 Python unittest，仅有一个使用 @unittest.skip 的测试。Python 成功退出并输出 Ran 1 test / OK (skipped=1)，executeValidation 返回 status=passed、exitCode=0。
- 依赖环境不可用而整套测试跳过时，用户及 CI 得到错误的绿色结论，违反必需测试未运行不能通过的执行契约。
- 建议依据各驱动的最终汇总或事件识别实际执行计数，报告全跳过状态。增加真实 unittest 全跳过、Node 全 skip、JUnit tests=1 skipped=1，以及部分执行/部分跳过的回归，保留自定义正计数标记的明确契约。

#### I3 从 Monorepo 根指定子项目时忽略子项目显式验证配置

- 位置为 D:/code/github/craft-ai-coding/backend-craft/src/cli/validate.ts 第 6–17 行。
- inspect 已选择最近子项目，但 readProjectConfig 始终读取 inspection.workspace。对于工作区内目标，workspace 保持当前工作目录，子项目中的 .backend-craft.json 完全不会被读取。
- 独立复现在 child/ 放置 pyproject.toml 与合法 .backend-craft.json。从父目录 validationPlan(parent, "child") 得到空 stages 和“没有安全默认验证阶段”。从 child 目录执行相同逻辑得到配置中的 selected 阶段。
- 用户按文档调用 bec validate <project-path> 时，已准备好的显式配置可能被忽略，也可能退回不同的默认命令，破坏显式配置优先语义。
- 建议明确并实现工作区配置与最近子项目配置的优先级，按配置所在目录解析相对路径。回归应通过 CLI 覆盖父目录指定子目录、指定子文件、子项目独立执行和根配置显式选择多个工程，保证范围一致。

#### I4 更新不会清理已从产品删除的托管资源

- 位置为 D:/code/github/craft-ai-coding/backend-craft/src/install/manifest.ts 第 173–174、235–261 行。
- 新会话完整继承 previous.files 和 previous.sharedEntries，结束时只排序并写回。实现没有记录本轮仍被请求的条目，也没有处理本轮消失的旧托管资源。
- 独立复现先生成并落盘 bec-obsolete.md，随后使用 mode=update 开启一次不再包含该文件的完整规划会话。结果为零 mutations，旧文件和所有权记录继续保留。
- 后续产品删除、重命名 Skill、规则、命令或引用资料时，用户更新后仍加载旧能力，旧规则可能继续影响模型行为。该问题同样影响共享入口迁移。
- 建议在完整产品规划结束时对比旧记录与本轮期望集合，将未修改的过期自有资源纳入同一删除事务，修改资源保留并报告 partial。针对删除文件、重命名入口、删除共享片段、用户修改、事务中断和 dry-run 添加回归。

#### I5 doctor 未检查共享入口，资源缺失时仍报告健康

- 位置为 D:/code/github/craft-ai-coding/backend-craft/src/cli/runtime.ts 第 18–23、45–46 行。
- doctor 只检查 manifest.files 和公共 Skill 内容，未读取 manifest.sharedEntries。CLAUDE.md、AGENTS.md、GEMINI.md 等共享入口正好使用独立条目记录。
- 独立复现完成真实 Claude 安装后，仅删除 .claude/CLAUDE.md，doctor(ctx).filesHealthy 仍为 true，CLI 据此退出 0。
- 用户排查上下文未生效时会收到错误的文件健康结论。这与 enabled=unknown 是不同层面的文件完整性问题。
- 建议按共享条目的精确归属检查片段或结构化值，区分缺失、修改及健康，并保持只读。回归覆盖共享文件整体删除、本产品片段删除/修改、用户正文新增及另一产品条目变化。

#### I6 Claude Git marketplace 缺少原生 Hook 的执行文件

- 位置为 D:/code/github/craft-ai-coding/backend-craft/.claude-plugin/marketplace.json 第 1 行、D:/code/github/craft-ai-coding/backend-craft/hooks/hooks.json 第 1 行及 D:/code/github/craft-ai-coding/backend-craft/.gitignore 第 2 行。
- marketplace 的 source 为 "./"，因此从 Git 仓库取得插件目录。SessionStart 指向 dist/hooks/bec-session-start.js，而 dist/ 被 Git 忽略，仓库可纳入版本控制的文件集合中包含 marketplace 和 Hook 配置，却缺少该执行文件。
- 独立核验 git ls-files --cached --others --exclude-standard 的三个结果分别为 true、true、false。npm tarball 的打包测试从已构建工作区取文件，覆盖不到 Git marketplace 这条分发路径。
- 按当前原生市场元数据安装时，Node 无法找到 SessionStart 模块，用户得不到承诺的只读上下文 Hook。公开 npm 依赖发布完成也不会自动修复相对 source 的 Git 内容缺失。
- 官方定义相对 source 指向 marketplace 目录，且添加 Git marketplace 会克隆仓库。该缺口可由源选择和文件集合确认，无需把宿主实际启用状态推断为通过或失败。[Claude 官方 marketplace 文档](https://code.claude.com/docs/en/plugin-marketplaces)
- 建议选择能交付构建产物的原生来源，例如 F 已采用的精确 npm source，或提供完整的原生发布目录/归档，并补充对应安装说明。回归应从干净、无 node_modules、无本地 dist 的来源重建实际分发入口，确认 Hook 目标随来源存在且能运行。


### Minor

#### M1 inspect 未返回计划承诺的工具状态

- 位置为 D:/code/github/craft-ai-coding/backend-craft/src/cli/inspect.ts 第 5–13 行、D:/code/github/craft-ai-coding/backend-craft/src/project/types.ts 第 21–27 行。
- inspect 仅返回发现报告，Inspection 无工具状态字段。probeTool 在 D:/code/github/craft-ai-coding/backend-craft/src/project/toolchain.ts 中实现，但产品代码未调用。
- 用户仍可借 validate --dry-run 获取缺工具信息，因此按当前用户影响列为 Minor。建议补充只读工具状态，或在交付范围中明确该项尚未完成。回归确认不会执行项目 wrapper、构建文件或下载工具链。

## 实测与证据边界

本评审亲自运行以下检查。

- 使用已安装本地 ESLint 执行 package.json 同一 lint 命令，退出 0。
- 使用已安装 TypeScript 执行 tsc --noEmit -p tsconfig.json，退出 0。
- 聚焦原套件 execute.test.ts、validation-plan.test.ts、manifest.test.ts，共 25/25 通过。这些测试当前未覆盖上述复现场景。
- 临时目录复现确认 I1–I5，Git 分发文件集合与官方来源契约确认 I6。复现脚本保留于 C:/Users/Bovin/AppData/Local/Temp/bec-independent-review.mjs 与 C:/Users/Bovin/AppData/Local/Temp/bec-independent-review-extra.mjs，生成目录以 bec-review- 开头。复现使用当前源码与本地已安装依赖。

评审包记录的 B 183 passed、39 外部 skipped、真实 F 共存 39/39、C 76/76、36 个归档以及五语言 RED→GREEN 属于执行者已有证据，本评审未重新运行全部矩阵。新增修复完成后仍须重跑完整套件。

公开 craft-common 1.0.1 未发布、公开源 frozen 安装失败、Rust 缺 Cargo 和远程 CI 未运行仍为交付门禁。当前不能称为六语言及公开安装全部验收通过。包内完整性测试与宿主真实启用状态需要分别陈述。

## Review Focus 核对

1. 同版本不同摘要冲突已有真实 common 事务及零写入测试，当前未发现新增反例。
2. 父 Cargo、子 Python、C/C++ 歧义与扫描截断已有处理。子项目配置的正常 CLI 入口遗漏见 I3。
3. 产品文件及共享条目所有权分离，共存测试使用真实 F CLI。更新旧资源及 doctor 的缺口见 I4、I5。
4. 超时、取消、输出限制与零计数已有执行测试。全跳过测试的误判见 I2。
5. 中文、空格、junction、Windows wrapper 和中断恢复已有测试。大小写等价路径遗漏见 I1。

## 设计与 Ruling 评估

沿用当前 checkout、保留未跟踪实现供评审、使用 cross-spawn、Java wrapper 显式准备、Make 入口有限识别、精确公共版本与摘要保护、语言更新沿用旧值等决策都有记录及明确代价。1.0.1 未发布采用本地包验证且保持公开安装阻塞的披露是准确的。

Skill 应用基线的跨组曝光及无量化提升证据已明确记录。现有应用材料能支持场景检查结论，不能支持行为提升比例。此次发现无需扩大框架技能或重构前端安装底座。

## Declined to judge

- 双原生 Claude/OpenClaw 插件对 cc 内容的发现去重。批准设计明确仅承诺单产品原生完整性，CLI 共存结论没有外推到此行为。
- common 既有大型图标和图表数据的逐条业务语义重新设计。评审包要求核对来源与闭包，本次按此检查复用边界。
- 宿主实机 UI 是否已启用每个安装资源。当前评审仅有文件契约及包证据，产品明确返回 unknown，缺少真实宿主会话证据，无法作通过判断。

## 建议

先处理 I1–I6，每项以本报告触发条件增加失败回归，再修复并运行完整套件。C 路径修复如纳入本轮，应重建本地依赖包并同步精确锁证据。M1 按执行流程记录为待处理项。公开发布、干净安装和远程六语言 CI 继续作为独立门禁。

## 结论

**可合并状态为需要修复。**

共有 6 项 Important、1 项 Minor，未确认 Critical。安装挂起、测试误报、子项目配置遗漏、更新残留、doctor 误报与原生 Hook 缺失影响正常使用，建议在完成本轮统一修复和完整验证后再作最终交付判断。公开依赖和六语言远程验收仍待完成。
