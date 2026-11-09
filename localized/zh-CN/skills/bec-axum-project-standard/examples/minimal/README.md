# Axum 最小边界案例

缺陷 rejection 分支记录业务工作并返回 200；修复后保留 JsonRejection 的 4xx，且不产生业务工作。

真实 Axum Router 与 Tower oneshot 请求，不代表网络服务器、数据库或压力测试。

按[验证说明](../../references/verification.md)执行。框架依赖及工具链须由工程正常流程准备，资源已全部包含在本包，不引用相邻 Skill。缺陷开关仅用于同一测试的故障复现，正常应用使用保护版本。
