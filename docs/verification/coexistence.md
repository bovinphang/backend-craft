# 真实前后端共存验收

本机于 2026-11-06 使用 F 真实 dist/bin/frontend-craft.js，基准提交 e24726dc2f62c49005eecf93afd2a168bfc5a7a8，仅将公共依赖和生成快照同步到已批准的修复版 1.0.1。未替换 F 安装、更新和卸载逻辑。

39 项全部通过：15 平台各 F→B、B→F 两顺序；Claude/Codex 另含 global/en、local/zh-CN 两顺序；额外真实语言冲突零写入。每个组合依次执行双方更新、B 先退出、B 重装、F 先退出、最后退出及 F 保守重试。逐步比对前端私有文件与后端私有文件摘要，公共消费者为两条、同名公共入口仅一份，最后未修改公共入口删除。

复现：

```sh
node --import tsx scripts/verify-coexistence.ts --frontend-root ../frontend-craft
```

前提是前端已经构建，且其 common 来源与 B 完全一致。测试以临时目录和隔离 HOME/USERPROFILE/平台配置目录运行，不接触真实用户安装。每例文件摘要记录到 reports/backend-craft/coexistence，报告不进入发布包。基础套件未提供 BEC_FRONTEND_REFERENCE 时明确跳过这组外部仓库测试；不能据此称共存已运行。

F 的整文件共享上下文被 B marker 改动时，其卸载可以保守保留；B 卸载后再重试 F。该路径已实际执行，不承诺第一次卸载无残留。文件契约不代表宿主真实启用，也不代表双原生插件可去重。中断恢复与共享锁由独立生命周期测试验证。
