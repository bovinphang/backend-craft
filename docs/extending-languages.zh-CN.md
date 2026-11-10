# 扩展语言

[English](extending-languages.md) · [文档导航](README.zh-CN.md)

新增语言时，先明确可观察行为、工程识别证据和可执行验证，再扩展内容与分发。

## 实现顺序

1. 在 craft-common 的工程证据模块增加通用清单与源码证据。将语言、框架、工程角色分别建模，沿用现有发现与推荐逻辑。
2. 需要后端验证时扩展 src/project/types.ts 的 LanguageId、配置语言枚举与兼容投影。
3. 在 src/project/languages 中增加 LanguageModule，通过 registry 注册 id、skillIds、suggest。候选命令只选择明确可用的本地入口。
4. 跨领域语言规范在 common 提供双语 cc-*-project-standard，服务框架专项在本产品提供 bec-*-project-standard 和领域参考资料。
5. 同步 metadata、relations、触发查询、双语规则与内容。按[公共同步流程](project-structure.zh-CN.md#生成内容边界)生成副本与摘要。
6. 更新语言 CI、夹具、用户指南及实际变化的分发数量契约。

## 测试与验收

- 先为最近子工程、混合仓库、歧义证据、缺工具、取消和零测试建立失败回归，再实现。
- 增加微型真实工程，使用相同 inspect / validate 入口验证缺陷版本与修复版本。
- 区分工具缺失与业务失败，保留现有六语言兼容视图及调用契约。
- 执行 lint、typecheck、内容、公共来源、构建、测试及打包检查。
- 对版本敏感行为核对相应工具的官方文档，记录验证环境与未覆盖范围。

语言候选应遵循已有离线和只读锁约定，工具准备由项目流程负责。[验证配置](validation-config.zh-CN.md)定义阶段结构与执行边界。
