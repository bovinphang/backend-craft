# 六语言使用指南

[English](README.md) · [文档导航](../README.zh-CN.md)

## 选择工程范围

```sh
bec project inspect services/api --json
bec validate services/api --dry-run --json
bec validate services/api --json
```

先确认最近子工程，再审阅执行计划。指定文件、未建文件或子目录时，inspect 保留就近任务定位语义。显式 --task-path 时，位置参数作为工作区，任务路径相对于它解析。多个兄弟服务需分别选择或通过显式配置声明。

## 语言入口与工具

| 语言 | 公共 Skill | 候选验证与边界 |
| --- | --- | --- |
| Rust | `cc-rust-project-standard`, `cc-rust-async` | fmt --check、clippy、test、build；locked/offline |
| Go | `cc-go-project-standard`, `cc-go-concurrency` | gofmt 只读、vet、test、build；readonly 模块，关闭代理下载 |
| Java | `cc-java-project-standard`, `cc-java-runtime` | 已准备的 Maven/Gradle 离线入口；有 wrapper 时需显式配置 |
| Python | `cc-python-project-standard`, `cc-python-async` | 已有 pyproject 工具与虚拟环境；pytest/unittest 证据 |
| C | `cc-c-project-standard`, `cc-native-memory-safety` | 已配置的 CMake/CTest 与明确 C 工程证据 |
| C++ | `cc-cpp-project-standard`, `cc-native-memory-safety` | 已配置的 CMake/CTest，资源生命周期与线程边界 |

这些是当前后端验证模块支持的六种语言。公共内容另外包含 TypeScript、Electron、Tauri 等能力，工程识别也可返回更广的 units 与任务推荐。

## 项目约定与准备

验证顺序为显式 .backend-craft.json、已有任务、语言候选。复杂 CMake preset、多构建入口和未配置的 native 构建目录应显式配置。Java wrapper 分发需事先准备；工具与依赖缺失应按项目约定处理。

默认候选使用离线或只读锁选项。必需阶段被跳过、缺少工具、零测试均不能算通过。集成阶段默认关闭，配置与退出码见[验证指南](../validation-config.zh-CN.md)。

## 服务框架专项

| 框架 | Skill |
| --- | --- |
| Spring Boot | `bec-spring-boot-project-standard` |
| FastAPI | `bec-fastapi-project-standard` |
| Gin | `bec-gin-project-standard` |
| Axum | `bec-axum-project-standard` |
| Drogon | `bec-drogon-project-standard` |

框架 Skill 提供领域机制和样例，验证继续使用对应语言模块及项目已有命令。真实样例的环境准备与验证边界见[工程结构](../project-structure.zh-CN.md)和[验收证据](../verification/acceptance.md)。
