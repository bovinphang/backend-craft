---
practiceCards:
  - id: "bec-auth-security:verified-context"
    level: "required"
    sourceIds: ["electron-security","tauri-permissions","google-review"]
    caseIds: ["EP-SVC-01"]
    evidence: "review-only"
  - id: "bec-auth-security:object-scope"
    level: "required"
    sourceIds: ["google-review","ms-faults"]
    caseIds: ["EP-SVC-01"]
    evidence: "review-only"
---

# 本入口工程决策

先定位项目角色、工具链及已有约定，再按需读取[公共原则](common/engineering-practices.md)。下列条件仅约束当前语言/场景；结构检查不证明全部语义或实际运行。

<a id="bec-auth-security:verified-context"></a>
## 从已验证请求上下文建立权限

级别: required

### 风险
客户端提供的身份或角色字段可能伪造权限。

### 适用
服务信任边界适用；桌面信任资料仅作类比，不是服务鉴权规范。

### 决策
沿用已验证主体/会话机制，按实际协议校验签发方、受众和有效期，派生最小上下文，副作用前授权；解析与认证分开。

### 例外
服务例只有固定合成测试主体，并非鉴权；不强推新身份提供方，不为诊断暴露密钥。

### 正反示意
正例：服务端派生主体限定去重键。反例：把X-Role或渲染进程载荷当作权限证明。

### 验证
以项目鉴权栈验证缺失/非法身份和拒绝路径；关联HTTP案例只证明去重行为。

### 来源
electron-security, tauri-permissions, google-review — [来源与适用限制](common/engineering-practices.sources.json).

证据标识: EP-SVC-01; review-only.  执行状态及覆盖范围见实际记录；关联ID不证明该卡全部语义。

<a id="bec-auth-security:object-scope"></a>
## 授权实际对象与动作

级别: required

### 风险
已认证调用方仍可能越过租户或对象边界。

### 适用
对象访问及包含调用方可控标识的写入适用。

### 决策
在权威用例边界、披露或修改前校验对象/动作/租户，将重放绑定该已验证范围，最小化返回字段。

### 例外
UI路由守卫、有效ID或认证成功都不证明对象授权；批处理与后台路径各需实际所有者。

### 正反示意
正例：测试其他租户的有效对象ID。反例：只测试未登录。

### 验证
用合成数据验证拒绝读写不泄露/不生效，允许路径仍成功。

### 来源
google-review, ms-faults — [来源与适用限制](common/engineering-practices.sources.json).

证据标识: EP-SVC-01; review-only.  执行状态及覆盖范围见实际记录；关联ID不证明该卡全部语义。
