import { adapterFor } from "./shared.js";
export const opencode = adapterFor(
  "opencode",
  { commands: true },
  "documented",
  ["重启宿主或刷新资源；使用 doctor 查看文件状态，实际启用仍需宿主确认。"],
);
