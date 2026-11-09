# Drogon 最小边界案例

缺陷 Filter 调用拒绝回调后仍进入 Controller 后续链；修复分支立即返回，只产生一次拒绝，Controller 写入为零。

链接真实 Drogon 的进程内 Filter/Controller 回调行为，不代表网络路由、数据库或压力测试。

按[验证说明](../../references/verification.md)执行。框架依赖及工具链须由工程正常流程准备，资源已全部包含在本包，不引用相邻 Skill。缺陷开关仅用于同一测试的故障复现，正常应用使用保护版本。

示例的 X-Craft-Role 是测试后续链的合成门控，不能作为真实鉴权方案；实际身份和权限必须来自已验证的服务端上下文。
