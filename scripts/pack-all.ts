import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { runTests } from "./run-tests.js";
import { packSkills } from "./pack-skills.js";
import { packOpenClaw } from "./pack-openclaw.js";
import { checkPackages } from "./check-packages.js";
import { npmPack } from "./archive.js";
const root = path.resolve(import.meta.dirname, "..");
const build = spawnSync(
  process.execPath,
  ["--import", "tsx", "scripts/build.ts"],
  { cwd: root, stdio: "inherit", windowsHide: true },
);
if (build.status !== 0) throw new Error("构建失败");
if (runTests(root) !== 0) throw new Error("测试失败");
const productRoot = path.join(root, "dist/package");
checkPackages(productRoot);
const output = fs.mkdtempSync(path.join(root, "npm-packages-")),
  skills = packSkills(productRoot, path.join(output, "skills")),
  native = path.join(output, "openclaw");
packOpenClaw(productRoot, native);
const archives = [
  npmPack(productRoot, output),
  npmPack(native, output),
  ...skills.map((skill) => npmPack(skill.packagePath, output)),
];
fs.writeFileSync(
  path.join(output, "archives.json"),
  JSON.stringify(
    archives.map((file) => path.basename(file)),
    null,
    2,
  ) + "\n",
);
console.log("完整打包完成：" + archives.length + " 个归档，目录 " + output);
