---
name: bec-go-concurrency
description: "Use when 需要Go 并发生命周期，包括终止阻塞在 channel 发送的 Go worker、明确共享 Go channel 的关闭方；前端专属任务不适用。"
---

# Go 并发生命周期

列出 goroutine 创建方、停止信号、阻塞操作和等待完成方；请求返回不能证明 worker 已退出。

## 执行与证据

1. 定位实际工程、任务边界及已有契约；只加载当前需要的语言和领域资料。
2. 应用[专业检查](references/practice.md)，先核对输入证据，再决定最小改动。
3. 使用仓库已有工具验证相关行为；缺少工具、环境或实际执行时明确报告，不能把计划当通过。
4. 交付改动范围、专业决策、实际验证及剩余风险；仅评审任务保持只读。

## 任务边界

按[参考中的边界与案例](references/practice.md#scope)区分相邻能力，不扩展成未要求的框架迁移或全栈重写。
