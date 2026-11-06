import fs from "node:fs";
import path from "node:path";
export function canonicalPath(input: string): string {
  let current = path.resolve(input);
  const missing: string[] = [];
  for (;;) {
    try {
      fs.lstatSync(current);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
      const parent = path.dirname(current);
      if (parent === current) throw new Error("无法确定目标路径");
      missing.unshift(path.basename(current));
      current = parent;
      continue;
    }
    return path.join(fs.realpathSync.native(current), ...missing);
  }
}
export const inside = (root: string, target: string): boolean => {
  const relative = path.relative(root, target);
  return (
    !path.isAbsolute(relative) &&
    relative !== ".." &&
    !relative.startsWith(`..${path.sep}`)
  );
};
export function safeDestination(file: string, roots: string[]): string {
  const absolute = path.resolve(file);
  const candidates = roots
    .flatMap((root) => [
      { boundary: path.resolve(root), real: canonicalPath(root) },
      { boundary: canonicalPath(root), real: canonicalPath(root) },
    ])
    .sort((a, b) => b.boundary.length - a.boundary.length);
  for (const { boundary, real } of candidates) {
    if (absolute === boundary || !inside(boundary, absolute)) continue;
    let current = absolute;
    while (pathKey(current) !== pathKey(boundary)) {
      try {
        if (fs.lstatSync(current).isSymbolicLink())
          throw new Error(`托管目标不允许内部链接：${current}`);
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
      }
      const parent = path.dirname(current);
      if (parent === current) throw new Error("托管路径未到达声明边界");
      current = parent;
    }
    return path.resolve(real, path.relative(boundary, absolute));
  }
  throw new Error(`托管目标越过允许路径边界：${file}`);
}
export function assertProductPath(file: string): void {
  const parts = path.resolve(file).split(path.sep),
    foreign = /^(fec-|cc-)/i;
  if (
    parts.some(
      (part, index) =>
        foreign.test(part) &&
        (index === parts.length - 1 ||
          [
            "skills",
            "agents",
            "commands",
            "rules",
            "workflows",
            "global_workflows",
            "prompts",
            "instructions",
          ].includes(parts[index - 1])),
    ) ||
    parts.some((part) => part.toLowerCase() === "craft-manifests") ||
    path.basename(file).toLowerCase() === "frontend-craft.manifest.json" ||
    (parts.at(-2)?.toLowerCase() === ".claude-plugin" &&
      ["plugin.json", "marketplace.json"].includes(parts.at(-1)!.toLowerCase()))
  )
    throw new Error("产品不能认领前端文件、原生插件元数据或公共资源/账本");
}
export function privateNamespace(relative: string): boolean {
  return relative
    .split(/[\\/]/)
    .some((part) => /^bec-[a-z0-9]|^backend-craft(?:[.-]|$)/i.test(part));
}
export const pathKey = (file: string): string =>
  process.platform === "win32"
    ? path.resolve(file).toLowerCase()
    : path.resolve(file);
