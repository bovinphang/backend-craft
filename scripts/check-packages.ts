import fs from "node:fs";
import path from "node:path";
import { readProductCatalog } from "../src/content/catalog.js";
import { readCommonCatalog } from "../src/content/common.js";
import { PRODUCT } from "../src/product.js";
export function checkPackages(productRoot: string): void {
  for (const language of ["en", "zh-CN"] as const) {
    const catalog = readProductCatalog(productRoot, language);
    if (
      catalog.skills.length !== 34 ||
      catalog.agents.length !== 8 ||
      catalog.commands.length !== 8
    )
      throw new Error("分发内容数量不完整");
    readCommonCatalog(productRoot, language);
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
  if (pkg.dependencies["@bovinphang/craft-common"] !== "1.0.1")
    throw new Error("公共依赖必须精确为 1.0.1");
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
