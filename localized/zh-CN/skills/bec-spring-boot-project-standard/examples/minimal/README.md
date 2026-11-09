# Spring Boot 最小边界案例

缺少 MVC 校验时，空名称仍返回 201 并调用服务；修复后的 @Valid controller 返回 400，写入计数保持不变。

真实 Spring 上下文、MockMvc 校验和服务调用边界，不包含数据库或监听服务器。

按[验证说明](../../references/verification.md)执行。框架依赖及工具链须由工程正常流程准备，资源已全部包含在本包，不引用相邻 Skill。缺陷开关仅用于同一测试的故障复现，正常应用使用保护版本。
