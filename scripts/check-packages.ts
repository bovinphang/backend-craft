import fs from "node:fs";
import path from "node:path";
import { readProductCatalog } from "../src/content/catalog.js";
import { readCommonCatalog } from "../src/content/common.js";
import { PRODUCT } from "../src/product.js";
export function checkPackages(productRoot: string): void {
  const commonVersions=new Set<string>();
  for (const language of ["en", "zh-CN"] as const) {
    const catalog = readProductCatalog(productRoot, language);
    if (
      catalog.skills.length !== 42 ||
      catalog.agents.length !== 8 ||
      catalog.commands.length !== 8
    )
      throw new Error("分发内容数量不完整");
    commonVersions.add(readCommonCatalog(productRoot, language).packageVersion);
  }
  for (const file of [
    "dist/bin/backend-craft.js",
    "dist/openclaw/index.js",
    "dist/hooks/bec-session-start.js",
    ".claude-plugin/plugin.json",
    ".claude-plugin/marketplace.json",
    "openclaw.plugin.json",
    "hooks/hooks.json",
    "README.md",
    "README.zh-CN.md",
    "LICENSE",
  ])
    if (!fs.statSync(path.join(productRoot, file)).isFile())
      throw new Error("缺少分发文件：" + file);
  const pkg = JSON.parse(
    fs.readFileSync(path.join(productRoot, "package.json"), "utf8"),
  );
  const declared=pkg.dependencies?.["@bovinphang/craft-common"];
  if(typeof declared!=="string" || !/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/.test(declared) || commonVersions.size!==1 || !commonVersions.has(declared))
    throw new Error("公共依赖必须精确匹配已校验的双语公共来源版本");
  for (const file of [".claude-plugin/plugin.json", "openclaw.plugin.json"]) {
    const metadata = JSON.parse(
      fs.readFileSync(path.join(productRoot, file), "utf8"),
    );
    if (
      metadata.version !== PRODUCT.version ||
      (metadata.name !== "backend-craft" && metadata.id !== "backend-craft")
    )
      throw new Error("原生元数据身份无效");
  }
}
