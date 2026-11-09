---
name: bec-fastapi-project-standard
description: 用于 FastAPI 服务的 lifespan 资源、依赖作用域、请求响应模型、异步边界、依赖替换、异常映射和 ASGI 测试；没有 FastAPI 的 Python 脚本或 CLI 不属于本专项。
---

# FastAPI 服务工程

定位实际服务子工程及任务边界，按锁定版本应用框架机制；语言本身不决定服务角色。

1. 读取框架、运行时、锁及已有配置/分层，不隐式升级或替换工具链。
2. 应用[专项实践](references/practice.md)，明确路由/输入、资源所有者、失败与副作用边界。
3. 使用[最小案例](examples/minimal/README.md)及[验证清单](references/verification.md)执行同一缺陷/修复断言，缺环境不能当业务 RED。
4. 交付证据、实际测试、兼容决定及未验证项；数据库、网络、负载与部署结论单独验证。

## 工程实践

按当前任务读取[本入口工程细则](references/engineering-practices.md)，再按链接选择公共原则。规则级别与例外以实际项目契约为准；不因产品前后端标签限制语言或职责。
