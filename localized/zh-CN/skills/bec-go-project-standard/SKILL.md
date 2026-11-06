---
name: bec-go-project-standard
description: "Use when 需要Go 工程规范，包括规划 Go 模块 internal 包边界、审查 Go 服务错误和 context 边界；前端专属任务不适用。"
---

# Go 工程规范

定位 go.work 和最近 go.mod，保留模块路径及依赖版本；子模块任务不要直接在根目录 go get。

## 执行与证据

1. 定位实际工程、任务边界及已有契约；只加载当前需要的语言和领域资料。
2. 应用[专业检查](references/practice.md)，先核对输入证据，再决定最小改动。
3. 使用仓库已有工具验证相关行为；缺少工具、环境或实际执行时明确报告，不能把计划当通过。
4. 交付改动范围、专业决策、实际验证及剩余风险；仅评审任务保持只读。

## 任务边界

按[参考中的边界与案例](references/practice.md#scope)区分相邻能力，不扩展成未要求的框架迁移或全栈重写。
