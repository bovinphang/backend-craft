import type { FileMutation } from "@bovinphang/craft-common";
import fs from "node:fs";
import path from "node:path";
import { hashBytes } from "../content/snapshot.js";
import { assertProductPath, pathKey } from "./safe-path.js";
let draft: Map<string, FileMutation> | undefined;
export function currentHash(file: string): string | null {
  try {
    const stat = fs.lstatSync(file);
    if (!stat.isFile() || stat.isSymbolicLink())
      throw new Error("托管文件不是普通文件或含链接");
    return hashBytes(fs.readFileSync(file));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw error;
  }
}
export async function planProductWrites(
  operation: () => Promise<void>,
): Promise<FileMutation[]> {
  if (draft) throw new Error("产品规划不允许嵌套或并发");
  draft = new Map();
  try {
    await operation();
    return [...draft.values()].filter((file) =>
      file.after === null
        ? file.beforeHash !== null
        : hashBytes(file.after) !== file.beforeHash,
    );
  } finally {
    draft = undefined;
  }
}
export function writePlanned(file: string, content: Buffer | null): void {
  if (!draft) throw new Error("产品写入必须位于规划会话");
  assertProductPath(file);
  const absolute = path.resolve(file),
    key = pathKey(absolute),
    previous = draft.get(key);
  draft.set(key, {
    path: absolute,
    beforeHash: previous ? previous.beforeHash : currentHash(absolute),
    after: content,
  });
}
export function readPlanned(file: string): Buffer {
  const pending = draft?.get(pathKey(file));
  if (pending?.after === null)
    throw Object.assign(new Error("目标已计划删除"), { code: "ENOENT" });
  return pending?.after ?? fs.readFileSync(file);
}
export function existsPlanned(file: string): boolean {
  const pending = draft?.get(pathKey(file));
  return pending ? pending.after !== null : fs.existsSync(file);
}
