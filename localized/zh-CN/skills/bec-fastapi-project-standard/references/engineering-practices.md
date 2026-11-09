---
practiceCards:
  - id: "bec-fastapi-project-standard:lifespan-ownership"
    level: "conditional"
    sourceIds: ["fastapi-lifespan","python-asyncio"]
    caseIds: ["EP-SVC-01"]
    evidence: "review-only"
  - id: "bec-fastapi-project-standard:cancellation-boundary"
    level: "conditional"
    sourceIds: ["python-asyncio","fastapi-lifespan"]
    caseIds: ["EP-SVC-01"]
    evidence: "review-only"
---

# 本入口工程决策

先定位项目角色、工具链及已有约定，再按需读取[公共原则](common/engineering-practices.md)。下列条件仅约束当前语言/场景；结构检查不证明全部语义或实际运行。

<a id="bec-fastapi-project-standard:lifespan-ownership"></a>
## 在实际lifespan拥有应用资源

级别: conditional

### 风险
导入时资源或未进入的启动逻辑会导致请求无资源或资源未关闭。

### 适用
项目FastAPI/Starlette应用级生命周期适用。

### 决策
在已配置异步上下文管理器lifespan获取/释放资源，每请求资源用适当依赖范围；测试启动关闭时以context manager进入TestClient。

### 例外
不假定裸ASGI transport启动lifespan，不混用启动机制而不核对行为，不要求升级框架。

### 正反示意
正例：请求可见已获取资源且退出恰好关闭一次。反例：只导入模块便认定启动已运行。

### 验证
运行现有FastAPI minimal生命周期配对，区分真实lifespan连线与驱动事务/生产关闭。

### 来源
fastapi-lifespan, python-asyncio — [来源与适用限制](common/engineering-practices.sources.json).

证据标识: EP-SVC-01; review-only.  执行状态及覆盖范围见实际记录；关联ID不证明该卡全部语义。

<a id="bec-fastapi-project-standard:cancellation-boundary"></a>
## 向实际所有者传播取消

级别: conditional

### 风险
协程取消时底层I/O、线程或游离任务仍可能运行。

### 适用
异步路由/依赖与自有后台任务适用。

### 决策
保留取消信号，用finally/上下文管理器释放，有界阻塞卸载和连接池等待，并依实际驱动约定在关闭时等待自有任务。

### 例外
任务取消不证明数据库命令或远端写入撤销；明确设计的共享应用任务可长于单请求。

### 正反示意
正例：定义谁停止并等待自有任务。反例：捕获取消后默默返回成功。

### 验证
取消结论须测真实驱动/任务边界，只有lifespan样例不足以证明。

### 来源
python-asyncio, fastapi-lifespan — [来源与适用限制](common/engineering-practices.sources.json).

证据标识: EP-SVC-01; review-only.  执行状态及覆盖范围见实际记录；关联ID不证明该卡全部语义。
