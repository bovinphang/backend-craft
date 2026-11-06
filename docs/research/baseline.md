# backend-craft 实施基线

日期：2026-11-06。设计与计划已批准，实施分支 feature/backend-craft-v1。

- B 初始提交 eea827f，仅 LICENSE，无可运行产品基线。
- F 参考提交 e24726dc2f62c49005eecf93afd2a168bfc5a7a8；C 参考提交 0b8ee39ca7ec590477f7fca0178f60b28b590e85。
- 工具链遵循 F：TypeScript、Node >=22、pnpm 12.4.1、ESM、esbuild、ESLint、node:test。测试发现脚本复用 F 的既有实现，保留 MIT 许可证来源，不引入第二套测试框架。
- 公开源 common 1.0.0 已读取并安装；完整性由 pnpm-lock.yaml 锁定。公开发布时间为 2026-11-05T15:43:48.859Z。
- 实际 API 包含内容目录、资源收集、方法读取、共享计划与事务恢复。内容摘要与 F 旧开发快照不一致，仅技术图三个资源的双语换行不同：interactive-diagram.html、sequence.mmd、workflow.mmd；将 CRLF 归一为 LF 后内容相等。共存仍坚持精确字节摘要检查。
- 为实现真实共存，需要在后续共存任务同步 F 的生成公共资源及依赖锁到正式发布包；不修改 F 专业内容或业务逻辑，不重写 common 的已发布版本。
- YAML 2.9.0 沿用 F 已使用的解析器，用于严格 frontmatter；其他格式解析依赖仅在确实需要时核验并引入。
- 包 registry、实际依赖和来源以 package.json / pnpm-lock.yaml 为准；不依赖相邻源码目录作为正式运行依赖。不会把包可下载当作双产品兼容证明。
