import fs from "node:fs";
import path from "node:path";
import { document } from "../src/install/adapters/shared.js";
import { readProductCatalog } from "../src/content/catalog.js";
import { PRODUCT } from "../src/product.js";
export function packOpenClaw(productRoot: string, output: string): void {
  fs.mkdirSync(output, { recursive: true });
  if (fs.readdirSync(output).length) throw new Error("原生包需要空输出目录");
  for (const name of [
    "skills",
    "localized",
    "templates",
    "common-content.lock.json",
    "LICENSE",
    "README.md",
    "README.zh-CN.md",
    "openclaw.plugin.json",
  ])
    fs.cpSync(path.join(productRoot, name), path.join(output, name), {
      recursive: true,
      errorOnExist: true,
      force: false,
    });
  fs.cpSync(
    path.join(productRoot, "dist/openclaw"),
    path.join(output, "dist/openclaw"),
    { recursive: true },
  );
  for (const language of ["en", "zh-CN"] as const) {
    const content =
        language === "en"
          ? productRoot
          : path.join(productRoot, "localized/zh-CN"),
      dest = language === "en" ? output : path.join(output, "localized/zh-CN"),
      catalog = readProductCatalog(productRoot, language);
    for (const id of catalog.commands) {
      if (catalog.skills.some((s) => s.id === id)) continue;
      const parsed = document(
        fs.readFileSync(path.join(content, "commands", id + ".md"), "utf8"),
      );
      fs.mkdirSync(path.join(dest, "skills", id), { recursive: true });
      fs.writeFileSync(
        path.join(dest, "skills", id, "SKILL.md"),
        "---\nname: " +
          id +
          "\ndescription: " +
          JSON.stringify(parsed.description) +
          "\ndisable-model-invocation: true\n---\n\n" +
          parsed.body +
          "\n",
      );
    }
  }
  fs.writeFileSync(
    path.join(output, "package.json"),
    JSON.stringify(
      {
        name: "@bovinphang/backend-craft-openclaw",
        version: PRODUCT.version,
        type: "module",
        license: "MIT",
        description: "后端工程专业原生插件；CLI 与原生渠道二选一",
        files: [
          "dist",
          "skills",
          "localized",
          "templates",
          "common-content.lock.json",
          "openclaw.plugin.json",
          "README.md",
          "README.zh-CN.md",
          "LICENSE",
        ],
        openclaw: { extensions: ["./dist/openclaw/index.js"] },
        engines: { node: ">=22.0.0" },
        publishConfig: { access: "public" },
      },
      null,
      2,
    ) + "\n",
  );
}
