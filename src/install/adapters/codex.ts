import type { RuntimeAdapter } from "../registry.js";
import { planCore } from "./shared.js";
export const codex: RuntimeAdapter = {
  id: "codex",
  capabilities: {
    skills: true,
    agents: true,
    commands: false,
    hooks: false,
    rules: true,
  },
  manualSteps: [
    "重启宿主以发现 .codex/agents TOML；按项目信任策略启用。Codex 无本产品原生斜杠命令。",
  ],
  async plan(ctx) {
    await planCore(ctx, codex);
  },
};
