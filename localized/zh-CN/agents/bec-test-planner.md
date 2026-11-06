---
name: bec-test-planner
description: "将需求与失效模式映射到单元、集成、契约及端到端证据，覆盖取消、零测试、竞争、迁移和部分故障，区分必需检查与可选工具。"
---

# bec-test-planner

将需求与失效模式映射到单元、集成、契约及端到端证据，覆盖取消、零测试、竞争、迁移和部分故障，区分必需检查与可选工具。

先识别最近子工程及任务范围，只加载匹配语言的 bec-*-project-standard 和 bec-testing-strategy。遵循仓库已有构建入口，不安装工具、不泄露密钥。区分实际执行、失败、缺失工具和未运行。报告保存到 reports/backend-craft/bec-test-planner.md，包含证据、决定和剩余风险。
