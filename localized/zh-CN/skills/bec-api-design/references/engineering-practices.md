---
practiceCards:
  - id: "bec-api-design:idempotent-intent"
    level: "required"
    sourceIds: ["aws-idempotency","aws-retry"]
    caseIds: ["EP-SVC-01"]
    evidence: "case"
  - id: "bec-api-design:compatibility-window"
    level: "required"
    sourceIds: ["google-review","ms-playbook"]
    caseIds: ["EP-SVC-01"]
    evidence: "review-only"
---

# 本入口工程决策

先定位项目角色、工具链及已有约定，再按需读取[公共原则](common/engineering-practices.md)。下列条件仅约束当前语言/场景；结构检查不证明全部语义或实际运行。

<a id="bec-api-design:idempotent-intent"></a>
## 按同一操作意图去重

级别: required

### 风险
提交后响应失败，重试可能重复写入。

### 适用
写API的调用方可能重放待确认请求时适用。

### 决策
将键限定于已验证调用方/操作，绑定规范化业务意图，原子取得执行权并记录结果；定义处理中、冲突、保留期和重放行为。同键只用于同意图，客户端重试有界。

### 例外
只有键头不构成保证；持久或多进程副作用需持久原子去重或核对，不能依靠进程map；样例状态码仅为其契约。

### 正反示意
正例：同键同意图复用结果，意图改变则拒绝。反例：每次重试生成新键或重放全部5xx写入。

### 验证
EP-SVC-01通过真实HTTP客户端验证提交后响应失败、意图变化和并发重复，观察实际效果计数；不覆盖数据库、崩溃恢复或鉴权。

### 来源
aws-idempotency, aws-retry — [来源与适用限制](common/engineering-practices.sources.json).

证据标识: EP-SVC-01; case. [本入口可运行案例](../examples/engineering/README.md)。 执行状态及覆盖范围见实际记录；关联ID不证明该卡全部语义。

<a id="bec-api-design:compatibility-window"></a>
## 为已部署消费者演进契约

级别: required

### 风险
源码类型兼容不代表已部署的传输契约兼容。

### 适用
公开或独立部署的请求/响应契约适用。

### 决策
确认实际客户端、版本、缺省及错误语义；优先增量演进，删除前定义废弃窗口并验证适配层；副作用前验证不可信输入。

### 例外
未知字段、枚举新增与可选性取决于消费者；不能假设所有新增均安全或强制迁移API技术。

### 正反示意
正例：用旧请求/响应夹具测试新边界。反例：只编译服务端就认定传输兼容。

### 验证
用现有工具验证旧客户端、非法输入、稳定错误，区分schema检查和实际副作用。

### 来源
google-review, ms-playbook — [来源与适用限制](common/engineering-practices.sources.json).

证据标识: EP-SVC-01; review-only.  执行状态及覆盖范围见实际记录；关联ID不证明该卡全部语义。
