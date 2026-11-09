# 验证契约

缺陷 rejection 分支记录业务工作并返回 200；修复后保留 JsonRejection 的 4xx，且不产生业务工作。

在本包的[案例目录](../examples/minimal/README.md)运行：

```sh
cargo test --offline --locked --features defective
cargo test --offline --locked
```



真实 Axum Router 与 Tower oneshot 请求，不代表网络服务器、数据库或压力测试。

仅当真实测试断言先失败、正常版本通过时才能记 RED→GREEN。缺工具、依赖或构建失败记 MISSING/FAIL，不冒充行为验证。数据库隔离/回滚、网络服务器、负载、容器部署均未由本例证明。产品仓库可显式用 Docker 准备环境；独立 Skill 不依赖该辅助脚本。

## 本次实际证据

2026-11-08 已在相同业务断言中观察 RED→GREEN。

```text
rustc 1.96.1 (31fca3adb 2026-06-26)
cargo 1.96.1 (356927216 2026-06-26)
axum v0.8.9
└── craft-axum-contract v0.1.0 (/work)
```

仅覆盖上表的进程内边界，不证明数据库、负载或部署。
