import { TASK_KINDS, type TaskKind } from "@bovinphang/craft-common";
export interface Arguments {
  positionals: string[];
  json: boolean;
  taskPath?: string;
  taskKind?: TaskKind;
  dryRun: boolean;
  global: boolean;
  language: "en" | "zh-CN";
}
export function parse(argv: string[], allowed: string[]): Arguments {
  argv = argv.flatMap((arg) =>
    arg === "-g"
      ? ["--global"]
      : arg === "-l"
        ? ["--local"]
        : arg.startsWith("--lang=")
          ? ["--lang", arg.slice(7)]
          : [arg],
  );
  const result: Arguments = {
    positionals: [],
    json: false,
    dryRun: false,
    global: false,
    language: "en",
  };
  let local = false;
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg.includes("\0")) throw new Error("参数包含非法字符");
    if (!arg.startsWith("-")) {
      result.positionals.push(arg);
      continue;
    }
    if (!allowed.includes(arg)) throw new Error("未知参数：" + arg);
    if (arg === "--task-path" || arg === "--task-kind") {
      const value = argv[++i];
      if (!value || value.startsWith("-") || value.includes("\0"))
        throw new Error("任务参数缺少值");
      if (arg === "--task-path") result.taskPath = value;
      else {
        if (!TASK_KINDS.includes(value as TaskKind))
          throw new Error("任务类型无效");
        result.taskKind = value as TaskKind;
      }
    } else if (arg === "--json") result.json = true;
    else if (arg === "--dry-run") result.dryRun = true;
    else if (arg === "--global") result.global = true;
    else if (arg === "--local") local = true;
    else if (arg === "--lang") {
      const value = argv[++i];
      if (value !== "en" && value !== "zh-CN")
        throw new Error("语言仅支持 en、zh-CN");
      result.language = value;
    }
  }
  if (local && result.global)
    throw new Error("--local 和 --global 不能同时使用");
  return result;
}
