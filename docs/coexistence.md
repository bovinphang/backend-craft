# 与 Frontend Craft 共存及迁移

统一底座正式版本号为 `@bovinphang/craft-common@2.0.0`，已发布至 npm。两产品共同使用 common 的显式会话、路径机制、共享配置算法、配置锁及事务；产品只声明身份、兼容清单及资源转换。保留1.0.1修复；1.x及开发快照升级至2.0.0仍要求版本、语言、摘要完全一致。

前端专业能力使用 fec-*，后端使用 bec-*，公共能力使用 cc-*。后端只记录自身文件和共享入口内的具体条目，不能将整个 AGENTS.md、CLAUDE.md、settings.json 或 config.toml 认领为独占文件。

两产品必须使用相同 common 版本、语言及精确内容摘要；本次精确使用2.0.0；craft-common 2.0.0、frontend-craft 3.0.0、backend-craft 1.0.0 均已于2026-11-09（Asia/Shanghai）发布至 npm，版本号不变。旧快照与2.0.0不能混装，发生冲突时安装零写入。升级顺序：

1. 备份实际用户修改，运行各产品 doctor/清单检查，确认 local/global 与 Runtime。
2. 用旧产品的 runtime uninstall 退出旧公共消费者；修改过的文件会保留，需要人工确认后重试，不使用 force 接管。
3. 公共2.0.0及对应产品实际发布、公开消费验证后安装匹配产品，分别执行 runtime install 或 update。用两产品 doctor 和公共 dependencies.lock.json 核对消费者。
4. 修改过的同名 cc 文件不会被新版本覆盖；确认自定义内容的去向后再重新安装。

F 3.0 原有部分共享入口按整文件管理，B 插入自己的 marker 后，F 卸载可能保守保留该文件及公共引用。先退出 B，再重试 F；这是有意保留现场，不表示完整卸载。后端不改写前端原生 .claude-plugin 元数据。

同一 Runtime 的 CLI 与原生渠道互斥；切换渠道前卸载原渠道。双原生插件的 cc 发现去重不在本期范围。真实共存复现见 [验证说明](verification/coexistence.md)。

## 2026-11-08 coordinated2.0.0 upgrade / 当前协调升级

Current releases: common 2.0.0, frontend 3.0.0 and backend 1.0.0; all published on npm. 2.0.0同样要求版本、语言和摘要一致；不自动升级另一个产品。

1. Back up user edits and inspect local/global/runtime identity. 备份修改，确认安装范围。
2. With each OLD product CLI, uninstall its runtime resources and resolve preserved edits until both old common consumers exit. 使用各旧 CLI 退出旧公共引用，不用新 CLI 越权接管。
3. Install both matching product builds using verified artifacts; public clean install must wait for common publication. 安装新匹配产品前执行 runtime check-migration。
4. Managed unchanged legacy language entries retire in the same transaction as new cc deployment. Unknown files, edits, links or invalid ownership block the whole install; dry-run writes nothing. 原领域入口不建立假别名。

Rename: fec-typescript-project-standard → cc-typescript-project-standard; bec-{rust,go,java,python,c,cpp}-project-standard → cc-*-project-standard; bec-{rust-async,go-concurrency,python-async,java-runtime,native-memory-safety} → cc-* equivalents. Frontend retains its earlier drawio/source-driven rename policy.

Checks return 0 (nothing found), 1 (reviewable references/owned retired entries), 2 (invalid arguments, scan failure or retirement conflict). Reports show paths, IDs and line numbers, never full source lines. No-Skill hosts receive reference material rather than a fabricated native Skill alias. 双原生产品去重仍不在保证范围。
兼容说明：bec project inspect 保留旧位置参数的任务定位语义（文件、未建文件、子目录）；显式给出 --task-path 时，位置参数才明确作为 workspace，task-path 相对于它解析。无位置参数时给工程级候选。fec 新命令直接采用 workspace 位置参数。无原生 Skill 宿主将完整 common 内容放在 backend-craft/reference-skills 私有参考目录，指南明确非原生 Skill，不生成公共消费者或第二份共享账本。

<!-- engineering-practices-20261108 -->

本轮2.0.0包含工程实践内容，仍要求两产品版本、语言和内容摘要精确一致。新内容不放宽旧消费者冲突；退出旧引用并处理保留编辑后，再安装两份匹配产品。Cline/Trae/Copilot的私有reference-skills包含新增三公共资源与本地卡，不宣称原生Skill支持，也不登记common consumer。
