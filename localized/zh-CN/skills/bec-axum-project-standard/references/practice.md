# Axum 服务工程

1. 确认 Axum/Tower/Tokio 版本、真实依赖键、路由模块、State 和 layer 位置，不凭 Rust 语言推断服务。

2. 明确提取顺序及所有权，消耗 body 的 extractor 遵循框架契约；客户端错误保持 4xx，不能转换成业务成功。

3. State 保持小而明确，只共享有意的资源所有者，不跨 await 持有阻塞锁，不在 handler 无界阻塞。

4. 按实际栈核对请求/body 限制、超时及中间件顺序；超时响应不等于底层副作用已停止。

5. 使用 Tower oneshot 调用真实 Router，验证拒绝/成功行为及副作用；编译通过不证明路由或数据库事务有效。

6. 明确后台任务及优雅退出归属，网络、数据库和负载结论分别进行真实验证。

## 版本与官方资料

2026-11-08 核验；示例目标为 Axum 0.8.9 / Rust 1.96 container。页面若跟随当前版本，须再次匹配项目锁；资料不授权框架升级。

- [Axum extractors](https://docs.rs/axum/0.8.9/axum/extract/)
- [JsonRejection](https://docs.rs/axum/0.8.9/axum/extract/rejection/enum.JsonRejection.html)
