#!/usr/bin/env node
import path from "node:path";
import { fileURLToPath } from "node:url";
import { main } from "../src/cli.js";
import { findProductRoot } from "../src/content/root.js";
const controller = new AbortController();
process.once("SIGINT", () => controller.abort());
process.exitCode = await main(process.argv.slice(2), {
  stdout: (value) => process.stdout.write(value),
  stderr: (value) => process.stderr.write(value),
  signal: controller.signal,
  productRoot: findProductRoot(path.dirname(fileURLToPath(import.meta.url))),
});
