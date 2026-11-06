import { adapterFor } from "./shared.js";
export const windsurf = adapterFor(
  "windsurf",
  { commands: true, rules: true },
  "manual",
  [
    "资源已生成；请在宿主设置中确认相应目录、启用规则或导入命令。全局路径需按宿主版本人工核对，安装器不能证明已启用。",
  ],
);
