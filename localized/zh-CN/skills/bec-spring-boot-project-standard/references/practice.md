# Spring Boot 服务工程

1. 定位实际 Boot/JDK/BOM、Maven/Gradle wrapper、生效配置来源与组件扫描边界，不隐式升级依赖平台。

2. 使用明确的构造注入和经过校验的配置属性，将请求 DTO 校验与应用/服务及持久化契约分开。

3. MVC 输入采用匹配版本的 Jakarta 校验注解；拒绝输入应先返回客户端错误，不能产生服务/仓储副作用，须验证负向边界。

4. 事务需检查真实代理调用路径、自调用、回滚规则和一致性单元；本地事务不能原子覆盖外部 HTTP 或消息。

5. 按验证问题选择 MVC 切片或完整 Spring 上下文；MockMvc 能验证 MVC 行为，不能证明监听服务器或数据库隔离。

6. 明确启动/退出资源，限制 Actuator/配置暴露；隔离级别和真实回滚结论需在目标数据库验证。

## 版本与官方资料

2026-11-08 核验；示例目标为 Spring Boot 3.5.16 / Java 17。页面若跟随当前版本，须再次匹配项目锁；资料不授权框架升级。

- [Boot 3.5 testing](https://docs.spring.io/spring-boot/3.5/reference/testing/spring-boot-applications.html)
- [Spring transaction annotations](https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/annotations.html)
