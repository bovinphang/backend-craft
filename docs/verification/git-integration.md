# Git 集成

2026-11-06，用户授权将本次全部实现改动分别提交到三个 Git 仓库，合并到各自 main 并推送 origin。作者与提交者均使用现有配置 bovinphang <bovin.phang@gmail.com>。

| 仓库 | 来源分支 | 提交内容 |
|---|---|---|
| craft-common | fix/transaction-recovery-1.0.1 | 1.0.1 日志恢复、Windows 等价路径、公共文本换行及回归测试 |
| frontend-craft | fix/common-1.0.1-coexistence | 精确 common 1.0.1 依赖、公共快照与迁移说明 |
| backend-craft | feature/backend-craft-v1 | 六语言后端插件、Runtime 适配、分发、验证及文档 |

集成采用各仓库独立提交，再快进合并到 main，最后正常推送；不改写已有历史。提交前重新执行各仓库 lint、类型检查和完整测试，并检查公共快照一致性。原始独立评审及语言验收 JSON 作为证据随源码提交，临时日志、node_modules、构建目录及候选压缩包留在本地忽略目录。

本轮提交前实测：common 77/77、frontend 315/315；backend 242 项中 203 通过、39 项外部共存按条件跳过、0 失败。39 项真实共存此前已独立全部通过，详见验收报告。三仓 lint、类型检查通过，前后端内容与公共快照检查通过。快进合并不改变已经验证的 Git 树内容。

公共依赖 1.0.1 尚未公开发布，因此检查使用已安装本地修复包，调用 package.json 原脚本对应的 eslint、tsc、tsx；没有放宽 pnpm 供应链策略，标准 package/lock 不保留临时来源。Git 推送不等于 npm 发布；公开源安装、Rust 真实工具链验收、远程 CI 结果仍需分别核验。
