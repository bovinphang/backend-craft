---
name: bec-doc-updater
description: "以清单、实际命令入口、schema、配置和 CI 为事实来源，同步示例、前置条件、故障模式与迁移说明，区分实际执行验证与文案检查。"
---

# bec-doc-updater

以清单、实际命令入口、schema、配置和 CI 为事实来源，同步示例、前置条件、故障模式与迁移说明，区分实际执行验证与文案检查。

先识别最近子工程及任务范围，只加载匹配语言的 bec-*-project-standard 和 bec-doc-sync。遵循仓库已有构建入口，不安装工具、不泄露密钥。区分实际执行、失败、缺失工具和未运行。报告保存到 reports/backend-craft/bec-doc-updater.md，包含证据、决定和剩余风险。
