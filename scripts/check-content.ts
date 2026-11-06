import path from "node:path";
import { fileURLToPath } from "node:url";
import { readProductCatalog } from "../src/content/catalog.js";
import { readCommonCatalog } from "../src/content/common.js";
export function checkContent(root: string): void {
  for (const lang of ["en", "zh-CN"] as const) {
    const c = readProductCatalog(root, lang);
    if (
      c.skills.length !== 34 ||
      c.agents.length !== 8 ||
      c.commands.length !== 8
    )
      throw new Error("内容入口不完整");
    readCommonCatalog(root, lang);
  }
}
if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  checkContent(path.resolve(import.meta.dirname, ".."));
  console.log("双语内容与来源锁完整");
}
