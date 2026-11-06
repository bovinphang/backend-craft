# 与 Frontend Craft 共存及迁移

前端专业能力使用 fec-*，后端使用 bec-*，公共能力使用 cc-*。后端只记录自身文件和共享入口内的具体条目，不能将整个 AGENTS.md、CLAUDE.md、settings.json 或 config.toml 认领为独占文件。

两产品必须使用相同 common 版本、语言及精确内容摘要；本次修复后均精确使用 1.0.1。旧 1.0.0 快照与新快照不能混装，发生冲突时安装零写入。升级顺序：

1. 备份实际用户修改，运行各产品 doctor/清单检查，确认 local/global 与 Runtime。
2. 用旧产品的 runtime uninstall 退出旧公共消费者；修改过的文件会保留，需要人工确认后重试，不使用 force 接管。
3. 依赖 1.0.1 发布后安装两产品新版本，分别执行 runtime install 或 update。用两产品 doctor 和公共 dependencies.lock.json 核对消费者。
4. 修改过的同名 cc 文件不会被新版本覆盖；确认自定义内容的去向后再重新安装。

F 3.0 原有部分共享入口按整文件管理，B 插入自己的 marker 后，F 卸载可能保守保留该文件及公共引用。先退出 B，再重试 F；这是有意保留现场，不表示完整卸载。后端不改写前端原生 .claude-plugin 元数据。

同一 Runtime 的 CLI 与原生渠道互斥；切换渠道前卸载原渠道。双原生插件的 cc 发现去重不在本期范围。真实共存复现见 [验证说明](verification/coexistence.md)。
