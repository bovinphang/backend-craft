import fs from "node:fs";
import path from "node:path";
import { parseDocument } from "yaml";
import {
  collectSkillResources,
  type ContentCatalog,
} from "@bovinphang/craft-common";
import { PRODUCT } from "../product.js";
import type { InstallLanguage, ProductCatalog } from "./types.js";

function noLink(file: string): void {
  if (fs.existsSync(file) && fs.lstatSync(file).isSymbolicLink())
    throw new Error(`内容路径不允许符号链接：${file}`);
}
function documentName(file: string, expected: string): void {
  const raw = fs.readFileSync(file, "utf8");
  const match = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(raw);
  if (!match) throw new Error(`缺少 frontmatter：${file}`);
  const doc = parseDocument(match[1], { uniqueKeys: true, strict: true });
  if (doc.errors.length) throw new Error(`frontmatter 无效：${file}`);
  const fields: unknown = doc.toJS({ maxAliasCount: 10 });
  if (!fields || typeof fields !== "object" || Array.isArray(fields))
    throw new Error(`frontmatter 必须为对象：${file}`);
  const { name, description } = fields as Record<string, unknown>;
  if (name !== expected) throw new Error(`入口名称 name 不一致：${file}`);
  if (typeof description !== "string" || !description.trim())
    throw new Error(`缺少 description：${file}`);
}
export function readProductCatalog(
  inputRoot: string,
  language: InstallLanguage,
): ProductCatalog {
  if (language !== "en" && language !== "zh-CN")
    throw new Error(`不支持的语言：${String(language)}`);
  const root = fs.realpathSync(inputRoot);
  const pkg = JSON.parse(
    fs.readFileSync(path.join(root, "package.json"), "utf8"),
  ) as Record<string, unknown>;
  if (
    pkg.name !== PRODUCT.name ||
    typeof pkg.version !== "string" ||
    !/^\d+\.\d+\.\d+(?:-[\w.-]+)?$/.test(pkg.version)
  )
    throw new Error("后端产品包名或版本无效");
  let contentRoot = root;
  if (language === "zh-CN") {
    noLink(path.join(root, "localized"));
    contentRoot = path.join(root, "localized/zh-CN");
    noLink(contentRoot);
    if (!fs.existsSync(contentRoot)) throw new Error("缺少中文内容");
  }
  const skillsDir = path.join(contentRoot, "skills");
  noLink(skillsDir);
  const result: ProductCatalog = {
    schemaVersion: 1,
    packageVersion: pkg.version,
    language,
    skills: [],
    agents: [],
    commands: [],
  };
  const ids = fs.existsSync(skillsDir) ? fs.readdirSync(skillsDir).sort() : [];
  // Inspect all links before reading an entry so malformed contents cannot hide links.
  for (const id of ids) noLink(path.join(skillsDir, id));
  for (const id of ids) {
    const skillRoot = path.join(skillsDir, id);
    if (!fs.statSync(skillRoot).isDirectory()) continue;
    if (!/^(bec|cc)-[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id))
      throw new Error(`技能 ID 命名空间无效：${id}`);
    let sourcePackage: string = PRODUCT.name,
      version = pkg.version;
    if (id.startsWith("cc-")) {
      const lockFile = path.join(root, "common-content.lock.json");
      noLink(lockFile);
      if (!fs.existsSync(lockFile)) throw new Error("公共技能缺少来源锁");
      const lock = JSON.parse(fs.readFileSync(lockFile, "utf8")) as {
        catalogs: Record<InstallLanguage, Omit<ContentCatalog, "root">>;
      };
      const source = lock.catalogs?.[language]?.skills.find(
        (item) => item.id === id,
      );
      if (!source) throw new Error(`公共来源锁缺少技能：${id}`);
      sourcePackage = source.sourcePackage;
      version = source.version;
    }
    const files = collectSkillResources(skillRoot);
    if (!files.some((file) => file.relativePath === "SKILL.md"))
      throw new Error(`缺少技能入口：${id}`);
    documentName(path.join(skillRoot, "SKILL.md"), id);
    result.skills.push({ id, sourcePackage, version, files });
  }
  for (const kind of ["agents", "commands"] as const) {
    const directory = path.join(contentRoot, kind);
    noLink(directory);
    if (!fs.existsSync(directory)) continue;
    for (const file of fs.readdirSync(directory).sort()) {
      const full = path.join(directory, file);
      noLink(full);
      if (!file.endsWith(".md") || !fs.statSync(full).isFile()) continue;
      const id = file.slice(0, -3);
      if (!/^bec-[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id))
        throw new Error(`角色或命令 ID 命名空间无效：${id}`);
      documentName(full, id);
      result[kind].push(id);
    }
  }
  return result;
}
