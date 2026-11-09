---
practiceCards:
  - id: "bec-transaction-management:commit-ambiguity"
    level: "required"
    sourceIds: ["aws-idempotency","aws-retry"]
    caseIds: ["EP-SVC-01"]
    evidence: "review-only"
  - id: "bec-transaction-management:replay-boundaries"
    level: "required"
    sourceIds: ["aws-idempotency","ms-faults"]
    caseIds: ["EP-SVC-01"]
    evidence: "review-only"
---

# 本入口工程决策

先定位项目角色、工具链及已有约定，再按需读取[公共原则](common/engineering-practices.md)。下列条件仅约束当前语言/场景；结构检查不证明全部语义或实际运行。

<a id="bec-transaction-management:commit-ambiguity"></a>
## 响应丢失后保留提交不确定性

级别: required

### 风险
调用方超时可能发生在成功提交之后。

### 适用
跨响应/确认边界的状态变更适用。

### 决策
区分已知拒绝、已知成功、结果未知，按操作身份核对；只在安全重放契约和截止时间内重试，保留原因但不泄露内部细节。

### 例外
取消不等于远端回滚；数据库原子性与外部效果需实际事务/发件箱或核对设计。

### 正反示意
正例：同意图同键查询已提交结果。反例：每次超时都盲目补偿。

### 验证
在副作用之后、成功确认之前注入故障；EP-SVC-01仅覆盖进程内存/HTTP，不证明事务隔离。

### 来源
aws-idempotency, aws-retry — [来源与适用限制](common/engineering-practices.sources.json).

证据标识: EP-SVC-01; review-only.  执行状态及覆盖范围见实际记录；关联ID不证明该卡全部语义。

<a id="bec-transaction-management:replay-boundaries"></a>
## 明确重放的一致性所有者

级别: required

### 风险
不协调的重复消费者会重复不可逆效果。

### 适用
重试事务、派发器和消息消费者适用。

### 决策
确定持久原子单元、键保留期和外部效果，利用现有引擎保证及明确的幂等消费者/核对，有界重放并暴露耗尽任务。

### 例外
发件箱不会自动令任意外部服务恰好一次；进程互斥没有崩溃或多进程保证。

### 正反示意
正例：效果、结果与去重状态有明确一致性设计。反例：从本地map或成功路径测试声称恰好一次。

### 验证
引擎/消息保证需真实集成，覆盖重复、乱序和崩溃窗口；缺失集成标未运行。

### 来源
aws-idempotency, ms-faults — [来源与适用限制](common/engineering-practices.sources.json).

证据标识: EP-SVC-01; review-only.  执行状态及覆盖范围见实际记录；关联ID不证明该卡全部语义。
