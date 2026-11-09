---
practiceCards:
  - id: "bec-testing-strategy:fault-matrix"
    level: "required"
    sourceIds: ["ms-playbook","ms-faults"]
    caseIds: ["EP-SVC-01"]
    evidence: "review-only"
  - id: "bec-testing-strategy:real-integration"
    level: "required"
    sourceIds: ["ms-playbook","ms-faults"]
    caseIds: ["EP-SVC-01"]
    evidence: "review-only"
---

# 本入口工程决策

先定位项目角色、工具链及已有约定，再按需读取[公共原则](common/engineering-practices.md)。下列条件仅约束当前语言/场景；结构检查不证明全部语义或实际运行。

<a id="bec-testing-strategy:fault-matrix"></a>
## 按故障影响选择测试

级别: required

### 风险
仅成功路径会漏掉拒绝输入和提交后故障。

### 适用
契约改动与可靠性敏感路径适用。

### 决策
按风险选择最小有效层，覆盖拒绝输入、资源清理、并发重复及未知结果，保留现有工具，以真实断言反例配对保护路径。

### 例外
可逆外观改动不必全加测试，不引入第二套框架；编译错误不算业务反例。

### 正反示意
正例：真实HTTP客户端观察重放及效果计数。反例：假响应始终写PASS。

### 验证
要求具名非零真实执行、退出码/计数/失败标记，缺工具与跳过单列。

### 来源
ms-playbook, ms-faults — [来源与适用限制](common/engineering-practices.sources.json).

证据标识: EP-SVC-01; review-only.  执行状态及覆盖范围见实际记录；关联ID不证明该卡全部语义。

<a id="bec-testing-strategy:real-integration"></a>
## 结论对应实际运行边界

级别: required

### 风险
替代物通过时，实际框架或存储语义可能不同。

### 适用
声称引擎、框架或部署行为时适用。

### 决策
为目标属性使用实际兼容依赖和真实边界，隔离准备、锁定输入，记录工具版本/hash/命令/日志。

### 例外
单元/内存测试对其范围仍有价值，但不能证明数据库隔离、分布式持久性或生产鉴权；不为填矩阵扩大范围。

### 正反示意
正例：HTTP结果旁注明数据库集成未运行。反例：把内存测试改名事务集成。

### 验证
验证真实归档/隔离输入及明确缺失/跳过，记录平台和剩余空白。

### 来源
ms-playbook, ms-faults — [来源与适用限制](common/engineering-practices.sources.json).

证据标识: EP-SVC-01; review-only.  执行状态及覆盖范围见实际记录；关联ID不证明该卡全部语义。
