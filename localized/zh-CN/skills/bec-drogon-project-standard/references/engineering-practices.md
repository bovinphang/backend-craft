---
practiceCards:
  - id: "bec-drogon-project-standard:filter-continuation"
    level: "conditional"
    sourceIds: ["drogon-filters","cpp-core"]
    caseIds: ["EP-SVC-01"]
    evidence: "review-only"
  - id: "bec-drogon-project-standard:callback-lifetime"
    level: "conditional"
    sourceIds: ["drogon-filters","cpp-core"]
    caseIds: ["EP-SVC-01"]
    evidence: "review-only"
---

# 本入口工程决策

先定位项目角色、工具链及已有约定，再按需读取[公共原则](common/engineering-practices.md)。下列条件仅约束当前语言/场景；结构检查不证明全部语义或实际运行。

<a id="bec-drogon-project-standard:filter-continuation"></a>
## Filter只完成一个分支一次

级别: conditional

### 风险
Filter拒绝后再调用continuation仍可能执行Controller。

### 适用
项目使用回调式Drogon Filter API时适用。

### 决策
拒绝时调用拒绝回调一次并return，仅允许分支调用链回调，验证Controller实际可达性和响应次数。

### 例外
minimal样例合成角色头不是鉴权；匹配实际Filter/Middleware或协程API，不能互换。

### 正反示意
正例：拒绝只响应一次且Controller效果为零。反例：拒绝后仍调用fccb。

### 验证
运行现有链接Drogon的契约可执行文件，区分进程内Filter/Controller与监听HTTP、生产鉴权。

### 来源
drogon-filters, cpp-core — [来源与适用限制](common/engineering-practices.sources.json).

证据标识: EP-SVC-01; review-only.  执行状态及覆盖范围见实际记录；关联ID不证明该卡全部语义。

<a id="bec-drogon-project-standard:callback-lifetime"></a>
## 回调完成前保持捕获对象有效

级别: conditional

### 风险
借用栈捕获或竞争完成路径可能造成生命期错误/重复响应。

### 适用
Drogon异步请求、客户端、ORM回调适用。

### 决策
捕获有意拥有对象或安全值，确保成功/失败/超时只完成一次响应，事务句柄存活覆盖实际异步单元，阻塞工作移出事件循环。

### 例外
回调语法不代表非阻塞或支持取消；本地Filter测试不证明异步ORM事务或网络关闭。

### 正反示意
正例：明确所有者存活至完成。反例：handler返回后借用栈局部变量。

### 验证
改动异步路径须用实际库/驱动及可用生命期/并发工具验证，数据库/关闭未运行需注明。

### 来源
drogon-filters, cpp-core — [来源与适用限制](common/engineering-practices.sources.json).

证据标识: EP-SVC-01; review-only.  执行状态及覆盖范围见实际记录；关联ID不证明该卡全部语义。
