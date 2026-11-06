# backend-craft 1.0 实施计划

> **面向执行代理：** 必须使用 superpowers:executing-plans 或 superpowers:subagent-driven-development 逐任务实施，执行方式由用户确认。步骤使用复选框跟踪。

**目标：** 交付覆盖 Rust、Go、Java、Python、C、C++ 的后端专业插件，具备 27 个 bec 专业入口、七个 cc 公共入口及与 frontend-craft 安全共存的完整生命周期。

**架构：** backend-craft 独立维护产品内容、多语言项目识别、验证执行器和 Runtime 适配；精确消费 craft-common 的内容及公共事务协议。参考 frontend-craft 的既有产品模式，不重构其安装底座；安装产物、共享配置条目与公共引用分别管理所有权。

**技术栈：** TypeScript、Node >=22、ESM、pnpm 12.4.1、esbuild、ESLint、node:test；默认英文及 localized/zh-CN。具体第三方格式解析库在任务 1 核验后固定版本。

**设计依据：** [已批准设计](../specs/2026-11-06-backend-craft-design.md)，用户于 2026-11-06 确认“符合”。

实施修订（用户已确认）：公共依赖改为修复版 1.0.1；C 增加大日志恢复修复及生成文本 LF，F 同步公共依赖/快照、必要版本断言及生成换行属性，不改 F 业务实现。公开发布与远程 CI 为外部门禁，尚未完成。

## 全局约束

- 工作根为 `D:/code/github/craft-ai-coding/backend-craft`（B）；相邻 frontend-craft（F）和 craft-common（C）仅作参考及真实共存验证。不得在父目录执行 Git，不修改 F/C 业务代码。
- `@bovinphang/backend-craft@1.0.0`，CLI `bec` / `backend-craft`，后端 `bec-*`、公共 `cc-*`；精确依赖 `@bovinphang/craft-common: 1.0.1`。
- 首期 27 bec + 7 cc = 34 Skills，8 Agents、8 Commands，en/zh-CN；不得保留 fec 别名、伪造框架专项或新增产品生成器。
- 覆盖既有 15 Runtime 的实际能力子集，不把文件存在当成宿主启用；Copilot/Trae/Cline 不宣称标准 Skill 支持。
- 前端清单、文件和公共账本不能被后端认领；common 版本、语言、摘要不一致先冲突。用户修改保留，dry-run 零写入，最后消费者退出才清理未修改公共文件。
- 不向用户项目写 `.claude-plugin/plugin.json` / `marketplace.json`；共享入口使用片段或独立文件，共享结构化配置按条目所有权合并。
- CLI 自升级/自卸载、全栈编排、双原生插件去重、自动生产迁移和部署不在范围。
- Hook 默认关闭格式化/自动验证；验证不自动修复、不安装依赖、不默认执行集成测试；检测及 doctor 不执行目标项目代码。
- 识别以任务路径/子项目为边界，C 与 C++ 分开，不能因存在 CMakeLists.txt 就猜定语言。
- 缺失工具或未执行的必需阶段不能报成功；工具替身只能证明调度，不能证明真实语言构建成功。
- 本机可发现 Go、JDK、Python、CMake、GCC/G++；尚未发现 Cargo/Rust、Maven/Gradle。仅为 PATH 探测，不算工具链可用性验证。真实构建门禁由任务 16 明确执行和报告。
- 公开 npm 已可读 common 1.0.0；任务 1 必须检查发布包与 F 锁定快照，禁止遗留 file/link/workspace 或本地服务地址。若不可用，采用隔离 tarball 验证并明确公开安装未通过，不放宽供应链策略。
- 默认复用当前 checkout，在执行开始时核对工作区并使用 `feature/backend-craft-v1` 分支；如确需新 worktree，使用宿主工具。当前阶段仅设计和计划文件，不安装依赖、不建产品骨架。
- 本计划“提交边界”表示建议评审批次；没有本项目的新 Git 授权前，不自动 commit/merge/push/publish。旧前端抽取任务的提交授权不外推。

## Review Focus：高风险输入与归属

1. 同名版本但发布包内容不同：不得覆盖既有公共安装；任务 2、10 以实际 catalog 摘要和冲突零写入测试约束。
2. Monorepo 中父 Cargo workspace、子 Python、混合 C/C++ 及截断扫描：就近定位且保留歧义；任务 3、4 验证。
3. 共享入口用户编辑、配置格式损坏、另一个插件先安装：后端只改自己条目且可独立卸载；任务 9、13 验证。
4. 工具返回零但未运行测试、工具缺失、子进程超时或取消：不得报告全部通过；任务 5、6、16 验证。
5. Windows 中文/空格/junction、批处理 wrapper、安装中断：不跨边界、不拼接 shell、可恢复或安全拒绝；任务 6、8、10 验证。

## 文件责任地图与公共类型

| 文件 | 单一责任 |
| --- | --- |
| package.json、tsconfig*.json、eslint.config.mjs、scripts/build.ts、run-tests.ts | 工具链、构建与测试发现 |
| src/product.ts、src/content/types.ts、catalog.ts | 产品身份、完整内容目录与来源 |
| scripts/sync-common.ts、common-content.lock.json | 固定包快照生成、完整文件集合及来源锁 |
| src/project/types.ts、discover.ts、evidence.ts | 项目证据、边界与只读发现 |
| src/project/languages/{rust,go,java,python,c,cpp}.ts、registry.ts | 语言模块和验证候选 |
| src/project/config.ts、validation-plan.ts、execute.ts、toolchain.ts | 显式配置、只读计划、子进程与工具检测 |
| skills/bec-*、localized/zh-CN/skills/bec-* | 专业入口与按需 references |
| agents/、commands/、templates/shared/rules/ 及对应中文目录 | 领域角色、命令和分层规则 |
| src/install/{types,paths,registry}.ts、adapters/ | Runtime 能力、真实目标与产物计划 |
| src/install/{product-plan,manifest,shared-config,lifecycle}.ts | 暂存写入、产品所有权、共享片段、生命周期协调 |
| src/cli.ts、bin/backend-craft.ts | 参数、输出与退出码 |
| src/hooks/、src/openclaw/、hooks/ | 安全默认的宿主接入 |
| scripts/{pack-skills,pack-openclaw,check-content,check-packages}.ts | 完整分发、原生和独立包核验 |
| tests/{content,project,install,cli,packaging}/、tests/fixtures/ | 回归与微型真实工程 |
| docs/{research,runtimes,languages,verification}/、.github/workflows/ | 来源证据、能力矩阵、扩展和 CI 记录 |

核心类型统一定义，后续任务引用不得自行发明同义接口：

```ts
type LanguageId = 'rust'|'go'|'java'|'python'|'c'|'cpp';
type Phase = 'format'|'lint'|'typecheck'|'test'|'build';
type StageSpec = { id: string; phase: Phase; executable: string; args: string[];
  cwd: string; timeoutMs: number; required: boolean; integration?: boolean;
  env?: Record<string,string> };
type Project = { root: string; languages: LanguageId[]; evidence: string[];
  buildFiles: string[]; ambiguous: boolean };
type Inspection = { schemaVersion: 1; workspace: string; projects: Project[];
  warnings: string[]; truncated: boolean };
type ValidationPlan = { schemaVersion: 1; projects: Project[]; stages: StageSpec[];
  problems: string[] };
type StageResult = { id: string; status: 'passed'|'failed'|'missing'|'timeout'|'skipped'|'cancelled';
  exitCode: number|null; durationMs: number; reason?: string };
type ValidationResult = { schemaVersion: 1; results: StageResult[]; exitCode: 0|1|2 };
type ToolStatus = { available: boolean; version?: string; reason?: string };
type ProductCatalog = { schemaVersion: 1; packageVersion: string; language: 'en'|'zh-CN';
  skills: Array<{id:string; sourcePackage:string; version:string; files: Array<{relativePath:string;hash:string}>}>;
  agents: string[]; commands: string[] };
```

配置 `.backend-craft.json`：`{schemaVersion:1, enableIntegration?:boolean, projects:[{root, languages?, stages:StageSpec[]}]}`，enableIntegration 默认 false；磁盘中的 cwd/root 使用工作区相对路径，解析为绝对路径后才传入内部类型；拒绝未知字段和越界。StageSpec 是参数数组，不接受 shell 字符串，env 仅是子进程环境增量且不得输出到日志。配置只由用户明确创建或 bec-init 经确认生成，不由探测操作写入。

## 任务 1：可构建包、来源与内容契约

**文件：** package.json、pnpm-lock.yaml、pnpm-workspace.yaml、tsconfig*.json、eslint.config.mjs、.gitignore；src/product.ts、src/content/types.ts、catalog.ts；scripts/build.ts、run-tests.ts；tests/content/catalog.test.ts；docs/research/baseline.md。

**接口：** `PRODUCT` 包含 name/version/prefix/manifestName；`readProductCatalog(root:string, language:'en'|'zh-CN'): ProductCatalog`，后者包含技能/角色/命令及文件来源；参考 F 的包来源和资源收集，复用 C 的 `collectSkillResources`。

契约断言：`assert.equal(PRODUCT.name,'@bovinphang/backend-craft')`、`assert.equal(PRODUCT.version,'1.0.0')`、`assert.equal(PRODUCT.manifestName,'backend-craft.manifest.json')`。

- [x] 记录 B/F/C SHA 与清洁状态；读取 common 公开包 API/完整性，比较 F 内容锁与实际包的双语 digest，记录依赖版本与适配参考来源。若同版本不兼容，记录实际证据，保留冲突保护，不能改写锁掩盖。
- [x] 建立测试工具链，先写 `产品身份独立`：断言 name 为 @bovinphang/backend-craft、version 为 1.0.0、manifestName 为 backend-craft.manifest.json；`目录只接受 bec/cc 来源且拒绝 symlink`；读取未实现契约应失败。
- [x] 运行 `node --import tsx --test tests/content/catalog.test.ts`，确认因契约缺失 RED；依赖或语法报错不作行为红灯。
- [x] 实现上述身份/内容接口；沿用 F 的 Node/ESM/严格 TS/ESLint 工具链及已核对版本；加入 lint/typecheck/test/build 脚本，不引入 Vite/Vitest。新增格式解析依赖须在 baseline.md 记录必要性、官方来源及固定版本。
- [x] 执行 `pnpm lint`、`pnpm typecheck`、`pnpm test`、`pnpm build`，预期全部退出 0。提交边界：`feat(core): 建立后端插件内容契约与工具链`。

## 任务 2：公共内容快照及嵌入方法

**文件：** scripts/sync-common.ts、src/content/common.ts、common-content.lock.json；skills/cc-*/**、localized/zh-CN/skills/cc-*/**；tests/content/common.test.ts。

**接口：** `syncCommonContent({productRoot,commonRoot,check}):void`；`readCommonCatalog(productRoot,language):ContentCatalog`；复用 C 的 `readContentCatalog` / `readMethodResource`，锁结构沿用 F 已验证模式。

契约断言：对 en/zh-CN 分别 `assert.equal(readCommonCatalog(root,language).skills.length,7)`；未知 extra 文件应 `assert.throws(()=>syncCommonContent({productRoot:root,commonRoot,check:true}),/未知|额外/)`。

- [x] 先写测试：双语七入口；额外未知文件在 check/write 两模式均拒绝；上游删除的未改资源清理、用户修改保留；锁越界/链接拒绝；相同版本不同 digest 显式不兼容。未实现时运行该测试文件确认 RED。
- [x] 参考 F 的完整集合校验实现生成与来源锁；生成四个领域方法引用位置，供任务 7 消费，不手改 cc 文件；组合索引只替换公共部分。
- [x] 运行 `pnpm run sync:common` 与 `pnpm run check:common`，预期确定性生成且检查零写；重复测试全部 GREEN；`pnpm typecheck` 退出 0。提交边界：`feat(content): 接入公共内容与来源锁`。

## 任务 3：有边界的项目发现

**文件：** src/project/{types,discover,evidence}.ts；tests/project/discover.test.ts、tests/fixtures/discovery/**。

**接口：** `inspectProject({workspace,taskPath?,maxDepth?,maxEntries?}):Inspection`；默认 maxDepth=12、maxEntries=10000，截断有 warning/truncated。此任务不探测可执行工具。

契约断言：对超限夹具 `assert.equal(inspectProject({workspace,maxEntries:1}).truncated,true)`；仅 CMake 的夹具 `assert.equal(result.projects[0].ambiguous,true)`，不能返回唯一 cpp。

- [x] 建立单语言、父 workspace+嵌套异语言、兄弟工程、仅 CMake 未声明语言、C/C++ 混合、外部链接、敏感文件和达到扫描上限的夹具。
- [x] 测试断言：任务路径优先最近子根；同根多语言不压成一种；CMake 存在不能直接猜 cpp；截断不是完整发现；发现不调用 exec/import、不写文件。运行 `node --import tsx --test tests/project/discover.test.ts` 确认 RED。
- [x] 实现基于内容证据和清单位置的只读扫描；排除 .git/target/node_modules/.venv/venv/build/dist 和敏感文件；CMake/Gradle/Make 等只读取，不解释执行。
- [x] 运行上述测试 GREEN、`pnpm lint`、`pnpm typecheck`；提交边界：`feat(project): 实现多语言子项目识别`。

## 任务 4：六语言模块与候选验证计划

**文件：** src/project/languages/{rust,go,java,python,c,cpp}.ts、registry.ts、toolchain.ts；tests/project/languages.test.ts；docs/research/language-tools.md。

**接口：** `LanguageModule {id:LanguageId; skillIds:string[]; suggest(project:Project):StageSpec[]}`；`LANGUAGES:Record<LanguageId,LanguageModule>`；`probeTool(executable:string,args:string[]):ToolStatus`，ToolStatus 含 available/version，不读取环境变量值。

契约断言：`assert.deepEqual(Object.keys(LANGUAGES).sort(),['c','cpp','go','java','python','rust'])`；未配置的 native 工程 `assert.equal(LANGUAGES.cpp.suggest(project).length,0)`，配置缺口由任务 5 放入 problems。

- [x] 核验各语言工具的官方命令文档和现有项目任务优先规则，记录 URL、核验日期、使用的版本。不得无条件拼出所有项目通用的框架命令。
- [x] 先写表驱动测试：Rust/Cargo、Go、Java/Maven 与 Gradle 候选、Python 已配置工具；无 CMake preset/build 配置的 C/C++ 只返回缺配置问题；有多入口不能静默选一个；新语言注册无需改扫描主流程。运行测试确认 RED。
- [x] 实现语言注册表及只读工具版本检测，禁止 import 业务 Python 或执行构建任务来识别项目；将候选与已选计划分开，工具缺失不能算成功。
- [x] 将工具链禁止隐式安装的边界写入测试：Cargo 使用 --offline/适用时 --locked；Go 子进程禁用代理下载及自动切换工具链；Maven 离线、Gradle --offline，wrapper 分发缓存缺失则标记需先准备，不启动其下载流程。Python 不调用 pip；native 不安装编译器。具体版本参数以该任务官方核验为准。
- [x] 测试 GREEN、lint/typecheck 通过；提交边界：`feat(project): 增加六语言工程模块`。

## 任务 5：显式配置和确定性验证计划

**文件：** src/project/config.ts、validation-plan.ts；tests/project/validation-plan.test.ts；docs/validation-config.md。

**接口：** `readProjectConfig(workspace:string):ProjectConfig|undefined`；`planValidation(inspection:Inspection,config?:ProjectConfig):ValidationPlan`；ProjectConfig 为上方 schema 的解析结果。

契约断言：对有歧义的夹具 `assert.ok(planValidation(inspection).problems.length>0)`；越界配置 `assert.throws(()=>readProjectConfig(workspace),/越界/)`；明确配置的 cwd 必须等于该根的解析绝对路径。

- [x] 先写测试：配置优先于仓库任务再优先于候选；相对 cwd 规范化；未知字段、shell 字符串、越界路径、多个未决构建入口被拒绝；缺必需工具/空验证计划不报可执行成功；默认 integration 阶段跳过并有原因。运行测试确认 RED。
- [x] 实现配置校验及只读计划，timeoutMs 默认 120000、允许 1000–600000；所有阶段必须有唯一 id。不给缺失的格式工具补装，不将 Cargo/Maven 的隐式联网依赖准备伪装为离线保证。
- [x] 配置未要求且工具尚无本地依赖时输出需要先准备依赖；真正验证只执行既有环境可执行的计划。测试断言 dry-run 只产出计划且无临时目录。
- [x] 全部 GREEN、lint/typecheck；提交边界：`feat(validation): 增加可审计验证计划`。

## 任务 6：可取消的验证执行器

**文件：** src/project/execute.ts、process.ts；tests/project/execute.test.ts、tests/fixtures/tools/**。

**接口：** `executeValidation(plan:ValidationPlan,{signal?}):Promise<ValidationResult>`；分组顺序执行，失败后后续同项目必需阶段标记 skipped，其他项目可以继续但最终不报成功。dry-run 只由 CLI 输出 ValidationPlan，不调用执行器，不制造全 skipped 却成功的执行结果。

契约断言：缺工具时 `assert.equal(result.exitCode,2)` 且 `assert.equal(result.results[0].status,'missing')`；真实命令非零时 exitCode=1；阶段状态不能仅由子进程 exitCode=0 推断已经运行过测试。

- [x] 测试真实子进程：通过、非零、ENOENT、超时、取消、过量输出、cwd 含空格中文、Windows wrapper 参数含 `&`/空格；没有 shell 注入或误执行第二条命令。必需 skipped/missing/cancelled 导致 exitCode=2，普通执行失败为 1，全部必需 passed 才为 0。运行测试确认 RED。
- [x] 用 execFile/spawn 参数数组执行；输出缓冲上限 1 MiB，默认报告结构化结果不回显完整环境、配置或输出；JSON 模式 stdout 保持单对象。Windows .cmd/.bat 仅走固定 launcher 与经过测试的参数编码，不接受任意 shell command。
- [x] 为标准测试驱动补实际运行证据：识别已知的零测试/skip-tests 结果，返回 failed 并有 reason；自定义测试入口无法判断是否实际运行时，报告证据未确认而非宣称测试已执行。普通 build 成功不能代替 test 阶段通过。
- [x] 超时/取消清理本次启动的子进程树，Windows 原生工具与 POSIX 信号分别验证；不能因为父进程退出就声称子树已结束。
- [x] 运行测试 GREEN、lint/typecheck；提交边界：`feat(validation): 实现受控质量命令执行`。

## 任务 7：27 个后端专业 Skill 与应用验收

**文件：** 设计第 6 节列出的 skills/bec-*/SKILL.md、references/** 及中文镜像；skills/{metadata,relations,eval_queries}.json 及中文镜像；tests/content/skills.test.ts；tests/evals/scenarios.json；docs/verification/skill-application.md。

**接口：** `readProductCatalog`（任务 1）、公共方法引用（任务 2）、LanguageId/语言识别（任务 3、4）。不得以 27 份相同文本加语言名交付。

契约断言：`assert.equal(catalog.skills.filter(s=>s.id.startsWith('bec-')).length,27)`、`assert.equal(catalog.skills.length,34)`；两语言 ID 集合必须 deepEqual，关系引用必须可定位。

- [x] 按 writing-skills 工作流先为每个入口写正/反任务与决策压力场景；先运行无 Skill 基线并记录真实行为；若基线已通过，不能编造违规，改用更有区分力的场景或明确能力证据局限。
- [x] 内容测试精确断言 27 个 bec ID 与设计清单一致、双语 ID/关系闭合、方法引用本地可读；例如 C 规范不能要求 RAII、C++ 必须解释异常/所有权，数据库技能必须涉及迁移/查询/回滚证据，安全技能不能把客户端检查当服务端授权。运行测试确认新能力契约 RED。
- [x] 编写入口与聚焦 reference；frontmatter 只写触发条件，通用方法复用 common；正反场景各至少 4 个，覆盖边界任务。27 个入口可按语言规范、专项、领域流程分内部小步，每步保留先失败后通过证据。
- [x] 运行加载后相同应用任务，记录六语言实现→测试→评审及专项错误路径；静态检查与应用验收分开，不用关键词断言替代代理行为。GREEN 后运行全套内容检查、lint/typecheck；提交边界按上述三组拆分 `feat(skills): ...`。

## 任务 8：产品文件计划和独立所有权

**文件：** src/install/{types,product-plan,manifest}.ts；tests/install/product-plan.test.ts、manifest.test.ts。

**接口：** `InstallContext {productRoot,contentRoot,cwd,home,baseDir,runtime,isGlobal,language,mode,dryRun}`；`planProductWrites(operation:()=>Promise<void>):Promise<FileMutation[]>`；`readManifest(path):ProductManifest|undefined`；ProductManifest 包含 schemaVersion=1、产品/Runtime/scope、files、sharedEntries、common 指针。FileMutation 使用 common 导出类型。

契约断言：规划一个新文件后 `assert.equal(fs.existsSync(target),false)` 且 `assert.equal(mutations[0].after?.toString(),'planned')`；清单不能出现任一 fec/cc 独占路径。

- [x] 先写测试：规划时零磁盘写入；backend-craft.manifest.json 与 F 清单隔离；拒绝 fec/cc 文件独占；旧记录损坏、身份切换、链接/越界、规划后文件被改均安全失败；用户修改及未知文件不能用 force 接管。运行测试确认 RED。
- [x] 参考 F 的暂存 FS 模式实现读写 overlay，所有权只记录 B 创建或可证明已拥有的文件；产品身份由 PRODUCT 提供，不机械改名复制整个安装器。
- [x] 对不支持 Skill 的 Runtime 提供本地产品事务执行路径，复用同一 FileMutation 校验规则；不伪造 common 消费者。日志只信任当前调用上下文的边界。
- [x] 测试 GREEN、lint/typecheck；提交边界：`feat(install): 建立独立清单和产品变更计划`。

## 任务 9：共享文本与配置条目所有权

**文件：** src/install/shared-config/{text,json,toml,types}.ts；tests/install/shared-config.test.ts。

**接口：** `planSharedEntry(file:string, entry:OwnedEntry, action:'upsert'|'remove'):FileMutation|undefined`；OwnedEntry 为 text-marker、json-path/hook、toml-key 的判别联合，包含产品固定 id、安装值哈希和条目定位。共享文件不得进入 manifest.files。

契约断言：移除 B 后 `assert.match(body,/用户正文/)`、`assert.match(body,/frontend-craft/)`、`assert.doesNotMatch(body,/backend-craft:start/)`；B 片段用户修改后应保留并报告 preserved。

- [x] 测试 AGENTS/CLAUDE/GEMINI 前后有用户正文、同名冲突/重复 marker、条目被修改、格式损坏、用户新增 JSON 键、其他插件 hook、已有 TOML 注释与未知表；只修改 B 条目，卸载保留其他字节或解析等价内容。运行测试确认 RED。
- [x] marker 固定为 `<!-- backend-craft:start -->` 与 end，记录安装片段哈希；只有对应片段未改才移除。结构化格式使用核验过的解析器，不用 regex 改 TOML；无法无损表示的输入拒绝并提示人工整合。
- [x] 同一计划多次修改共享文件必须读取 overlay 而非原磁盘；将最终变更交任务 8，不先写磁盘。测试 GREEN、lint/typecheck；提交边界：`feat(install): 维护共享配置条目所有权`。

## 任务 10：公共与产品生命周期协调

**文件：** src/install/lifecycle.ts、common.ts；tests/install/lifecycle.test.ts。

**接口：** `installRuntime(ctx:InstallContext):Promise<InstallResult>`、`uninstallRuntime(ctx):Promise<InstallResult>`；InstallResult 含 changed/preserved/conflicts/common 状态。消费任务 8/9 计划、任务 11/12 adapter 与 C 的 planSharedDeployment/executeSharedPlan/recoverSharedTransaction；可先使用最小测试 adapter，不提前假称所有 Runtime 完成。

契约断言：F 引用存在时卸载 B 后 `assert.equal(fs.existsSync(commonSkill),true)`；不同摘要安装 B 应 rejects，随后 `assert.deepEqual(snapshotAfter,snapshotBefore)`。

- [x] 先写真实目录测试：相同 common 复用；版本/语言/内容冲突零写；公共不进产品文件清单；用户改文件、部分卸载 retainConsumer、最后退出保留公共修改；两种中断点恢复；持锁并发安全拒绝。运行测试确认 RED。
- [x] 实现有 Skill 时的公共+产品一次事务，传入当前真实 allowedProductRoots；无 Skill 时执行任务 8 产品事务。产品清单指针使用真实目标，拒绝同清单 scope/runtime/target 切换。
- [x] 将根 junction 规范化与内部链接拒绝测试落到真实安装协调路径；dry-run 不恢复写日志/建目录。GREEN 后 lint/typecheck；提交边界：`feat(install): 接入共享公共依赖生命周期`。

## 任务 11：Claude / Codex 专业角色与安装切片

**文件：** agents/{设计八角色}.md、commands/{设计八命令}.md、templates/shared/rules/bec-*.md 及中文镜像；src/install/{paths,registry}.ts、adapters/{claude,codex}.ts；tests/install/core-runtimes.test.ts。

**接口：** `RuntimeAdapter {id;capabilities; plan(ctx:InstallContext):Promise<void>}`，plan 仅用任务 8 overlay；`getRuntimeTarget(ctx):{baseDir,skillsDir?}`。能力表区分 artifacts/discovery/manualSteps，不静默将未知启用标成 true。

契约断言：`assert.equal(catalog.agents.length,8)`、`assert.equal(catalog.commands.length,8)`；安装前后 F 的 `.claude-plugin/plugin.json` 字节必须 deepEqual；Codex local skillsDir 必须是 cwd/.agents/skills。

- [x] 先核验 Claude/Codex 官方发现与配置契约，记录 docs/research/runtime-contracts.md；借鉴 F 路径、格式转换、环境覆盖，显式接受可注入 home 以隔离测试。
- [x] 先写 local/global 两语言测试：8 个 bec Agent/命令按能力存在，Codex .agents/skills 与 .codex 分离；已有入口和 F 元数据不覆盖；Codex 不生成虚构原生命令；规则选择不会载入无关语言。运行测试确认 RED。
- [x] 编写 8 Agents/8 Commands 与分层 Rules，报告到 reports/backend-craft；实现两适配器。CLI 安装不写用户项目 .claude-plugin；宿主已有配置必须保留并确保后端入口可发现或明确标记手动启用。
- [x] 通过任务 10 执行真实双语安装/更新/卸载；测试 GREEN、内容检查、lint/typecheck；提交边界：`feat(runtime): 交付 Claude 与 Codex 后端能力`。

## 任务 12：其余 13 Runtime 与能力矩阵

**文件：** src/install/adapters/{cursor,windsurf,opencode,kilo,gemini,copilot,antigravity,augment,trae,codebuddy,cline,openclaw,qoder}.ts、registry.ts、paths.ts；templates/<runtime>/**；tests/install/runtime-matrix.test.ts。

**接口：** 统一消费任务 11 的 RuntimeAdapter / getRuntimeTarget。Runtime ID 顺序及集合与设计一致，未知 ID 直接报错，禁止落到默认 Claude 目录。

契约断言：`assert.equal(Object.keys(RUNTIMES).length,15)`；Copilot/Trae/Cline 的 skillsDir 为 undefined；任意 dry-run `assert.deepEqual(fs.readdirSync(target),[])`（原为空的目标夹具）。

- [x] 核验各 Runtime 宿主契约并补来源记录；从 F 对应适配器保留已验证目录事实，按产品名隔离输出。先写能力矩阵/发现路径/不支持能力不生成/所有 dry-run 零写测试，运行确认 RED。
- [x] 实现有标准 Skill 的对应目录与命令/规则降级；OpenClaw 本地 workspace/skills；Cline 独立 backend-craft.md；Copilot/Trae/Cline 无公共标准 Skill；global 与 local 差异单独测试。
- [x] 无法确认自动发现的条目在 matrix 明确手动步骤；不得靠提升 capability 标记绕过测试。GREEN 后对全部 15 Runtime、两范围、两语言参数组合运行文件契约回归；lint/typecheck。提交边界按适配族分别 `feat(runtime): ...`。

## 任务 13：真实前后端安装器共存验收

**文件：** tests/install/coexistence.test.ts、tests/fixtures/frontend-reference.json；scripts/verify-coexistence.ts；docs/verification/coexistence.md。

**接口：** 使用 F 固定提交的真实 CLI/安装器构建产物，不用自制 frontend 占位对象替代；reference.json 记录 SHA、包路径和 common digest。临时目录与模拟 home 注入由任务 11 提供。

契约断言：每个顺序 B 卸载后 `assert.deepEqual(frontendOwnedHashesAfter,frontendOwnedHashesBefore)`，公共 Skill 仅一份；最后消费者退出后未修改公共文件不存在。

- [x] 先写 Claude/Codex 两种安装顺序及余 13 Runtime 的文件契约矩阵：F→B、B→F、重复、各自更新、任一先卸载、最后卸载、用户修改/未知配置、语言/摘要不兼容；每步记录文件集合和配置 diff。
- [x] 运行测试确认实际缺口；若已通过也如实记录，不能为造 RED 弄坏前端。修复仅限 B 适配与契约错误；若必须修改 F，先报告最小改动及用户可见影响，不私自扩大范围。
- [x] 强制核对 F 安装在 B 后不会覆盖 B 的上下文或原生元数据；B 卸载后 F 可继续使用，公共引用不丢失；对 F 原先按整文件管理的被修改共享入口，允许其保守保留并准确报告，不能声称无残留完整卸载。
- [x] 全矩阵 GREEN 并保存复现命令与边界；lint/typecheck。提交边界：`test(coexistence): 验证真实前后端产品共存`。

## 任务 14：CLI、只读状态与安全默认 Hooks

**文件：** bin/backend-craft.ts、src/cli.ts、src/cli/{parse,output,inspect,validate,runtime}.ts；src/hooks/{session-start,format,validate}.ts、hooks/hooks.json；tests/cli/*.test.ts、tests/hooks/*.test.ts。

**接口：** `main(argv:string[], io:CliIO):Promise<0|1|2>`；project inspect、validate 使用任务 3–6；runtime 使用任务 10–12；list/doctor/matrix 只读，version/help 不依赖目标工程存在。

契约断言：`assert.equal(await main(['runtime','install','unknown'],io),2)` 且目标无变化；inspect 的 stdout 可 JSON.parse；validate --dry-run 的 stdout 是计划，执行器调用次数为 0。

- [x] 先写命令测试：参数非法早于写入；inspect JSON 单对象；validate 缺工具/失败/跳过 exitCode 正确；顶层 update/uninstall 明确提示而不执行 CLI 自管理；已有 F 不被当作 B 安装；doctor 报资源存在与启用未知的区别。运行确认 RED。
- [x] 实现所有上述命令，runtime install/update/uninstall 支持选择 Runtime、local/global、语言、dry-run；不加设计外旧 bec alias 或迁移器。plan/result 的 JSON 走 stdout，诊断走 stderr，日志不泄露配置/环境值。
- [x] Hook 默认仅报告上下文；显式开启格式/验证后使用任务 3–6 已选范围及本地工具，格式属于独立用户 opt-in 操作，不调用 validate 的只读默认执行修复。测试默认不 spawn、不写文件、不 npx下载，开启也有超时与失败报告。
- [x] 全部 GREEN、`pnpm lint`、`pnpm typecheck`、`pnpm test`；提交边界：`feat(cli): 交付后端工程命令与默认安全接入`。

## 任务 15：原生渠道、完整包与双语文档

**文件：** .claude-plugin/{plugin,marketplace}.json、openclaw.plugin.json、src/openclaw/**；scripts/{pack-skills,pack-openclaw,check-content,check-packages}.ts；tests/packaging/*.test.ts；README.md、README.zh-CN.md、docs/runtimes/**、docs/languages/**、docs/extending-languages.md、docs/coexistence.md。

**接口：** `packSkills(productRoot,outDir):PackageSummary[]`；`checkPackages(productRoot):void`；来源版本由任务 1/2 的 catalog 获取，不跟产品 sync-version 覆盖 cc 版本。

契约断言：`assert.equal(packages.length,34)`，bec/cc 的 sourcePackage 分别为 backend/common，双语所有运行资源和内容锁均存在，不能只断言 SKILL.md 在包里。

- [x] 先写隔离 tarball 测试：34 完整技能、8 Agents/8 Commands、双语、锁、data/styles/第三方声明、领域本地方法存在；脱离源码/node_modules 后资源可读，运行可独立脚本；cc 来源为 common，bec 为 backend。运行确认 RED。
- [x] 参考 F 构建与分发结构，形成 npm CLI、Claude 元数据、OpenClaw 原生包与 34 独立 Skill 包；native/CLI 渠道互斥说明明确，不宣称双原生去重。
- [x] 文档由实际 matrix/CLI/schema 驱动；扩展指南按新增 LanguageModule、识别证据、references、正反触发和真实工具链测试演示；不得靠修改多个 switch 才能增加语言。
- [ ] 运行 `pnpm run pack:all`，定义为 build→test→原生构建→包核验，全部退出 0；运行 `pnpm run check:common`、`pnpm typecheck`、`pnpm lint`。公开源 frozen 安装在独立临时项目验证，记录实际结果。提交边界：`feat(distribution): 完成双语多渠道交付`。

## 任务 16：六语言真实工程、CI 与交付证明

**文件：** tests/fixtures/projects/{rust,go,java,python,c,cpp}/**；scripts/verify-language-fixtures.ts；.github/workflows/{ci,language-fixtures}.yml；docs/verification/{toolchains,acceptance}.md。

**接口：** 直接通过 `bec project inspect`、`bec validate` 调用上述夹具，不另写绕过产品执行器的成功脚本。夹具与验证配置均纳入 source control；产物写临时目录。

契约断言：逐语言真实缺陷版本 validate exitCode=1，修复后=0 且 test 结果有运行证据；工具链未安装时 exitCode=2 并记 missing，不作业务 RED。

- [x] 每种语言先放一个有可复现缺陷/失败断言的微型工程，验证产品报告 failed；修复后验证 passed。C/C++ 分开，至少含一个资源/错误清理用例；Go/Rust/Python 至少一个并发/取消相关用例；Java 含明确测试入口。缺编译器不是有效业务 RED。
- [x] 根据本机工具实际执行可用语言；缺 Cargo/JDK构建工具等明确记为未运行，不能静默跳过。不得未经用户授权安装系统级工具链；CI 用官方 setup 与明确版本配置补齐。
- [x] CI 基础 Windows/Linux Node 22 执行 lint/typecheck/test/pack/check:common；语言作业分别设置 Rust、Go、Java、Python、C、C++ 工具并运行相同产品命令。固定可重复夹具依赖，缺少标准测试工具时不把编译成功写成测试通过。
- [ ] CI YAML 语法、命令及本机执行结果核验；只有实际 CI 运行通过才能记 CI GREEN，否则报告“已配置，待远程执行”。不为了触发 CI 擅自推送。
- [ ] 最终运行 B 的 lint/typecheck/test/pack:all、来源锁检查与真实共存，汇总所有 RED/GREEN、官方来源、工具版本、未运行项及独立审查处置到 acceptance.md。提交边界：`test(acceptance): 验证六语言工程与分发闭环`。

## 依赖顺序、完成条件与计划自检

依赖：1→2；1→3→4→5→6；2/3/4→7；1→8→9；2/8/9→10；7/8/9→11→12；10/11/12→13；3–6/10–12→14；2/7/11/12/14→15；6/13/15→16。10 可用最小 adapter 测试先实现，11/12 再替换为正式 adapter，避免循环依赖。

执行时每个任务记录可观察证据；无关文案不写镜像测试。完成不以文件数量判定，以契约、应用验收、真实生命周期、实际语言结果及包的隔离运行判定。最终按执行技能安排独立全分支评审；未决重要缺陷不能计为完成。

自检结果：设计 §1–5→任务 1/2/8；§6→7/11；§7→3–6/14/16；§8→10–12/14；§9→9/13/15；§10→2/7/13/15/16；§11 的实施者选择在相应任务记录。Review Focus 五类均有具体测试归属。本文未写业务实现体，所有跨任务接口使用同一类型；Git、npm 发布和系统工具链安装不因计划完成自动获得授权。

## 执行交接

当前仅完成已批准设计与本计划。沿用本会话此前“主代理直接实施、最后一次独立评审”的执行偏好作为建议；若用户希望逐任务子代理实现与评审，可切换。计划审阅确认前不开始产品实现。


实施收尾：本地完整脚本及重要项修复已通过，公开依赖安装/Rust 实测/远程 CI 仍按验收报告保留为外部门禁；M1 工具状态字段延期，不把未运行事项勾为通过。
