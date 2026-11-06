import path from "node:path";
import fs from "node:fs";
import spawn from "cross-spawn";
export function npmPack(root: string, output: string): string {
  fs.mkdirSync(output, { recursive: true });
  const result = spawn.sync(
    "npm",
    [
      "pack",
      "--ignore-scripts",
      "--json",
      "--pack-destination",
      path.resolve(output),
    ],
    {
      cwd: root,
      encoding: "utf8",
      windowsHide: true,
      timeout: 60000,
      env: {
        ...process.env,
        npm_config_cache: path.join(path.resolve(output), ".npm-cache"),
        npm_config_audit: "false",
        npm_config_fund: "false",
      },
    },
  );
  if (result.error || result.status !== 0)
    throw new Error(
      "npm pack 失败：" + (result.error?.message ?? result.stderr),
    );
  const value = JSON.parse(result.stdout) as Array<{ filename: string }>;
  const name = value[0]?.filename;
  if (!name || path.basename(name) !== name)
    throw new Error("npm pack 返回非法归档名");
  return path.join(output, name);
}
