# 项目验证配置

[English](validation-config.md) · [文档导航](README.zh-CN.md)

## 预览与执行

```sh
bec project inspect . --json
bec validate . --dry-run --json
bec validate . --json
```

inspect 只读识别工程，validate --dry-run 生成计划且不启动质量命令。执行前检查选中的工程根、工具和阶段。验证命令会执行项目代码，执行环境应按项目要求准备。

## 配置来源

优先使用显式 .backend-craft.json，其次为已有项目任务，最后为语言候选。指定子目录或文件时优先读取最近已识别工程根的配置，所有相对路径以该配置目录为基准；没有子工程配置时回退到工作区配置。省略目标路径时，工作区配置可选择多个工程。

已有 Makefile 的 format-check、lint、typecheck、test、build 目标可以成为任务入口。格式阶段选择检查命令。Java wrapper 和依赖应预先准备。

## 显式配置示例

在目标工程创建 .backend-craft.json，使用现有 Go 工具执行单元测试。

```json
{
  "schemaVersion": 1,
  "enableIntegration": false,
  "projects": [
    {
      "root": ".",
      "languages": ["go"],
      "stages": [
        {
          "id": "unit",
          "phase": "test",
          "executable": "go",
          "args": ["test", "-json", "-count=1", "-mod=readonly", "./..."],
          "cwd": ".",
          "timeoutMs": 120000,
          "required": true,
          "env": {
            "GOPROXY": "off",
            "GOTOOLCHAIN": "local",
            "GOSUMDB": "off"
          }
        }
      ]
    }
  ]
}
```

## 字段与约束

| 字段 | 约定 |
| --- | --- |
| schemaVersion | 固定为 1 |
| enableIntegration | 默认 false，设为 true 才执行集成阶段 |
| projects | 非空数组，工程根必须存在且互不重复 |
| root / cwd | 相对于配置目录，必须留在工作区内，拒绝内部链接 |
| languages | 可省略；支持 rust、go、java、python、c、cpp |
| stages | 非空数组，id 在整个配置中唯一 |
| phase | format、lint、typecheck、test 或 build |
| executable | PATH 工具名、明确的系统绝对路径或工作区内相对工具路径 |
| args | 字符串数组 |
| timeoutMs | 1000–600000 毫秒，默认 120000 |
| required | 默认 true |
| integration | 默认 false，标记集成阶段 |
| env | 传给子进程的字符串增量映射 |

未知字段、无效路径或重复阶段将导致配置错误。JSON 预览隐藏参数值和环境变量值，执行前仍应审阅本地配置。

## 结果解释

| 退出码 | 含义 |
| --- | --- |
| 0 | 所需验证通过 |
| 1 | 执行失败 |
| 2 | 验证不完整或输入无效 |

阶段状态包含 passed、failed、missing、timeout、skipped、cancelled。缺工具、必需阶段跳过、零测试都不能支持通过结论。默认候选采用离线与只读锁参数，工具或依赖不足时按仓库流程准备。

## 原生 Hook

Claude 原生 SessionStart 只读取工程证据。OpenClaw 原生插件配置支持 autoValidate、autoFormat 和 formatStage，两个开关默认 false。autoFormat 要求显式提供 phase 为 format 的 StageSpec，包含工具、参数、工作目录、超时和 required。配置放在宿主的插件配置中。CLI 适配器的 Hook 交付情况见 [Runtime 指南](runtimes/README.zh-CN.md)。
