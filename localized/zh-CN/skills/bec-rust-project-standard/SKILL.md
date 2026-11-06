---
name: bec-rust-project-standard
description: "Use when 需要Rust 工程规范，包括规划现有 Cargo workspace 的 crate 边界、审查 Rust 公共接口所有权和 Result 边界；前端专属任务不适用。"
---

# Rust 工程规范

先读 Cargo.toml、workspace 成员、edition、MSRV 与现有 alias；在所属 crate 内改动，不顺手升级整个工作区。

## 执行与证据

1. 定位实际工程、任务边界及已有契约；只加载当前需要的语言和领域资料。
2. 应用[专业检查](references/practice.md)，先核对输入证据，再决定最小改动。
3. 使用仓库已有工具验证相关行为；缺少工具、环境或实际执行时明确报告，不能把计划当通过。
4. 交付改动范围、专业决策、实际验证及剩余风险；仅评审任务保持只读。

## 任务边界

按[参考中的边界与案例](references/practice.md#scope)区分相邻能力，不扩展成未要求的框架迁移或全栈重写。
