# FastAPI 服务工程

1. 先读取实际 FastAPI、Starlette、Pydantic、Python 版本、环境锁、应用工厂和 router 归属。

2. 应用资源放在 lifespan，请求资源使用匹配作用域的依赖；先获取再使用，正常、异常和取消路径均须释放。

3. 明确请求/响应契约，避免序列化持久化私有字段；测试结束要恢复依赖替换。

4. 异步处理不应混入阻塞工作；限制线程转移、池等待和后台任务，取消协程不一定停止底层操作。

5. 测试必须真实进入 lifespan。TestClient 上下文负责启动/退出，单独使用 ASGI transport 不证明资源初始化。

6. 驱动取消、事务和退出结论需要真实基础设施测试；本地资源案例只证明 FastAPI 生命周期接线。

## 版本与官方资料

2026-11-08 核验；示例目标为 FastAPI 0.141.1 / Python 3.14.7 / httpx 0.28.1。页面若跟随当前版本，须再次匹配项目锁；资料不授权框架升级。

- [Lifespan](https://fastapi.tiangolo.com/advanced/events/)
- [Testing lifespan](https://fastapi.tiangolo.com/advanced/testing-events/)
