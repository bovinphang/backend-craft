---
practiceCards:
  - id: "bec-axum-project-standard:rejection-contract"
    level: "conditional"
    sourceIds: ["axum-extractors","rust-api"]
    caseIds: ["EP-SVC-01"]
    evidence: "review-only"
  - id: "bec-axum-project-standard:state-lifecycle"
    level: "conditional"
    sourceIds: ["axum-extractors","tokio-join"]
    caseIds: ["EP-SVC-01"]
    evidence: "review-only"
---

# 本入口工程决策

先定位项目角色、工具链及已有约定，再按需读取[公共原则](common/engineering-practices.md)。下列条件仅约束当前语言/场景；结构检查不证明全部语义或实际运行。

<a id="bec-axum-project-standard:rejection-contract"></a>
## 保留extractor拒绝语义

级别: conditional

### 风险
提取失败可能被隐藏为成功，或验证前已产生效果。

### 适用
实际Axum/Tower路由和extractor版本适用。

### 决策
按契约排序，消费body的Json置后；明确处理JsonRejection，不把非法客户端输入转成功，效果在验证提取之后。

### 例外
拒绝不全是一种状态，遵循实际版本/错误映射和layer；handler编译不代表路由执行。

### 正反示意
正例：Router/Tower oneshot拒绝畸形输入且无效果。反例：捕获全部提取错误返回OK。

### 验证
运行现有minimal Router拒绝/成功配对，网络、数据库与部署单列。

### 来源
axum-extractors, rust-api — [来源与适用限制](common/engineering-practices.sources.json).

证据标识: EP-SVC-01; review-only.  执行状态及覆盖范围见实际记录；关联ID不证明该卡全部语义。

<a id="bec-axum-project-standard:state-lifecycle"></a>
## 明确State与派生任务所有权

级别: conditional

### 风险
共享State可能隐藏阻塞锁、无界工作或遗弃任务。

### 适用
服务状态、handler并发与优雅关闭适用。

### 决策
只共享明确所有者，缩短临界区，不持阻塞mutex guard跨await；阻塞工作有界，关闭时由所有者停止并等待派生任务。

### 例外
超时响应不证明效果停止，丢弃Tokio JoinHandle不取消任务，遵循项目运行时/版本约定。

### 正反示意
正例：取出需要数据、释放guard后await。反例：分离任务便称关闭完成。

### 验证
用实际运行时/生命周期测试验证，extractor测试不证明State清理或数据库隔离。

### 来源
axum-extractors, tokio-join — [来源与适用限制](common/engineering-practices.sources.json).

证据标识: EP-SVC-01; review-only.  执行状态及覆盖范围见实际记录；关联ID不证明该卡全部语义。
