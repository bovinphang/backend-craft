# 扩展语言

新增语言先定义可观察验收行为，验证识别、命令范围及真实工具链，再增加内容。不要复制六套语言判断到安装器。

1. 在 project/types.ts 的 LanguageId 和 project/evidence.ts 的清单/源码数据表增加语言证据，并同步 config.ts 的配置语言枚举；不以通用构建文件猜测语言。
2. 在 project/languages 增加 LanguageModule，声明 id、skillIds、suggest。由 registry 统一注册；suggest 只建议明确可用的本地入口，不下载工具，不默认执行 wrapper。
3. 提供双语 bec-*-project-standard 和完整 references；按能力增加专项，避免仅替换语言名称。同步 metadata、relations 与正反触发查询。
4. 先写最近子工程、混合仓库、歧义、缺工具、取消与零测试回归，实际观察 RED，再实现 GREEN。
5. 增加真实微型工程，通过相同 bec project inspect / bec validate 验证一个真实缺陷版本和修复版本。缺少编译器只能记为 missing，不能算业务 RED。
6. 更新语言 CI、规则 globs、文档和分发数量契约。Runtime 适配器使用产品目录，不增加语言专用安装 switch。

显式验证 schema 与边界见 [验证配置](validation-config.md)。新的外部工具或版本敏感行为应核验项目对应的官方文档。
