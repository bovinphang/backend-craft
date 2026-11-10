# 示例提示词

[English](example-prompts.md) · [文档导航](README.zh-CN.md)

在已接入的助手中使用以下提示词，并补充实际目录、现有约定、复现步骤和验收要求。表中的能力为预期入口，实际选择取决于宿主和任务上下文。

| 场景 | 提示词 | 相关能力 |
| --- | --- | --- |
| 架构规划 | 按照现有架构规划订单服务拆分，说明模块边界、依赖方向、兼容性和验证步骤，先提交方案。 | `bec-architect` / `bec-architecture-design` |
| API 演进 | 设计订单创建 API 的兼容演进，明确错误契约、幂等意图、并发重复和提交后响应失败的处理。 | `bec-api-design` / `bec-transaction-management` |
| 数据与缓存 | 评审订单缓存与数据库的一致性，分析失效策略、事务边界及恢复路径。 | `bec-database-design` / `bec-cache-design` |
| 代码评审 | 评审 services/orders 的当前变更，关注授权、事务、资源释放和测试缺口，给出文件位置与证据。 | `bec-code-reviewer` / `bec-security-reviewer` |
| 故障诊断 | 根据复现步骤诊断 Go 请求取消后的 goroutine 泄漏，用现有测试验证修复并记录未执行检查。 | `bec-debugger` / `cc-go-concurrency` |
| 工程验证 | 先执行 bec validate . --dry-run --json，确认项目范围和命令，再执行验证并区分失败、缺工具和跳过。 | `/bec-validate` / `bec-testing-strategy` |
| Spring Boot | 评审 Spring Boot 事务代理边界和异常路径，沿用已有 Maven 或 Gradle 入口验证。 | `bec-spring-boot-project-standard` |
| FastAPI | 检查 FastAPI 请求取消、异步资源生命周期和错误映射，使用已有测试复现问题。 | `bec-fastapi-project-standard` |
| Gin | 检查 Gin 服务的 context 传播和响应提交边界，使用现有 Go 测试验证。 | `bec-gin-project-standard` |
| Axum | 检查 Axum handler 的共享状态、错误响应及 Tokio 取消路径，复用现有 Cargo 命令。 | `bec-axum-project-standard` |
| Drogon | 检查 Drogon 异步回调生命周期与重复响应路径，沿用当前 CMake/CTest 配置。 | `bec-drogon-project-standard` |
| 文档维护 | 根据代码同步此服务的 README、配置示例和部署说明，逐项记录验证结果。 | `bec-doc-updater` / `bec-doc-sync` |

## 使用约定

Claude Code 可使用 `/bec-plan`、`/bec-review`、`/bec-debug` 等助手命令。Codex 使用自然语言、Skill 与 Agent，具体形式见 [Runtime 指南](runtimes/README.zh-CN.md)。终端命令 `bec validate` 用于执行项目检查。

请求评审时明确整个项目、指定目录或当前变更；请求修复时提供错误输出与预期行为。报告位于 `reports/backend-craft/`，应区分已通过、失败、缺失和未执行的验证。
