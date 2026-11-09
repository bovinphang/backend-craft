---
practiceCards:
  - id: "bec-observability:correlated-errors"
    level: "required"
    sourceIds: ["aws-retry","google-review"]
    caseIds: ["EP-SVC-01"]
    evidence: "review-only"
  - id: "bec-observability:safe-diagnostics"
    level: "required"
    sourceIds: ["google-review","ms-playbook"]
    caseIds: ["EP-SVC-01"]
    evidence: "review-only"
---

# 本入口工程决策

先定位项目角色、工具链及已有约定，再按需读取[公共原则](common/engineering-practices.md)。下列条件仅约束当前语言/场景；结构检查不证明全部语义或实际运行。

<a id="bec-observability:correlated-errors"></a>
## 关联故障且不改变错误含义

级别: required

### 风险
吞掉原因或重复日志掩盖实际故障操作与重试所有者。

### 适用
请求/任务失败及恢复路径适用。

### 决策
内部保留原因链，以稳定操作/关联标识连接事件，对外输出有界稳定错误，在所有者记录重试和提交不确定性。

### 例外
不向调用方泄露原生异常堆栈，不在每层重复完整日志，沿用现有遥测工具。

### 正反示意
正例：关联未知结果与后续重放且不捏造成功。反例：捕获、打日志后返回成功。

### 验证
用合成故障检查公开错误与内部关联，包括耗尽和响应失败。

### 来源
aws-retry, google-review — [来源与适用限制](common/engineering-practices.sources.json).

证据标识: EP-SVC-01; review-only.  执行状态及覆盖范围见实际记录；关联ID不证明该卡全部语义。

<a id="bec-observability:safe-diagnostics"></a>
## 约束诊断数据与维度

级别: required

### 风险
原始载荷、凭据或无界标签会泄露信息并耗尽资源。

### 适用
日志、指标、trace和故障报告适用。

### 决策
采用批准的安全字段、脱敏与大小边界，避免以操作ID作为无界指标标签，不记录密钥/原始个人数据，遵守项目保留和访问策略。

### 例外
这些是项目边界决策，不代表引用企业全部采用同一日志政策；不读取生产密钥造测试。

### 正反示意
正例：合成ID和选定错误码。反例：失败时转储头、token与环境。

### 验证
用合成值断言公开/日志字段并检查维度/大小；生产访问和保留策略仍属部署检查。

### 来源
google-review, ms-playbook — [来源与适用限制](common/engineering-practices.sources.json).

证据标识: EP-SVC-01; review-only.  执行状态及覆盖范围见实际记录；关联ID不证明该卡全部语义。
