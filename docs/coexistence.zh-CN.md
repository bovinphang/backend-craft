# 与 Frontend Craft 共存及迁移

[English](coexistence.md) · [文档导航](README.zh-CN.md)

## 公共资源契约

后端专业内容使用 bec-*，前端使用 fec-*，公共工程能力使用 cc-*。当前源码精确依赖 craft-common 2.1.0。通过 npm 安装或从源码构建的步骤见[安装](../README.zh-CN.md#安装)。

CLI 按 common 版本、语言与内容摘要共享资源。共存的产品必须精确匹配这三项；冲突会阻止安装。后端使用独立 backend-craft.manifest.json，并按共享文件内的条目跟踪所有权。

Copilot、Trae、Cline 使用私有 reference-skills 资料目录，其资源通过本产品清单管理。

## 协调升级步骤

1. 记录现有 Runtime、local/global 范围和语言，备份用户编辑，用旧产品 CLI 检查安装状态。
2. 执行各旧产品的 runtime uninstall 退出旧公共消费者，处理保留的用户编辑后重试。部分卸载仍可能保留公共引用。
3. 使用来源已验证、common 版本与语言一致的两份产品构建。安装前执行迁移检查。
4. 分别安装两产品资源，用各自 doctor 以及共享 dependencies.lock.json 检查消费者。
5. 在宿主中刷新资源并确认实际发现与启用。

```sh
bec runtime check-migration codex --local --json
bec runtime install codex --local --lang zh-CN --dry-run --json
bec doctor codex --local --json
```

从 common 2.0.0 升级到 2.1.0 需要旧消费者先退出。仅升级一个产品可能使 CLI 已更新而资源刷新报告冲突，按上述步骤处理后重试。

## 旧 Skill 名称迁移

| 旧入口 | 当前入口 |
| --- | --- |
| bec-{rust,go,java,python,c,cpp}-project-standard | cc-{rust,go,java,python,c,cpp}-project-standard |
| bec-rust-async | cc-rust-async |
| bec-go-concurrency | cc-go-concurrency |
| bec-java-runtime | cc-java-runtime |
| bec-python-async | cc-python-async |
| bec-native-memory-safety | cc-native-memory-safety |

仅未修改、所有权有效的旧入口可在共享事务中退役。编辑、未知文件、链接或无效所有权会阻止整批安装。迁移检查退出码为 0（未发现项）、1（需审阅的引用或托管旧入口）、2（参数、扫描或退役冲突）。

## 文件与渠道保护

被用户修改和未知的文件会保留。共享文本只管理本产品条目，其他产品资源保留其所有权。--force 仅适用于本产品私有文件的资源卸载。

原前端按整文件管理的共享入口在后端插入 marker 后可能被保守保留；先退出后端，再用原前端 CLI 重试。CLI 与原生渠道切换时先卸载旧渠道。原生包交付单产品完整资源，双原生插件共存需单独核验。

[历史共存验证](verification/coexistence.md)记录当时环境与版本。
