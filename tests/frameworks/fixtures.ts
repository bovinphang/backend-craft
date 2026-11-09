import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
type Context = {
  after(fn: () => void): void;
  skip(reason: string): void;
  diagnostic(message: string): void;
};
export function example(t: Context, framework: string) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "bec-framework-"));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.cpSync(
    path.resolve(
      "skills",
      `bec-${framework}-project-standard/examples/minimal`,
    ),
    root,
    { recursive: true },
  );
  return root;
}
export function execute(
  command: string,
  args: string[],
  cwd: string,
  extra: NodeJS.ProcessEnv = {},
) {
  const env: NodeJS.ProcessEnv = {
    ...process.env,
    RUSTUP_AUTO_INSTALL: "0",
    CARGO_NET_OFFLINE: "true",
    GOPROXY: "off",
    GOTOOLCHAIN: "local",
    ...extra,
  };
  delete env.NODE_TEST_CONTEXT;
  const result = spawnSync(command, args, {
    cwd,
    env,
    encoding: "utf8",
    timeout: 90000,
    windowsHide: true,
  });
  return {
    ...result,
    output: (result.stdout ?? "") + "\n" + (result.stderr ?? ""),
  };
}
export function tool(
  t: Context,
  command: string,
  cwd: string,
  args = ["--version"],
): boolean {
  const result = execute(command, args, cwd);
  if (
    result.error &&
    (result.error as NodeJS.ErrnoException).code === "ENOENT"
  ) {
    t.skip(`MISSING ${command}; framework behavior NOT RUN`);
    return false;
  }
  assert.equal(result.status, 0, result.output);
  t.diagnostic(result.output.trim());
  return true;
}
export function prepared(
  t: Context,
  result: ReturnType<typeof execute>,
  missing: RegExp,
): boolean {
  if (result.status !== 0 && missing.test(result.output)) {
    t.skip(
      "MISSING prepared framework dependencies/lock; no download attempted, no business RED/PASS claimed",
    );
    return false;
  }
  assert.equal(result.status, 0, result.output);
  return true;
}
