import fs from "node:fs";
import path from "node:path";
import { PassThrough } from "node:stream";
import {
  createCliPrompts,
  createClaudeCacheManager,
  createCliLifecycle,
  type CliProductAdapter,
  type CliIO,
  type CliInstallation,
  type CliDiscoveryFilter,
  type CliResourceOptions,
  type CliCommandResult,
} from "@bovinphang/craft-common";
import { PRODUCT } from "../product.js";
import { parse } from "./parse.js";
import { publicPlan } from "./output.js";
import { inspectCapabilities } from "./inspect.js";
import { validationPlan } from "./validate.js";
import { doctor } from "./runtime.js";
import { RUNTIMES } from "../install/registry.js";
import { createInstallContext, LOCAL_DIR } from "../install/paths.js";
import { installRuntime, uninstallRuntime } from "../install/lifecycle.js";
import {
  manifestPath,
  readManifest,
  assertManifestIdentity,
} from "../install/manifest.js";
import { checkMigration } from "../install/migration.js";
import { executeValidation } from "../project/execute.js";
import { readCommonCatalog } from "../content/common.js";

function context(
  io: CliIO,
  runtime: string,
  scope: "local" | "global",
  options: Partial<CliResourceOptions> = {},
) {
  return createInstallContext({
    productRoot: io.productRoot,
    cwd: io.cwd,
    home: io.home,
    env: io.env,
    runtime,
    isGlobal: scope === "global",
    language: options.language,
    dryRun: options.dryRun,
    mode: options.action === "update" ? "update" : "install",
  });
}

function discover(filter: CliDiscoveryFilter, io: CliIO): CliInstallation[] {
  return (filter.runtimes ?? Object.keys(RUNTIMES)).flatMap((runtime) =>
    (filter.scopes ?? ["local", "global"]).flatMap((scope) => {
      try {
        const ctx = context(io, runtime, scope);
        const file = manifestPath(ctx),
          manifest = readManifest(file);
        if (!manifest) return [];
        assertManifestIdentity(ctx, manifest);
        return [
          { runtime, scope, language: manifest.language, manifestPath: file },
        ];
      } catch (error) {
        if (!filter.onError) throw error;
        filter.onError(
          error instanceof Error ? error : new Error(String(error)),
        );
        return [];
      }
    }),
  );
}

function prompts(io: CliIO) {
  // Non-TTY answers still use the shared scripted-input protocol, while output
  // remains scoped to the caller (including tests and embedding applications).
  const output = new PassThrough() as unknown as NodeJS.WriteStream;
  output.on("data", (value: Buffer) => io.stdout(value.toString()));
  return createCliPrompts({
    productName: "backend-craft",
    runtimes: Object.keys(RUNTIMES),
    getGlobalConfigDir: (runtime) => context(io, runtime, "global").baseDir,
    localDirectories: LOCAL_DIR,
    home: () => io.home,
    env: io.env,
    output,
  });
}

function cacheManager(io: CliIO) {
  return createClaudeCacheManager({
    pluginName: "backend-craft",
    manifestFilename: PRODUCT.manifestName,
    home: () => io.home,
    env: io.env,
    cwd: () => io.cwd,
  });
}

async function resource(
  options: CliResourceOptions,
  io: CliIO,
): Promise<CliCommandResult> {
  if (options.force && options.action !== "uninstall")
    throw new Error("--force 仅支持 runtime uninstall");
  let ctx = context(io, options.runtime, options.scope, options);
  if (options.action !== "uninstall" && options.runtime === "claude") {
    const sources = cacheManager(io).getClaudeInstallSourceReport();
    if (sources.native.length)
      throw new Error(
        "检测到 backend-craft Claude 原生插件安装；请先停用原生渠道，再使用 CLI 安装或更新。",
      );
    const opposite = options.scope === "global" ? "local" : "global";
    const existing = discover(
      { runtimes: ["claude"], scopes: [opposite] },
      io,
    )[0];
    if (existing) {
      if (options.dryRun || !options.canPrompt)
        throw new Error(
          `Claude 已存在 ${opposite} CLI 安装；请先卸载该安装或使用 --${opposite}。`,
        );
      io.stdout(
        `Claude 已安装在 ${opposite}；选择该位置会继续使用已有安装，选择 ${options.scope} 会先移除旧安装。\n`,
      );
      const selectedGlobal = await prompts(io).promptLocation(["claude"]);
      if (selectedGlobal === undefined) return { code: 0, text: "Cancelled." };
      const selectedScope = selectedGlobal ? "global" : "local";
      if (selectedScope === opposite)
        ctx = context(io, "claude", opposite, {
          ...options,
          language: existing.language,
        });
      else {
        const removed = await uninstallRuntime(
          context(io, "claude", opposite, {
            ...options,
            language: existing.language,
          }),
        );
        if (removed.status === "partial") return { code: 2, value: removed };
      }
    }
  }
  const result =
    options.action === "uninstall"
      ? await uninstallRuntime(ctx, undefined, { force: options.force })
      : await installRuntime(ctx);
  return {
    code: result.status === "partial" ? 2 : 0,
    value: result,
    text: `backend-craft ${options.action} ${ctx.runtime} (${ctx.isGlobal ? "global" : "local"}, ${ctx.language}): ${result.status}`,
  };
}

function metadata(io: CliIO): CliCommandResult {
  const read = (file: string) =>
    JSON.parse(
      fs.readFileSync(path.join(io.productRoot, file), "utf8"),
    ) as Record<string, unknown>;
  const pkg = read("package.json");
  const problems: string[] = [];
  const version = pkg.version;
  if (pkg.name !== PRODUCT.name || version !== PRODUCT.version)
    problems.push("package/product version mismatch");
  for (const file of [".claude-plugin/plugin.json", "openclaw.plugin.json"]) {
    if (read(file).version !== version)
      problems.push(`${file}: version mismatch`);
  }
  const marketplace = read(".claude-plugin/marketplace.json") as {
    plugins?: Array<{
      name: string;
      version?: string;
      source?: { version?: string; package?: string };
    }>;
  };
  const plugin = marketplace.plugins?.find(
    (entry) => entry.name === "backend-craft",
  );
  if (
    !plugin ||
    plugin.version !== version ||
    plugin.source?.version !== version ||
    plugin.source?.package !== PRODUCT.name
  )
    problems.push("marketplace source/version mismatch");
  const dependency = (pkg.dependencies as Record<string, string> | undefined)?.[
    "@bovinphang/craft-common"
  ];
  for (const language of ["en", "zh-CN"] as const) {
    const catalog = readCommonCatalog(io.productRoot, language);
    const indexPath =
      language === "en"
        ? "skills/metadata.json"
        : "localized/zh-CN/skills/metadata.json";
    const entries = read(indexPath) as unknown as Array<{
      id: string;
      version?: string;
    }>;
    if (!Array.isArray(entries))
      problems.push(`${indexPath}: invalid skill index`);
    else
      for (const entry of entries) {
        const expected = entry.id.startsWith("cc-")
          ? catalog.packageVersion
          : version;
        if (entry.version !== expected)
          problems.push(`${indexPath}: ${entry.id} version mismatch`);
      }
    if (catalog.packageVersion !== dependency)
      problems.push(`${language}: common package version mismatch`);
    if (
      catalog.skills.some(
        (skill) =>
          skill.sourcePackage !== "@bovinphang/craft-common" ||
          skill.version !== catalog.packageVersion,
      )
    )
      problems.push(`${language}: common skill source version mismatch`);
  }
  return {
    code: problems.length ? 2 : 0,
    value: { status: problems.length ? "mismatch" : "synchronized", problems },
    text: problems.length
      ? problems.join("\n")
      : "backend-craft metadata is synchronized.",
  };
}

async function command(
  argv: string[],
  io: CliIO,
): Promise<CliCommandResult | undefined> {
  if (argv[0] === "sync-metadata") {
    const args = parse(argv.slice(1), ["--check", "--json"]);
    if (args.positionals.length) throw new Error("sync-metadata 无位置参数");
    return metadata(io);
  }
  if (argv[0] === "runtime" && argv[1] === "check-migration") {
    const args = parse(argv.slice(2), ["--json", "--local", "--global"]);
    if (args.positionals.length > 1)
      throw new Error("迁移检查最多接受一个 Runtime");
    const report = checkMigration({
      cwd: io.cwd,
      productRoot: io.productRoot,
      home: io.home,
      env: io.env,
      runtime: args.positionals[0],
      isGlobal: args.global,
    });
    return { code: report.exitCode, value: report };
  }
  if (argv[0] === "matrix") {
    const args = parse(argv.slice(1), ["--json"]);
    if (args.positionals.length) throw new Error("matrix 无位置参数");
    const matrix = Object.values(RUNTIMES).map((r) => ({
      id: r.id,
      capabilities: r.capabilities,
      discovery: r.discovery ?? "documented",
      manualSteps: r.manualSteps ?? [],
    }));
    return {
      value: matrix,
      text: matrix
        .map(
          (r) =>
            `${r.id}: ${Object.entries(r.capabilities)
              .filter(([, enabled]) => enabled)
              .map(([capability]) => capability)
              .join(
                ", ",
              )} (${r.discovery})${r.manualSteps.length ? `; ${r.manualSteps.join("; ")}` : ""}`,
        )
        .join("\n"),
    };
  }
  if (argv[0] === "project" && argv[1] === "inspect") {
    const args = parse(argv.slice(2), ["--json", "--task-path", "--task-kind"]);
    if (args.positionals.length > 1) throw new Error("inspect 仅接受一个路径");
    return {
      value: inspectCapabilities(
        io.cwd,
        args.positionals[0],
        io.productRoot,
        args.taskPath,
        args.taskKind,
      ),
    };
  }
  if (argv[0] === "validate") {
    const args = parse(argv.slice(1), ["--json", "--dry-run"]);
    if (args.positionals.length > 1) throw new Error("validate 仅接受一个路径");
    const plan = validationPlan(io.cwd, args.positionals[0]);
    if (args.dryRun)
      return {
        value: { status: "planned", plan: publicPlan(plan) },
        code: plan.problems.length ? 2 : 0,
      };
    const result = await executeValidation(plan, { signal: io.signal });
    return {
      value: {
        ...result,
        problems: plan.problems,
        warnings: plan.warnings ?? [],
      },
      code: result.exitCode,
    };
  }
  if (argv[0] === "runtime" && argv[1] === "list") {
    const args = parse(argv.slice(2), ["--json", "--local", "--global"]);
    if (args.positionals.length) throw new Error("list 无位置参数");
    return {
      value: discover({ scopes: [args.global ? "global" : "local"] }, io),
    };
  }
  if (argv[0] === "doctor" || (argv[0] === "runtime" && argv[1] === "doctor")) {
    const args = parse(argv.slice(argv[0] === "doctor" ? 1 : 2), [
      "--json",
      "--local",
      "--global",
      "--fix-cache",
      "--dry-run",
    ]);
    if (args.positionals.length > 1)
      throw new Error("doctor 最多接受一个 Runtime");
    const runtime = args.positionals[0] ?? "claude";
    if (runtime !== "claude" && argv.includes("--fix-cache"))
      throw new Error("--fix-cache 仅支持 Claude");
    const result = doctor(
      context(io, runtime, args.global ? "global" : "local"),
    );
    if (runtime !== "claude")
      return { value: result, code: result.filesHealthy ? 0 : 2 };
    const manager = cacheManager(io),
      sources = manager.getClaudeInstallSourceReport();
    const cache = argv.includes("--fix-cache")
      ? manager.cleanupClaudeCache({
          currentVersion: PRODUCT.version,
          dryRun: args.dryRun,
        })
      : manager.getClaudeCacheReport({ currentVersion: PRODUCT.version });
    return {
      value: { ...result, sources, cache },
      code: result.filesHealthy && !sources.hasMultipleActiveSources ? 0 : 2,
    };
  }
  return undefined;
}

export const backendCliAdapter: CliProductAdapter = {
  discover: async (filter, io) => discover(filter, io),
  resource,
  command,
  prompts,
  lifecycle: async (action, argv, io) => {
    return createCliLifecycle(
      { packageName: PRODUCT.name, commandName: "bec", binName: "bec" },
      {
        env: io.env,
        isTTY: io.isTTY,
        log: (message) => io.stdout(message + "\n"),
      },
    )(action, argv, {
      pluginRoot: io.productRoot,
      cwd: io.cwd,
      describeResources: () =>
        discover({}, io).map(
          (install) =>
            `bec runtime update ${install.runtime} --${install.scope} --lang ${install.language}`,
        ),
      purgeResources: async (dryRun) => {
        let healthy = true;
        for (const installation of discover({}, io)) {
          try {
            const result = await uninstallRuntime(
              context(io, installation.runtime, installation.scope, {
                language: installation.language,
                dryRun,
              }),
            );
            io.stdout(JSON.stringify(result) + "\n");
          } catch (error) {
            healthy = false;
            io.stderr(
              (error instanceof Error ? error.message : String(error)) + "\n",
            );
          }
        }
        return healthy;
      },
    });
  },
};
