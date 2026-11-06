import path from "node:path";
import { fileURLToPath } from "node:url";
import { PRODUCT } from "./product.js";
import { parse } from "./cli/parse.js";
import { publicPlan } from "./cli/output.js";
import { inspect } from "./cli/inspect.js";
import { validationPlan } from "./cli/validate.js";
import { doctor, createInstallContext } from "./cli/runtime.js";
import { RUNTIMES, getRuntime } from "./install/registry.js";
import { installRuntime, uninstallRuntime } from "./install/lifecycle.js";
import { manifestPath, readManifest } from "./install/manifest.js";
import { executeValidation } from "./project/execute.js";
export interface CliIO {
  stdout(value: string): void;
  stderr(value: string): void;
  cwd?: string;
  home?: string;
  productRoot?: string;
  env?: NodeJS.ProcessEnv;
  signal?: AbortSignal;
}
const help =
  "backend-craft / bec 1.0.0\n\nbec project inspect [path] [--json]\nbec validate [path] [--dry-run] [--json]\nbec runtime install|update|uninstall <runtime> [--local|--global] [--lang en|zh-CN] [--dry-run] [--json]\nbec runtime list [--local|--global] [--json]\nbec doctor <runtime> [--local|--global] [--json]\nbec matrix [--json]\n\n默认 local；自动格式/验证关闭。首版不提供 CLI 自升级或自卸载。\n";
export async function main(argv: string[], io: CliIO): Promise<0 | 1 | 2> {
  const emit = (value: unknown) =>
    io.stdout(JSON.stringify(value, null, 2) + "\n");
  try {
    if (
      !argv.length ||
      (argv.length === 1 && ["--help", "help", "-h"].includes(argv[0]))
    ) {
      io.stdout(help);
      return 0;
    }
    if (argv.length === 1 && ["--version", "version", "-v"].includes(argv[0])) {
      io.stdout(PRODUCT.version + "\n");
      return 0;
    }
    const cwd = io.cwd ?? process.cwd(),
      productRoot =
        io.productRoot ??
        path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
    if (argv[0] === "matrix") {
      const args = parse(argv.slice(1), ["--json"]);
      if (args.positionals.length) throw new Error("matrix 无位置参数");
      emit(
        Object.values(RUNTIMES).map((r) => ({
          id: r.id,
          capabilities: r.capabilities,
          discovery: r.discovery ?? "documented",
          manualSteps: r.manualSteps ?? [],
        })),
      );
      return 0;
    }
    if (argv[0] === "project" && argv[1] === "inspect") {
      const args = parse(argv.slice(2), ["--json"]);
      if (args.positionals.length > 1)
        throw new Error("inspect 仅接受一个路径");
      emit(inspect(cwd, args.positionals[0]));
      return 0;
    }
    if (argv[0] === "validate") {
      const args = parse(argv.slice(1), ["--json", "--dry-run"]);
      if (args.positionals.length > 1)
        throw new Error("validate 仅接受一个路径");
      const plan = validationPlan(cwd, args.positionals[0]);
      if (args.dryRun) {
        emit({ status: "planned", plan: publicPlan(plan) });
        return plan.problems.length ? 2 : 0;
      }
      const result = await executeValidation(plan, { signal: io.signal });
      emit({
        ...result,
        problems: plan.problems,
        warnings: plan.warnings ?? [],
      });
      return result.exitCode;
    }
    const isDoctor = argv[0] === "doctor",
      isRuntime = argv[0] === "runtime";
    if (!isDoctor && !isRuntime)
      throw new Error(
        "未知命令；首版 CLI 无自升级/自卸载，请使用 runtime 子命令管理产品资源",
      );
    const action = isDoctor ? "doctor" : argv[1];
    if (!["install", "update", "uninstall", "list", "doctor"].includes(action))
      throw new Error("未知 runtime 操作");
    const args = parse(
      argv.slice(isDoctor ? 1 : 2),
      action === "doctor" || action === "list"
        ? ["--json", "--local", "--global"]
        : ["--json", "--local", "--global", "--dry-run", "--lang"],
    );
    if (
      action === "list"
        ? args.positionals.length !== 0
        : args.positionals.length !== 1
    )
      throw new Error("平台参数数量无效");
    const context = (runtime: string) =>
      createInstallContext({
        productRoot,
        cwd,
        home: io.home,
        env: io.env,
        runtime,
        isGlobal: args.global,
        language: args.language,
        dryRun: args.dryRun,
        mode: action === "update" ? "update" : "install",
      });
    if (action === "list") {
      emit(
        Object.keys(RUNTIMES).flatMap((runtime) => {
          const ctx = context(runtime),
            manifest = readManifest(manifestPath(ctx));
          return manifest
            ? [
                {
                  runtime,
                  scope: manifest.scope,
                  language: manifest.language,
                  manifestPath: manifestPath(ctx),
                },
              ]
            : [];
        }),
      );
      return 0;
    }
    const id = args.positionals[0];
    getRuntime(id);
    const ctx = context(id);
    if (["install", "update"].includes(action) && !argv.includes("--lang")) {
      const existing = readManifest(manifestPath(ctx));
      if (existing) {
        ctx.language = existing.language;
        ctx.contentRoot =
          existing.language === "en"
            ? productRoot
            : path.join(productRoot, "localized", existing.language);
      }
    }
    if (action === "doctor") {
      const result = doctor(ctx);
      emit(result);
      return result.filesHealthy ? 0 : 2;
    }
    const result =
      action === "uninstall"
        ? await uninstallRuntime(ctx)
        : await installRuntime(ctx);
    emit(result);
    return result.status === "partial" ? 2 : 0;
  } catch (error) {
    const message = error instanceof Error ? error.message : "操作失败";
    io.stderr(message + "\n");
    if (argv.includes("--json")) emit({ error: message, exitCode: 2 });
    return 2;
  }
}
