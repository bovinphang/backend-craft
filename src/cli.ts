import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  createCraftCli,
  renderCliHelp,
  type CliIO as SharedCliIO,
} from "@bovinphang/craft-common";
import { PRODUCT } from "./product.js";
import { RUNTIMES } from "./install/registry.js";
import { backendCliAdapter } from "./cli/adapter.js";
export interface CliIO {
  stdout(value: string): void;
  stderr(value: string): void;
  cwd?: string;
  home?: string;
  productRoot?: string;
  env?: NodeJS.ProcessEnv;
  signal?: AbortSignal;
  isTTY?: boolean;
}
const definition = {
  packageName: PRODUCT.name,
  commandName: "backend-craft",
  binName: "bec",
  version: PRODUCT.version,
  runtimes: Object.keys(RUNTIMES),
};
const run = createCraftCli(
  {
    ...definition,
    help:
      renderCliHelp(definition) +
      "\nBackend commands:\n  bec validate [path] [--dry-run] [--json]\n  bec runtime list [--local|--global] [--json]\n\n自动格式和自动验证默认关闭。\n",
  },
  backendCliAdapter,
);
export async function main(argv: string[], io: CliIO): Promise<0 | 1 | 2> {
  const env = io.env ?? process.env;
  const context: SharedCliIO = {
    ...io,
    cwd: io.cwd ?? process.cwd(),
    home: io.home ?? os.homedir(),
    productRoot:
      io.productRoot ??
      path.resolve(path.dirname(fileURLToPath(import.meta.url)), ".."),
    env,
    isTTY:
      io.isTTY ??
      (Boolean(process.stdin.isTTY) ||
        env.BACKEND_CRAFT_FORCE_INTERACTIVE === "1"),
  };
  return run(argv, context);
}
