import fs from "node:fs";
import path from "node:path";
import { PRODUCT } from "../product.js";
export function findProductRoot(start: string): string {
  let current = path.resolve(start);
  for (let i = 0; i < 5; i++) {
    const file = path.join(current, "package.json");
    if (
      fs.existsSync(file) &&
      JSON.parse(fs.readFileSync(file, "utf8")).name === PRODUCT.name
    ) {
      const pkg = JSON.parse(fs.readFileSync(file, "utf8"));
      if (!pkg.scripts?.["prepare:content"]) return current;
      const output = path.join(current, "dist/package");
      if (!fs.existsSync(path.join(output, "common-content.lock.json")))
        throw new Error("请先运行 pnpm run build");
      return output;
    }
    const parent = path.dirname(current);
    if (parent === current) break;
    current = parent;
  }
  throw new Error("无法定位后端产品资源根");
}
