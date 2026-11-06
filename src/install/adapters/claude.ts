import type { RuntimeAdapter } from "../registry.js";
import { planCore } from "./shared.js";
export const claude: RuntimeAdapter = {
  id: "claude",
  capabilities: {
    skills: true,
    agents: true,
    commands: true,
    hooks: false,
    rules: true,
  },
  manualSteps: ["重启宿主或刷新资源；CLI 与原生插件渠道二选一。"],
  async plan(ctx) {
    await planCore(ctx, claude);
  },
};
