---
name: bec-validate
description: "先运行 bec validate <工程路径> --dry-run --json 检查范围、命令和缺失工具，再针对用户要求的工程运行 bec validate <工程路径> --json。缺少必需工具或零测试均为验证不完整，不隐式安装工具或启用集成测试。"
---

先运行 bec validate <工程路径> --dry-run --json 检查范围、命令和缺失工具，再针对用户要求的工程运行 bec validate <工程路径> --json。缺少必需工具或零测试均为验证不完整，不隐式安装工具或启用集成测试。

读取技能 bec-testing-strategy。

任务参数：$ARGUMENTS
报告写入 reports/backend-craft/；保留用户修改，结论必须包含实际验证证据。
