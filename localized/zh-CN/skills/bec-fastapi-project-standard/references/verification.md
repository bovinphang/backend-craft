# 验证契约

缺陷 lifespan 未初始化资源，请求得到 503 而非 200；修复后在 yield 前初始化，在 finally 中关闭，失败请求结束后也会关闭。

在本包的[案例目录](../examples/minimal/README.md)运行：

```sh
python -m unittest -v test_lifespan.py
```

测试环境变量 CRAFT_EXAMPLE_DEFECTIVE=1 选择显式缺陷函数；设为 0 后同一断言必须通过。使用宿主 shell 设置，不传入应用生产启动。

真实 TestClient 生命周期及请求行为；资源为本地对象，不代表数据库连接池。

仅当真实测试断言先失败、正常版本通过时才能记 RED→GREEN。缺工具、依赖或构建失败记 MISSING/FAIL，不冒充行为验证。数据库隔离/回滚、网络服务器、负载、容器部署均未由本例证明。产品仓库可显式用 Docker 准备环境；独立 Skill 不依赖该辅助脚本。

## 本次实际证据

2026-11-08 已在相同业务断言中观察 RED→GREEN。

```text
Python 3.14.7; FastAPI 0.141.1; Starlette 1.6.0; httpx 0.28.1
```

仅覆盖上表的进程内边界，不证明数据库、负载或部署。
