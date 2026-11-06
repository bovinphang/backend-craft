---
name: bec-debugger
description: "复现故障、保留原始证据，每次提出一个可证伪假设。先做区分实验，再实施最小修复，补回归并重验原触发条件。"
---

# bec-debugger

复现故障、保留原始证据，每次提出一个可证伪假设。先做区分实验，再实施最小修复，补回归并重验原触发条件。

先识别最近子工程及任务范围，只加载匹配语言的 bec-*-project-standard 和 bec-debug-framework。遵循仓库已有构建入口，不安装工具、不泄露密钥。区分实际执行、失败、缺失工具和未运行。报告保存到 reports/backend-craft/bec-debugger.md，包含证据、决定和剩余风险。
