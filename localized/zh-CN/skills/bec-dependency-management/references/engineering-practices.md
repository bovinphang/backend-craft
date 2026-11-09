---
practiceCards:
  - id: "bec-dependency-management:platform-compatibility"
    level: "recommended"
    sourceIds: ["typescript-publishing","google-review"]
    caseIds: ["EP-SVC-01"]
    evidence: "review-only"
  - id: "bec-dependency-management:artifact-consumer"
    level: "required"
    sourceIds: ["typescript-publishing","ms-playbook"]
    caseIds: ["EP-SVC-01"]
    evidence: "review-only"
---

# 本入口工程决策

先定位项目角色、工具链及已有约定，再按需读取[公共原则](common/engineering-practices.md)。下列条件仅约束当前语言/场景；结构检查不证明全部语义或实际运行。

<a id="bec-dependency-management:platform-compatibility"></a>
## 尊重已确认的平台契约

级别: recommended

### 风险
指南中的新依赖可能破坏现有运行时或部署。

### 适用
语言/框架/依赖变更适用。

### 决策
检查精确清单/锁、engine、peer/平台及迁移说明，选局部兼容升级，隔离样例依赖，保持可复现构建。

### 例外
来源文档最新版本不授权升级用户项目；保留包管理器和安全策略。

### 正反示意
正例：显式兼容的样例工具链。反例：降低供应链检查来安装未发布候选。

### 验证
运行现有lint/类型/构建及受影响运行/消费测试，声明但未实测的最低版本单列。

### 来源
typescript-publishing, google-review — [来源与适用限制](common/engineering-practices.sources.json).

证据标识: EP-SVC-01; review-only.  执行状态及覆盖范围见实际记录；关联ID不证明该卡全部语义。

<a id="bec-dependency-management:artifact-consumer"></a>
## 验证消费者实际安装的归档

级别: required

### 风险
相邻workspace源可能掩盖发布文件缺失或完整性漂移。

### 适用
交付包和公共内容升级适用。

### 决策
检查真实归档文件、精确不可变版本/SRI及隔离消费者；公共参考来自已安装权威包生成，不从邻仓读取。

### 例外
不覆盖已消费版本字节，不替换为file/link；未发布本地产物在发布前仅为本地证据。

### 正反示意
正例：两产品锁定同一已验证归档。反例：手工补文件却保留旧锁。

### 验证
检查包内闭合、双语代码/锁、保护所有权的迁移及无构建缓存，保留归档与来源。

### 来源
typescript-publishing, ms-playbook — [来源与适用限制](common/engineering-practices.sources.json).

证据标识: EP-SVC-01; review-only.  执行状态及覆盖范围见实际记录；关联ID不证明该卡全部语义。
