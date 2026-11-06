# 语言工具核验

核验日期：2026-11-06；默认复用已有工具，不安装编译器、依赖或 wrapper 分发。项目自身构建代码仍可能产生副作用，离线参数不等于操作系统沙箱。

| 来源 | 核验与实现决策 |
| --- | --- |
| [Cargo test](https://doc.rust-lang.org/cargo/commands/cargo-test.html) | --offline 阻止 Cargo 联网；--locked 防止锁变更，缺少锁需先由用户准备；fmt 仅 --check |
| [rustup 环境变量](https://rust-lang.github.io/rustup/environment-variables.html) | RUSTUP_AUTO_INSTALL=0 阻止自动安装项目要求的缺失工具链 |
| [Go command](https://pkg.go.dev/cmd/go)、[toolchain](https://go.dev/doc/toolchain)、[gofmt](https://pkg.go.dev/cmd/gofmt) | GOTOOLCHAIN=local、GOPROXY=off、GOSUMDB=off；测试 -json -count=1，模块只读；gofmt -l 不写文件，但非空输出仍须判为格式失败 |
| [Maven CLI 3.9.9](https://maven.apache.org/ref/3.9.9/maven-embedder/cli.html) | -o 离线、-B 非交互；项目有 wrapper 时不擅自换全局 Maven 或启动下载，需要明确本地准备与项目配置 |
| [Gradle CLI](https://docs.gradle.org/current/userguide/command_line_interface.html) | --offline --no-daemon；存在项目 wrapper 时同样要求明确准备，不以 --offline 推断 wrapper 不会下载分发 |
| [Python unittest](https://docs.python.org/3/library/unittest.html)、[Ruff formatter](https://docs.astral.sh/ruff/formatter/) | pytest/mypy/Ruff 依据已声明配置；unittest 仅作为已有 tests 的候选，零测试不是成功；Python build --no-isolation，不调用 pip |
| [CMake presets](https://cmake.org/cmake/help/latest/manual/cmake-presets.7.html) | 仅读已有本地 preset；需要已配置 CMakeCache；复杂 include/inheritance/环境宏交由明确配置，不猜测构建目录；ctest 无测试报错 |
| [smol-toml](https://github.com/squirrelchat/smol-toml) | 固定 1.9.1，严格解析 pyproject.toml，后续可复用结构化 TOML 配置能力；包声明 Node >=18，满足产品 Node >=22 |

本机实际版本：Node 24.14.0、pnpm 12.4.1、Go 1.27.1、JDK 21.0.12.1、Python 3.14.3、CMake 4.4.1、GCC/G++ 16.1.0。PATH 未发现 Cargo/Rust、Maven/Gradle；不声称这些工具链已运行。

工具版本探测仅运行受限版本参数，在系统临时目录执行，排除工作区内可执行文件；不执行项目 wrapper 来做只读发现。Windows 批处理工具的版本启用需要独立 launcher 验证，不在此伪装为已探测成功。
