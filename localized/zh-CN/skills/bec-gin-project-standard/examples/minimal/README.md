# Gin 最小边界案例

缺陷 handler 在 AbortWithStatusJSON 后继续执行业务；修复后立即 return，非法输入副作用为零。

真实 Gin router 与 httptest 绑定及副作用计数，不启动监听服务器或数据库。

按[验证说明](../../references/verification.md)执行。框架依赖及工具链须由工程正常流程准备，资源已全部包含在本包，不引用相邻 Skill。缺陷开关仅用于同一测试的故障复现，正常应用使用保护版本。
