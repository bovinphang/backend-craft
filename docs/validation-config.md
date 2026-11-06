# 项目验证配置

从父目录指定子目录或子文件时，优先读取最近已识别工程根的 .backend-craft.json，所有相对路径以该配置目录为基准；没有子工程配置时回退到工作区配置。省略目标路径时，工作区配置可显式选择多个工程。

`bec project inspect` 只读识别项目；`bec validate --dry-run` 输出计划，不启动质量命令。多个项目或构建入口需要指定更具体路径，或在工作区提供 `.backend-craft.json`。

```json
{
  "schemaVersion": 1,
  "enableIntegration": false,
  "projects": [{
    "root": ".",
    "languages": ["go"],
    "stages": [{
      "id": "unit", "phase": "test", "executable": "go",
      "args": ["test", "-json", "-count=1", "-mod=readonly", "./..."],
      "cwd": ".", "timeoutMs": 120000, "required": true,
      "env": {"GOPROXY": "off", "GOTOOLCHAIN": "local", "GOSUMDB": "off"}
    }]
  }]
}
```

root/cwd 是工作区相对目录，拒绝越界和内部链接；executable 可以是明确的系统绝对路径、PATH 工具名或工作区内显式相对工具路径。args 必须为数组，不接受 shell command 字符串。配置未知字段、重复阶段或缺少阶段会失败。超时允许 1000–600000 毫秒，默认 120000。

配置优先于已有任务，再优先于语言候选。已知 Makefile 的 format-check/lint/typecheck/test/build 任务可以作为现有项目工作流；不自动执行普通 format 目标，避免修复用户文件。Java 有 wrapper 时必须明确本地准备，不自动下载 wrapper 分发。

integration 阶段默认跳过，只有 enableIntegration=true 才启用。必需阶段被跳过不能宣称全部通过。默认工具候选使用离线和只读锁参数，缺少依赖应先由用户按仓库约定准备；产品不调用安装命令。项目自定义构建任务仍会执行项目代码，这不是沙箱或网络隔离保证。

环境变量增量只传给子进程，不应出现在 CLI 普通日志或 JSON 预览中；公开计划显示变量名但不显示值。用户应避免将密钥直接写进文件或命令参数。
