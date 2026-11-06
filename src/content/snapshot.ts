import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
export const hashBytes = (value: string | Buffer): string =>
  createHash("sha256").update(value).digest("hex");
export function snapshotPath(root: string, relative: string): string {
  if (
    !relative ||
    path.isAbsolute(relative) ||
    relative.includes("\\") ||
    relative.split("/").some((part) => !part || part === "." || part === "..")
  )
    throw new Error(`公共内容路径越界：${relative}`);
  let target = path.resolve(root);
  for (const part of relative.split("/")) {
    target = path.join(target, part);
    try {
      if (fs.lstatSync(target).isSymbolicLink())
        throw new Error(`公共快照不允许符号链接：${relative}`);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    }
  }
  return target;
}
export const mixedIndex = (relative: string): boolean =>
  /^(?:localized\/zh-CN\/)?skills\/(?:metadata|relations|eval_queries)\.json$/.test(
    relative,
  );
export const generatedResource = (relative: string): boolean =>
  /^(?:localized\/zh-CN\/)?skills\/cc-[a-z0-9-]+\/.+/.test(relative) ||
  /^(?:localized\/zh-CN\/)?skills\/(?:bec-doc-sync|bec-debug-framework|bec-refactoring|bec-tdd-workflow)\/references\/common\/(?:doc-sync|debug|refactoring|tdd)\.md$/.test(
    relative,
  ) ||
  /^(?:localized\/zh-CN\/)?templates\/shared\/rules\/references\/common\/source-driven-development\.md$/.test(
    relative,
  );
