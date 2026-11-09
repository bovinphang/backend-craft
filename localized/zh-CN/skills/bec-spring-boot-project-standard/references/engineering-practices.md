---
practiceCards:
  - id: "bec-spring-boot-project-standard:validation-effects"
    level: "conditional"
    sourceIds: ["spring-tests","google-java"]
    caseIds: ["EP-SVC-01"]
    evidence: "review-only"
  - id: "bec-spring-boot-project-standard:lifecycle-boundary"
    level: "conditional"
    sourceIds: ["spring-tests","oracle-resources"]
    caseIds: ["EP-SVC-01"]
    evidence: "review-only"
---

# 本入口工程决策

先定位项目角色、工具链及已有约定，再按需读取[公共原则](common/engineering-practices.md)。下列条件仅约束当前语言/场景；结构检查不证明全部语义或实际运行。

<a id="bec-spring-boot-project-standard:validation-effects"></a>
## 在服务效果前拒绝非法MVC输入

级别: conditional

### 风险
DTO约束存在但可能未在实际MVC路由启用。

### 适用
项目使用Spring MVC/Bean Validation时适用，不适用于所有Java库。

### 决策
检查实际映射、Jakarta验证启用和错误映射，拒绝输入不得到达服务/仓储副作用，用MockMvc或适当真实边界验证。

### 例外
[验证细节](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-methods/requestbody.html)需匹配项目版本；MockMvc不是监听服务器或数据库证明，保留现有BOM。

### 正反示意
正例：非法载荷返回客户端错误且服务效果为零。反例：只单测DTO而不经过MVC。

### 验证
运行现有Spring minimal反例/修复，记录实际Boot/JDK；关联EP-SVC-01不证明Spring验证。

### 来源
spring-tests, google-java — [来源与适用限制](common/engineering-practices.sources.json).

证据标识: EP-SVC-01; review-only.  执行状态及覆盖范围见实际记录；关联ID不证明该卡全部语义。

<a id="bec-spring-boot-project-standard:lifecycle-boundary"></a>
## 定位Spring资源与事务所有者

级别: conditional

### 风险
无人管理的资源或未检查的代理路径会偏离清理/事务预期。

### 适用
实际Spring组件、启动关闭和事务改动适用。

### 决策
沿用构造注入/配置验证，定位bean销毁及实际事务代理调用，检查自调用和回滚规则，外部副作用另定边界。

### 例外
本地事务不原子包含远端HTTP；MVC样例不执行真实数据库回滚或部署关闭。

### 正反示意
正例：验证实际配置的所有者释放资源。反例：认为注解能证明所有调用都有事务。

### 验证
按属性选context/slice/integration，隔离保证需真实存储，缺少关闭/数据库验证要注明。

### 来源
spring-tests, oracle-resources — [来源与适用限制](common/engineering-practices.sources.json).

证据标识: EP-SVC-01; review-only.  执行状态及覆盖范围见实际记录；关联ID不证明该卡全部语义。
