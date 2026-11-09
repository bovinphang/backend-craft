# 验证契约

缺陷 handler 在 AbortWithStatusJSON 后继续执行业务；修复后立即 return，非法输入副作用为零。

在本包的[案例目录](../examples/minimal/README.md)运行：

```sh
go test -mod=readonly -count=1 -v ./...
```

测试环境变量 CRAFT_EXAMPLE_DEFECTIVE=1 选择显式缺陷函数；设为 0 后同一断言必须通过。使用宿主 shell 设置，不传入应用生产启动。

真实 Gin router 与 httptest 绑定及副作用计数，不启动监听服务器或数据库。

仅当真实测试断言先失败、正常版本通过时才能记 RED→GREEN。缺工具、依赖或构建失败记 MISSING/FAIL，不冒充行为验证。数据库隔离/回滚、网络服务器、负载、容器部署均未由本例证明。产品仓库可显式用 Docker 准备环境；独立 Skill 不依赖该辅助脚本。

## 本次实际证据

2026-11-08 已在相同业务断言中观察 RED→GREEN。

```text
go version go1.25.14 linux/amd64
github.com/gin-gonic/gin v1.11.0
```

仅覆盖上表的进程内边界，不证明数据库、负载或部署。
