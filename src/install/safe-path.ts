import path from "node:path";
import {
  canonicalProductPath,
  safeProductPath,
  productPathKey,
} from "@bovinphang/craft-common";
import { backendInstallError } from "./errors.js";
export const canonicalPath = canonicalProductPath;
export const pathKey = productPathKey;
export const inside = (root: string, target: string): boolean => {
  const relative = path.relative(root, target);
  return (
    !path.isAbsolute(relative) &&
    relative !== ".." &&
    !relative.startsWith(".." + path.sep)
  );
};
export function safeDestination(file: string, roots: string[]): string {
  try {
    return safeProductPath(file, roots);
  } catch (error) {
    return backendInstallError(error);
  }
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
