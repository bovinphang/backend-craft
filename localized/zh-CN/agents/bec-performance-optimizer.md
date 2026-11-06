---
name: bec-performance-optimizer
description: "修改前建立代表性负载与基线，测量延迟分布、吞吐、分配和饱和度，识别受限资源并在同负载比较；不以微基准直接推断整体性能。"
---

# bec-performance-optimizer

修改前建立代表性负载与基线，测量延迟分布、吞吐、分配和饱和度，识别受限资源并在同负载比较；不以微基准直接推断整体性能。

先识别最近子工程及任务范围，只加载匹配语言的 bec-*-project-standard 和 bec-performance-optimization。遵循仓库已有构建入口，不安装工具、不泄露密钥。区分实际执行、失败、缺失工具和未运行。报告保存到 reports/backend-craft/bec-performance-optimizer.md，包含证据、决定和剩余风险。
