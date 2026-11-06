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
    )
      return current;
    const parent = path.dirname(current);
    if (parent === current) break;
    current = parent;
  }
  throw new Error("无法定位后端产品资源根");
}
