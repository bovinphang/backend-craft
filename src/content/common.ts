import type { ContentCatalog, InstallLanguage } from "@bovinphang/craft-common";
import fs from "node:fs";
import path from "node:path";
import {
  snapshotPath,
  hashBytes,
  generatedResource,
  mixedIndex,
} from "./snapshot.js";
export type CommonContentLock = {
  schemaVersion: 1;
  packageName: "@bovinphang/craft-common";
  packageVersion: string;
  catalogs: Record<InstallLanguage, Omit<ContentCatalog, "root">>;
  files: Array<{ relativePath: string; hash: string }>;
};
export function readCommonCatalog(
  root: string,
  language: InstallLanguage,
): ContentCatalog {
  const lock = JSON.parse(
    fs.readFileSync(snapshotPath(root, "common-content.lock.json"), "utf8"),
  ) as CommonContentLock;
  if (
    lock.schemaVersion !== 1 ||
    lock.packageName !== "@bovinphang/craft-common" ||
    !Array.isArray(lock.files) ||
    !lock.catalogs?.[language]
  )
    throw new Error("公共内容锁结构无效");
  const seen = new Set<string>();
  for (const entry of lock.files) {
    if (
      (!generatedResource(entry.relativePath) &&
        !mixedIndex(entry.relativePath)) ||
      seen.has(entry.relativePath)
    )
      throw new Error("公共锁路径无效或重复");
    seen.add(entry.relativePath);
    const file = snapshotPath(root, entry.relativePath);
    if (!fs.existsSync(file) || hashBytes(fs.readFileSync(file)) !== entry.hash)
      throw new Error(`公共内容哈希不一致或被修改：${entry.relativePath}`);
  }
  const catalog = lock.catalogs[language];
  const { digest, ...body } = catalog;
  if (
    catalog.packageVersion !== lock.packageVersion ||
    catalog.language !== language ||
    hashBytes(JSON.stringify(body)) !== digest
  )
    throw new Error("公共目录摘要无效");
  const prefix = language === "en" ? "" : `localized/${language}/`;
  for (const skill of catalog.skills)
    for (const file of skill.files) {
      const relative = `${prefix}skills/${skill.id}/${file.relativePath}`;
      if (
        !seen.has(relative) ||
        hashBytes(fs.readFileSync(snapshotPath(root, relative))) !== file.hash
      )
        throw new Error("公共来源目录与资源锁不一致");
    }
  return {
    ...catalog,
    root: language === "en" ? root : path.join(root, "localized", language),
  };
}
