# 发布与安装核验门禁

当前发布状态（2026-11-09，Asia/Shanghai）：craft-common2.0.0、frontend-craft3.0.0、backend-craft1.0.0均已发布至公开npm。三仓版本号保持不变，本页不是待发布声明。

1. 从公开npm核对三个精确版本及dist.integrity。两产品公共依赖及锁文件应匹配已发布common2.0.0的真实SRI；早期准备包的摘要不能代替。
2. 使用既有供应链策略执行pnpm install --frozen-lockfile和pnpm run check:common；移除临时本地registry地址。精确版本例外不得扩展为全局跳过检查。
3. lint、类型检查、相关内容/安装/打包测试、完整产品矩阵、空缓存安装与真实宿主激活分别记录；公开发布不自动证明这些检查通过。历史日志保留原版本、工具、跳过和执行日期。
4. CLI与对应原生插件渠道择一；原生双产品发现去重不由CLI测试替代。宿主信任、刷新、激活需单独验证。
5. 以后发布使用新版本及独立授权，不覆盖已发布版本，不因本次文档更新重新上传npm包。公共发行方法见common源码仓docs/releases/2.0.0.md。
