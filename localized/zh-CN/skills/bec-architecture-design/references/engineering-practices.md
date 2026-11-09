---
practiceCards:
  - id: "bec-architecture-design:failure-units"
    level: "required"
    sourceIds: ["aws-retry","ms-faults"]
    caseIds: ["EP-SVC-01"]
    evidence: "review-only"
  - id: "bec-architecture-design:reversible-change"
    level: "recommended"
    sourceIds: ["google-review","ms-playbook"]
    caseIds: ["EP-SVC-01"]
    evidence: "review-only"
---

# 本入口工程决策

先定位项目角色、工具链及已有约定，再按需读取[公共原则](common/engineering-practices.md)。下列条件仅约束当前语言/场景；结构检查不证明全部语义或实际运行。

<a id="bec-architecture-design:failure-units"></a>
## 设计可观察的故障单元

级别: required

### 风险
持久副作用完成后，网络边界仍可能独立失败。

### 适用
服务跨存储、队列或远端系统时适用。

### 决策
列出不变量、实际所有者及故障/超时边界，为外部副作用安排恢复或核对路径，在适当所有者约束截止时间、准入与重试放大。

### 例外
本地库无需引入服务基础设施；队列、发件箱、熔断器须有实际故障需要。

### 正反示意
正例：把提交成功但响应丢失标为调用方待确认。反例：将所有超时视为回滚。

### 验证
在实际边界前后注入局部故障，观察副作用、结果和恢复；内存HTTP例不证明数据库或分布式原子性。

### 来源
aws-retry, ms-faults — [来源与适用限制](common/engineering-practices.sources.json).

证据标识: EP-SVC-01; review-only.  执行状态及覆盖范围见实际记录；关联ID不证明该卡全部语义。

<a id="bec-architecture-design:reversible-change"></a>
## 围绕可恢复状态分阶段改动

级别: recommended

### 风险
协调发布可能使旧消费者或不可逆数据陷入困境。

### 适用
独立部署读写方的架构迁移适用。

### 决策
优先小步兼容，明确新旧共存期、可观察发布，以及对已写数据仍有效的回退，记录决策证据。

### 例外
小型本地重构不必增加开关或双写；双写需明确一致性所有者。

### 正反示意
正例：先扩展读取方，再产生新必需表示。反例：以为回退代码能撤销破坏性数据变更。

### 验证
验证受影响旧消费者及故障恢复，说明阻止回退的数据改动。

### 来源
google-review, ms-playbook — [来源与适用限制](common/engineering-practices.sources.json).

证据标识: EP-SVC-01; review-only.  执行状态及覆盖范围见实际记录；关联ID不证明该卡全部语义。
