# 工具链验收

本地版本记录见 [工具研究](../research/language-tools.md)。当前本机为 Windows、Node 24.14.0、pnpm 12.4.1，已有 Go、JDK 21、Python、GCC/G++；没有 Rust/Cargo，没有 Maven/Gradle。Java 微型工程使用真实 javac/java 显式测试入口，不把它称为 Maven/Gradle 验证。

复现：先构建，再运行 node --import tsx scripts/verify-language-fixtures.ts。脚本把工程复制到临时目录，仅通过打包 CLI 的 project inspect 和 validate 执行。对每种已具备工具的语言，先注入唯一真实缺陷并要求 test 阶段失败，再恢复源代码并要求 test 阶段通过。仅缺必需工具时标为 missing；构建错误、参数错误或其他不完整状态不能伪装成缺工具。

覆盖：Go 上下文取消、Python CancelledError 传播及 finally 清理、Java 异常下 AutoCloseable、C 错误路径文件清理、C++ 异常下 RAII；Rust 工程包含线程退出信号与通道断开，需具备 Cargo 后执行实际 RED/GREEN。

本机未安装 Cargo，因此 Rust 只证明识别与缺工具返回，不声称测试通过。六个独立语言 CI 作业已配置，Rust 固定 1.85.1、Go 1.24.13、Java 21、Python 3.12，C/C++ 使用 Ubuntu runner 已有编译器。基础 CI 使用 Windows/Linux Node22。Action 引用已通过官方仓库 git ls-remote 核验为指定完整 SHA。

尚未推送或运行远程 CI；1.0.1 公开发布前，公开源 frozen 安装会被依赖发布门槛阻断。以上均不能称为 CI GREEN。不会为通过本地验收而擅自安装系统工具链。
