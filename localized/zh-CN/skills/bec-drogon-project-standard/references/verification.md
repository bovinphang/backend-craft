# 验证契约

缺陷 Filter 调用拒绝回调后仍进入 Controller 后续链；修复分支立即返回，只产生一次拒绝，Controller 写入为零。

在本包的[案例目录](../examples/minimal/README.md)运行：

```sh
cmake -S . -B build
cmake --build build
ctest --test-dir build --output-on-failure
```

测试环境变量 CRAFT_EXAMPLE_DEFECTIVE=1 选择显式缺陷函数；设为 0 后同一断言必须通过。使用宿主 shell 设置，不传入应用生产启动。

链接真实 Drogon 的进程内 Filter/Controller 回调行为，不代表网络路由、数据库或压力测试。

仅当真实测试断言先失败、正常版本通过时才能记 RED→GREEN。缺工具、依赖或构建失败记 MISSING/FAIL，不冒充行为验证。数据库隔离/回滚、网络服务器、负载、容器部署均未由本例证明。产品仓库可显式用 Docker 准备环境；独立 Skill 不依赖该辅助脚本。

## 本次实际证据

2026-11-08 已在相同业务断言中观察 RED→GREEN。

```text
cmake version 3.22.1

CMake suite maintained and supported by Kitware (kitware.com/cmake).
     _
  __| |_ __ ___   __ _  ___  _ __
 / _` | '__/ _ \ / _` |/ _ \| '_ \
| (_| | | | (_) | (_| | (_) | | | |
 \__,_|_|  \___/ \__, |\___/|_| |_|
                 |___/

A utility for drogon
Version: 1.9.14
Git commit: 3aae769cc405cf5abb9d477675c6430924f02c7c
Compilation:
  Compiler: g++-11
  Compiler ID: GNU
  Compilation flags: -O3 -DNDEBUG -std=c++17 -I/usr/local/include
Libraries:
  postgresql: yes  (pipeline mode: yes)
  mariadb: yes
  sqlite3: yes
  ssl/tls backend: OpenSSL
  brotli: no
  hiredis: yes
  c-ares: yes
  yaml-cpp: no
```

仅覆盖上表的进程内边界，不证明数据库、负载或部署。
