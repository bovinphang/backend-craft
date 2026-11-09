---
practiceCards:
  - id: "bec-database-design:migration-compatibility"
    level: "required"
    sourceIds: ["google-review","ms-playbook"]
    caseIds: ["EP-SVC-01"]
    evidence: "review-only"
  - id: "bec-database-design:query-bounds"
    level: "recommended"
    sourceIds: ["aws-retry","ms-playbook"]
    caseIds: ["EP-SVC-01"]
    evidence: "review-only"
---

# 本入口工程决策

先定位项目角色、工具链及已有约定，再按需读取[公共原则](common/engineering-practices.md)。下列条件仅约束当前语言/场景；结构检查不证明全部语义或实际运行。

<a id="bec-database-design:migration-compatibility"></a>
## 迁移兼容已部署读取方

级别: required

### 风险
删除或重释schema可能破坏仍运行的旧代码。

### 适用
持久表示变更和独立部署客户端适用。

### 决策
沿用实际引擎/迁移约定，必要时分扩展、有界回填、收缩；用真实存储验证约束、新旧读写和恢复。

### 例外
不强制统一迁移框架或事务语法；内存HTTP map不证明schema、锁或回滚语义。

### 正反示意
正例：度量回填并验证后再删旧列。反例：代码可回退就称破坏性迁移可逆。

### 验证
运行相关引擎集成和恢复检查，记录锁、数据量及未测引擎/版本。

### 来源
google-review, ms-playbook — [来源与适用限制](common/engineering-practices.sources.json).

证据标识: EP-SVC-01; review-only.  执行状态及覆盖范围见实际记录；关联ID不证明该卡全部语义。

<a id="bec-database-design:query-bounds"></a>
## 按实际访问模式约束查询

级别: recommended

### 风险
无界工作会在重试下放大负载和超时。

### 适用
查询接口与后台数据处理适用。

### 决策
按项目约束分页、稳定排序、批量/超时和取消所有者；有证据的热点检查实际查询计划与索引。

### 例外
不强制统一页大小或索引数量；内存基准不代表数据库性能。

### 正反示意
正例：带截止时间的有界索引查询。反例：取全量再在UI分页。

### 验证
用真实引擎/代表数据验证边界与计划，另测取消和预算耗尽。

### 来源
aws-retry, ms-playbook — [来源与适用限制](common/engineering-practices.sources.json).

证据标识: EP-SVC-01; review-only.  执行状态及覆盖范围见实际记录；关联ID不证明该卡全部语义。
