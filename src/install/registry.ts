import { cursor } from "./adapters/cursor.js";
import { windsurf } from "./adapters/windsurf.js";
import { opencode } from "./adapters/opencode.js";
import { kilo } from "./adapters/kilo.js";
import { gemini } from "./adapters/gemini.js";
import { copilot } from "./adapters/copilot.js";
import { antigravity } from "./adapters/antigravity.js";
import { augment } from "./adapters/augment.js";
import { trae } from "./adapters/trae.js";
import { codebuddy } from "./adapters/codebuddy.js";
import { cline } from "./adapters/cline.js";
import { openclaw } from "./adapters/openclaw.js";
import { qoder } from "./adapters/qoder.js";
import type { InstallContext } from "./types.js";
import { claude } from "./adapters/claude.js";
import { codex } from "./adapters/codex.js";
export interface RuntimeCapabilities {
  skills: boolean;
  agents: boolean;
  commands: boolean;
  hooks: boolean;
  rules: boolean;
}
export interface RuntimeAdapter {
  discovery?: "documented" | "manual";
  id: string;
  capabilities: RuntimeCapabilities;
  plan(ctx: InstallContext): Promise<void>;
  manualSteps?: string[];
}
export const RUNTIMES: Record<string, RuntimeAdapter> = {
  claude,
  codex,
  cursor,
  windsurf,
  opencode,
  kilo,
  gemini,
  copilot,
  antigravity,
  augment,
  trae,
  codebuddy,
  cline,
  openclaw,
  qoder,
};
export function getRuntime(id: string): RuntimeAdapter {
  if (!Object.hasOwn(RUNTIMES, id)) throw new Error("未知 Runtime：" + id);
  return RUNTIMES[id];
}
