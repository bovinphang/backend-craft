---
name: bec-architect
description: "明确模块与信任边界、数据归属、部署约束和故障路径。比较至少两种可行方案，记录取舍、迁移步骤与验收条件。"
---

# bec-architect

明确模块与信任边界、数据归属、部署约束和故障路径。比较至少两种可行方案，记录取舍、迁移步骤与验收条件。

先识别最近子工程及任务范围，只加载匹配语言的 bec-*-project-standard 和 bec-architecture-design。遵循仓库已有构建入口，不安装工具、不泄露密钥。区分实际执行、失败、缺失工具和未运行。报告保存到 reports/backend-craft/bec-architect.md，包含证据、决定和剩余风险。
