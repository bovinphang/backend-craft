---
practiceCards:
  - id: "bec-code-review:evidence-severity"
    level: "required"
    sourceIds: ["google-review"]
    caseIds: ["EP-SVC-01"]
    evidence: "review-only"
  - id: "bec-code-review:compatibility"
    level: "required"
    sourceIds: ["google-review","ms-playbook"]
    caseIds: ["EP-SVC-01"]
    evidence: "review-only"
---

# 本入口工程决策

先定位项目角色、工具链及已有约定，再按需读取[公共原则](common/engineering-practices.md)。下列条件仅约束当前语言/场景；结构检查不证明全部语义或实际运行。

<a id="bec-code-review:evidence-severity"></a>
## 按具体使用影响分级

级别: required

### 风险
仅偏好性的阻塞掩盖缺陷并增加评审负担。

### 适用
实际变更文件和行为的限定评审适用。

### 决策
定位触发条件、位置、已观察或有依据的影响和级别，先核对项目约定及误报，再建议最小修正。

### 例外
公开企业风格不构成通用阻塞；遵守已定评审节奏，本任务只做一次最终独立评审，不为每卡增加评审者。

### 正反示意
正例：展示响应丢失后的重复写入。反例：按个人命名喜好阻塞。

### 验证
尽可能复现重要缺陷，保留评审原文和未判断边界。

### 来源
google-review — [来源与适用限制](common/engineering-practices.sources.json).

证据标识: EP-SVC-01; review-only.  执行状态及覆盖范围见实际记录；关联ID不证明该卡全部语义。

<a id="bec-code-review:compatibility"></a>
## 评审真实消费者与迁移状态

级别: required

### 风险
仅看HEAD diff可能漏掉原有未跟踪源及独立分发消费者。

### 适用
多仓/包改动与未提交基线适用。

### 决策
使用约定的实际基线，纳入新增生成/未跟踪交付，追踪源→归档→已安装消费者，检查新旧共存、所有权和用户编辑保护。

### 例外
不把无关上一轮工作当新引入，不隐式更改另一产品；目录数量不是兼容证明。

### 正反示意
正例：在任何写入前验证旧候选冲突。反例：绕过来源所有权令安装变绿。

### 验证
验证精确归档字节/依赖及相关迁移/消费测试，注明基线范围。

### 来源
google-review, ms-playbook — [来源与适用限制](common/engineering-practices.sources.json).

证据标识: EP-SVC-01; review-only.  执行状态及覆盖范围见实际记录；关联ID不证明该卡全部语义。
