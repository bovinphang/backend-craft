# Six-language guide

[简体中文](README.zh-CN.md) · [Documentation](../README.md)

## Select the project scope

```sh
bec project inspect services/api --json
bec validate services/api --dry-run --json
bec validate services/api --json
```

Confirm the nearest project and review its validation plan. A file, missing file or subdirectory positional target retains nearest-task discovery semantics. With explicit --task-path, the positional argument is the workspace and the task path is relative to it. Select sibling services separately or declare them through explicit configuration.

## Language entry points and tools

| Language | Common skills | Candidate validation and boundaries |
| --- | --- | --- |
| Rust | `cc-rust-project-standard`, `cc-rust-async` | fmt --check, clippy, test and build with locked/offline settings |
| Go | `cc-go-project-standard`, `cc-go-concurrency` | Read-only gofmt, vet, test and build with readonly modules and downloads disabled |
| Java | `cc-java-project-standard`, `cc-java-runtime` | Prepared offline Maven/Gradle tasks; explicit configuration when wrappers are present |
| Python | `cc-python-project-standard`, `cc-python-async` | Existing pyproject tools and virtual environment; pytest/unittest evidence |
| C | `cc-c-project-standard`, `cc-native-memory-safety` | Configured CMake/CTest and explicit C project evidence |
| C++ | `cc-cpp-project-standard`, `cc-native-memory-safety` | Configured CMake/CTest, resource lifetimes and thread boundaries |

These six languages are supported by backend validation modules. Common content additionally includes TypeScript, Electron and Tauri, and inspection can return broader units and task recommendations.

## Project conventions and preparation

Validation prefers explicit .backend-craft.json, then existing tasks, then language candidates. Configure complex CMake presets, multiple build entry points and unconfigured native build directories explicitly. Prepare Java wrapper distributions in advance and resolve missing tools and dependencies through project conventions.

Default candidates use offline or read-only lock options. Skipped required stages, missing tools and zero tests prevent a passing result. Integration stages are disabled by default. See [validation configuration](../validation-config.md) for configuration and exit codes.

## Service framework specialties

| Framework | Skill |
| --- | --- |
| Spring Boot | `bec-spring-boot-project-standard` |
| FastAPI | `bec-fastapi-project-standard` |
| Gin | `bec-gin-project-standard` |
| Axum | `bec-axum-project-standard` |
| Drogon | `bec-drogon-project-standard` |

Framework skills provide domain mechanisms and examples. Validation continues through the language modules and existing project commands. See [project structure](../project-structure.md) and [acceptance evidence](../verification/acceptance.md) for preparation and verified boundaries.
