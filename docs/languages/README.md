# 六语言使用指南

先在任务根运行 bec project inspect <路径> --json，确认最近子工程，再运行 bec validate <路径> --dry-run --json。不要把一个 Monorepo 的兄弟服务合并为单语言项目。

| 语言 | 核心内容 | 默认入口与边界 |
|---|---|---|
| Rust | bec-rust-project-standard、bec-rust-async | fmt --check、clippy/test/build；locked/offline，不自动安装 rustup 组件 |
| Go | bec-go-project-standard、bec-go-concurrency | gofmt 只读、vet/test；readonly 模块与关闭代理下载；test -count=1 |
| Java | bec-java-project-standard、bec-java-runtime | 已有 Maven/Gradle 离线入口；wrapper-only 需明确准备，不隐式换全局工具 |
| Python | bec-python-project-standard、bec-python-async | 已有 pyproject 工具配置与虚拟环境；pytest/unittest 测试证据，不自动 pip 安装 |
| C | bec-c-project-standard、bec-native-memory-safety | 已配置 CMake 构建/测试；明确 C 工程，不由 CMake 文件名推断 C++ |
| C++ | bec-cpp-project-standard、bec-native-memory-safety | 已配置 CMake 构建/测试；验证 RAII、生命周期、错误和线程边界 |

现有自定义任务优先写入 .backend-craft.json，args 必须是数组，cwd 保持在工作区内。复杂 CMake preset、多个构建入口和未配置的 native 构建目录必须明确配置。Integration 默认不启用；必需阶段被跳过会返回不完整。独立报告写入 reports/backend-craft。
