# Backend Craft 1.0 验收

实现范围：27 个 bec 专业 Skill、7 个 cc 公共 Skill、8 Agents、8 Commands、双语、15 Runtime、独立清单与公共事务、只读识别和保守验证、CLI 与原生分发。

| 验证 | 已观测结果 |
|---|---|
| 后端最终完整套件 | 242 项：203 通过、39 明确跳过外部共存、0 失败；外部共存另行全部执行通过 |
| 真实 F/B 共存 | 39/39 通过，真实 F CLI，见 coexistence.md |
| common 1.0.1 | 77/77 通过，含 8 MiB 日志恢复和 Windows 大小写路径 RED→GREEN |
| 前端最终完整套件 | 最新 common 修复包下 315/315 通过，0 跳过、0 失败 |
| 分发隔离 | 4/4 通过，真实 npm tarball 解包、独立 CLI 安装/卸载及图表脚本运行；干净 marketplace 的 npm 来源含可执行 Hook |
| 完整打包 | 构建→完整测试→原生与独立包→核验退出 0，生成 36 个后端归档；另保留 common 候选及统一摘要索引 |
| 五种本地语言 | Go、Java、Python、C、C++ 均真实 test 失败→修复后通过 |
| Rust | 缺 Cargo，识别和 missing 返回已验；真实编译/测试未运行 |
| CI | Windows/Linux Node22、六语言独立作业已配置并检查 YAML；本地验收未运行远程 CI，Git 推送后的结果尚未核验 |
| 公开源安装 | common@1.0.1 注册表 HTTP 404；精确依赖的 frozen 安装尚受发布门槛阻断 |

关键回归包括：最近子项目、C/C++ 分离、歧义和扫描上限、无测试不得报通过、取消与超时子进程树、Windows 参数边界、共享文本/JSON/TOML 所有权、用户修改保留、公共摘要冲突零写入、真实进程中断 prepared/committed 恢复、目录 junction 边界。

六语言微型工程通过打包 CLI 的 inspect/validate 执行，工具替身只用于执行器调度测试，不计入语言编译通过。Java 使用真实 javac/java 显式断言，并非 Maven/Gradle 验证。CLI 结果不回显环境和参数秘密；doctor 对宿主启用状态保留 unknown。

用户批准的实施修订：common 精确版本由 1.0.0 改为 1.0.1，修复大日志恢复及 Windows 等价路径挂起。F 仅同步公共依赖、来源快照、跨平台属性、必要版本断言和迁移说明，业务安装器未修改。所有临时 tarball 路径从最终 package/lock 移除，未提交供应链例外。

公开发布 common、Rust 实际工具链验证、远程 CI 运行分别是待执行的外部门禁；没有伪称通过。实现验收时未执行 Git 提交、合并、推送或 npm 发布；用户随后已授权三个仓库提交、合并 main 并推送，集成记录见 [Git 集成](git-integration.md)。npm 发布仍未授权。

独立评审的 6 项重要问题均已在一次修复轮中按 RED→GREEN 修复，随后完整套件通过；未进行二次复审。处置详见 [评审处置](review-resolution.md)，[实施决策](decisions.md) 保留自主取舍。轻微遗留 M1：inspect 尚未返回工具状态字段，可使用 validate --dry-run 获取缺工具信息。

原始日志和逐任务账本保留在 .superpowers/sdd/2026-11-06-backend-craft。pnpm 入口因未发布精确依赖而被前置策略阻断；本地使用已安装 eslint/tsc/tsx 执行 package.json 相同检查与 pack-all 脚本，未将其冒称为公开源安装成功。
