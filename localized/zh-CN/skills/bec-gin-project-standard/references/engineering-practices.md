---
practiceCards:
  - id: "bec-gin-project-standard:abort-return"
    level: "conditional"
    sourceIds: ["gin-binding","go-context"]
    caseIds: ["EP-SVC-01"]
    evidence: "review-only"
  - id: "bec-gin-project-standard:context-lifecycle"
    level: "conditional"
    sourceIds: ["go-context","gin-binding"]
    caseIds: ["EP-SVC-01"]
    evidence: "review-only"
---

# 本入口工程决策

先定位项目角色、工具链及已有约定，再按需读取[公共原则](common/engineering-practices.md)。下列条件仅约束当前语言/场景；结构检查不证明全部语义或实际运行。

<a id="bec-gin-project-standard:abort-return"></a>
## 拒绝输入后停止当前handler

级别: conditional

### 风险
Abort停止待执行handler，但不会从当前函数返回。

### 适用
Gin中间件/handler拒绝输入时适用。

### 决策
明确选择Bind/ShouldBind；处理ShouldBindJSON错误后写拒绝响应，必要时Abort，并在服务效果或第二次响应前return。

### 例外
不假定binder完成领域授权；尊重当前路由/中间件顺序和版本。

### 正反示意
正例：拒绝后明确return且效果为零。反例：AbortWithStatus后继续写入。

### 验证
通过httptest执行实际Gin路由，观察合法/非法效果；EP-SVC-01是独立标准库HTTP案例。

### 来源
gin-binding, go-context — [来源与适用限制](common/engineering-practices.sources.json).

证据标识: EP-SVC-01; review-only.  执行状态及覆盖范围见实际记录；关联ID不证明该卡全部语义。

<a id="bec-gin-project-standard:context-lifecycle"></a>
## 请求上下文限于有效生命期

级别: conditional

### 风险
Gin复用请求上下文，长寿命goroutine可能读取失效或竞争状态。

### 适用
Gin handler启动异步工作时适用。

### 决策
复制所需不可变值，请求自有任务传播Request.Context截止时间，独立后台工作另有有界所有者；c.Copy仅按其只读约定使用。

### 例外
复制context不延长响应writer安全期，也不证明外部工作停止；不在goroutine保留原*gin.Context。

### 正反示意
正例：向自有任务传ID和context.Context。反例：捕获c并在返回后写响应。

### 验证
实际并发/关闭测试验证goroutine退出，支持时用race工具；路由拒绝测试不证明生命期。

### 来源
go-context, gin-binding — [来源与适用限制](common/engineering-practices.sources.json).

证据标识: EP-SVC-01; review-only.  执行状态及覆盖范围见实际记录；关联ID不证明该卡全部语义。
