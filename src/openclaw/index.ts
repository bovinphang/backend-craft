import { sessionStart } from "../hooks/session-start.js";
import { validationHook } from "../hooks/validate.js";
import { formatHook } from "../hooks/format.js";
import type { StageSpec } from "../project/types.js";
interface HostApi {
  pluginConfig?: {
    autoValidate?: boolean;
    autoFormat?: boolean;
    formatStage?: StageSpec;
  };
  on(
    name: string,
    handler: (
      event: Record<string, unknown>,
      context: { workspaceDir?: string },
    ) => unknown,
  ): void;
  logger?: { warn(message: string): void };
}
const plugin = {
  id: "backend-craft",
  name: "Backend Craft",
  description:
    "Rust、Go、Java、Python、C 与 C++ 工程能力；默认仅提供只读上下文",
  register(api: HostApi): void {
    api.on("before_prompt_build", (_event, ctx) => {
      if (!ctx.workspaceDir) return {};
      try {
        const report = sessionStart(ctx.workspaceDir);
        return {
          prependContext:
            "Backend Craft 项目证据：" +
            JSON.stringify(report) +
            "\n按最近工程语言加载相应 bec-* 规范，缺工具或未运行不得报通过。",
        };
      } catch {
        return {};
      }
    });
    if (
      api.pluginConfig?.autoValidate === true ||
      api.pluginConfig?.autoFormat === true
    )
      api.on("after_tool_call", async (event, ctx) => {
        if (
          !ctx.workspaceDir ||
          !["write", "edit"].includes(String(event.toolName).toLowerCase())
        )
          return;
        try {
          if (api.pluginConfig?.autoFormat === true) {
            const result = await formatHook({
              workspace: ctx.workspaceDir,
              enabled: true,
              stage: api.pluginConfig.formatStage,
            });
            if ("exitCode" in result && result.exitCode !== 0)
              api.logger?.warn("后端格式操作未通过，请查看明确的本地入口");
          }
          if (api.pluginConfig?.autoValidate === true) {
            const result = await validationHook({
              workspace: ctx.workspaceDir,
              enabled: true,
            });
            if ("exitCode" in result && result.exitCode !== 0)
              api.logger?.warn("后端验证未完成或失败，不可声明通过");
          }
        } catch {
          api.logger?.warn("后端 Hook 未完成，保留工作区供检查");
        }
      });
  },
};
export default plugin;
