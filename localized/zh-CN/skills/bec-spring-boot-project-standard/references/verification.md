# 验证契约

缺少 MVC 校验时，空名称仍返回 201 并调用服务；修复后的 @Valid controller 返回 400，写入计数保持不变。

在本包的[案例目录](../examples/minimal/README.md)运行：

```sh
mvn -o -Dcraft.example.defective=true test
mvn -o -Dcraft.example.defective=false test
```



真实 Spring 上下文、MockMvc 校验和服务调用边界，不包含数据库或监听服务器。

仅当真实测试断言先失败、正常版本通过时才能记 RED→GREEN。缺工具、依赖或构建失败记 MISSING/FAIL，不冒充行为验证。数据库隔离/回滚、网络服务器、负载、容器部署均未由本例证明。产品仓库可显式用 Docker 准备环境；独立 Skill 不依赖该辅助脚本。

## 本次实际证据

2026-11-08 已在相同业务断言中观察 RED→GREEN。

```text
Apache Maven 3.9.16 (2bdd9fddda4b155ebf8000e807eb73fd829a51d5)
Maven home: /usr/share/maven
Java version: 17.0.20.1, vendor: Eclipse Adoptium, runtime: /opt/java/openjdk
Default locale: en_US, platform encoding: UTF-8
OS name: "linux", version: "6.18.54.1-microsoft-standard-wsl2", arch: "amd64", family: "unix"
```

仅覆盖上表的进程内边界，不证明数据库、负载或部署。
