# Example prompts

[简体中文](example-prompts.zh-CN.md) · [Documentation](README.md)

Use these prompts in a connected assistant. Add real paths, project conventions, reproduction steps and acceptance requirements. Suggested capabilities are entry points whose selection depends on the host and task context.

| Scenario | Prompt | Related capabilities |
| --- | --- | --- |
| Architecture | Plan an order-service split within the existing architecture. Explain module boundaries, dependency direction, compatibility and verification. Propose the plan first. | `bec-architect` / `bec-architecture-design` |
| API evolution | Design a compatible order-creation API evolution. Specify error contracts, replay intent, concurrent duplicates and commit-before-response failure handling. | `bec-api-design` / `bec-transaction-management` |
| Data and caching | Review order-cache consistency with the database, including invalidation, transaction boundaries and recovery paths. | `bec-database-design` / `bec-cache-design` |
| Code review | Review current changes in services/orders for authorization, transactions, resource cleanup and test gaps. Cite file locations and evidence. | `bec-code-reviewer` / `bec-security-reviewer` |
| Diagnosis | Reproduce the goroutine leak after Go request cancellation. Verify the fix with existing tests and record unrun checks. | `bec-debugger` / `cc-go-concurrency` |
| Validation | Run bec validate . --dry-run --json first. Confirm scope and commands, then execute validation and distinguish failures, missing tools and skips. | `/bec-validate` / `bec-testing-strategy` |
| Spring Boot | Review Spring Boot transaction proxy boundaries and exception paths using existing Maven or Gradle validation entry points. | `bec-spring-boot-project-standard` |
| FastAPI | Check FastAPI request cancellation, async resource lifetime and error mapping. Reproduce problems with existing tests. | `bec-fastapi-project-standard` |
| Gin | Review context propagation and response commit boundaries in this Gin service using existing Go tests. | `bec-gin-project-standard` |
| Axum | Review Axum handler shared state, error responses and Tokio cancellation using existing Cargo commands. | `bec-axum-project-standard` |
| Drogon | Review Drogon asynchronous callback lifetimes and duplicate response paths using configured CMake/CTest workflows. | `bec-drogon-project-standard` |
| Documentation | Synchronize the service README, configuration examples and deployment notes from code. Record actual verification results. | `bec-doc-updater` / `bec-doc-sync` |

## Usage conventions

Claude Code exposes assistant commands such as `/bec-plan`, `/bec-review` and `/bec-debug`. Codex uses natural-language requests, skills and agents. See the [runtime guide](runtimes/README.md) for host-specific forms. The terminal command `bec validate` executes project checks.

Specify the whole project, a target directory or current changes when requesting review. For fixes, provide error output and expected behavior. Reports live under `reports/backend-craft/` and should distinguish passed, failed, missing and unrun checks.
