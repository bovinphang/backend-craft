# Drogon 服务工程

1. 读取实际 Drogon/Trantor/编译器版本、CMake target 和 Controller/Filter 注册，将纯 C++ 库约定与服务机制区分。

2. 拒绝请求的 Filter 只能调用一次拒绝回调，并立即 return，不能再调用后续链；同时检查响应次数和真实 Controller 是否执行。

3. 回调捕获及请求/响应资源必须存活到完成，异步回调不借用已退出栈变量，超时/错误路径不能重复完成。

4. 事件循环线程不执行阻塞工作；按实际驱动选择异步 ORM/client API，明确取消和背压，不假定回调天然非阻塞。

5. 事务对象必须覆盖真实异步一致性单元；提交/回滚须用目标数据库验证，回调单测不能证明持久化保证。

6. 复用 Drogon 测试机制或链接真实库的进程内契约程序，再分别验证 HTTP 路由、退出、动态库链接和部署。

## 版本与官方资料

2026-11-08 核验；示例目标为 Drogon 1.9 API / C++17; actual container version in evidence。页面若跟随当前版本，须再次匹配项目锁；资料不授权框架升级。

- [Filter and middleware](https://github.com/drogonframework/drogon/wiki/ENG-05-Middleware-and-Filter)
- [Testing framework](https://github.com/drogonframework/drogon/wiki/ENG-19-Testing-Framework)
