import fs from "node:fs";
import path from "node:path";
import { readProductCatalog } from "../src/content/catalog.js";
import { document } from "../src/install/adapters/shared.js";
export interface PackageSummary {
  id: string;
  version: string;
  sourcePackage: string;
  packagePath: string;
}
export function packSkills(
  productRoot: string,
  outDir: string,
): PackageSummary[] {
  const catalog = readProductCatalog(productRoot, "en"),
    zh = readProductCatalog(productRoot, "zh-CN"),
    result: PackageSummary[] = [];
  fs.mkdirSync(outDir, { recursive: true });
  for (const skill of catalog.skills) {
    const dest = path.join(outDir, skill.id);
    if (fs.existsSync(dest))
      throw new Error("技能包输出已存在；请指定新的空输出目录");
    fs.mkdirSync(dest);
    for (const [contentRoot, record, prefix] of [
      [productRoot, skill, ""],
      [
        path.join(productRoot, "localized/zh-CN"),
        zh.skills.find((s) => s.id === skill.id)!,
        "localized/zh-CN",
      ],
    ] as const)
      for (const file of record.files) {
        const target = path.join(dest, prefix, file.relativePath);
        fs.mkdirSync(path.dirname(target), { recursive: true });
        fs.copyFileSync(
          path.join(contentRoot, "skills", skill.id, file.relativePath),
          target,
        );
      }
    const source =
        skill.sourcePackage === "@bovinphang/craft-common"
          ? "craft-common"
          : "backend-craft",
      metadata = {
        id: skill.id,
        version: skill.version,
        sourcePackage: skill.sourcePackage,
        repository: "https://github.com/bovinphang/" + source,
        files: skill.files,
        localized: { "zh-CN": zh.skills.find((s) => s.id === skill.id)!.files },
      };
    fs.writeFileSync(
      path.join(dest, "origin.json"),
      JSON.stringify(metadata, null, 2) + "\n",
    );
    fs.copyFileSync(
      path.join(productRoot, "LICENSE"),
      path.join(dest, "LICENSE"),
    );
    const description = document(
      fs.readFileSync(path.join(dest, "SKILL.md"), "utf8"),
    ).description;
    fs.writeFileSync(
      path.join(dest, "package.json"),
      JSON.stringify(
        {
          name: "@bovinphang/" + skill.id,
          version: skill.version,
          type: "module",
          license: "MIT",
          description,
          repository: {
            type: "git",
            url: metadata.repository,
            directory: "skills/" + skill.id,
          },
          files: [
            "SKILL.md",
            "references",
            "scripts",
            "data",
            "styles",
            "assets",
            "localized",
            "origin.json",
            "README.md",
            "LICENSE",
          ],
          publishConfig: { access: "public" },
        },
        null,
        2,
      ) + "\n",
    );
    fs.writeFileSync(
      path.join(dest, "README.md"),
      "# " +
        skill.id +
        "\n\n来源：" +
        metadata.sourcePackage +
        "@" +
        metadata.version +
        "。完整复制本目录到宿主 Skill 目录即可使用；中文入口位于 localized/zh-CN。保留全部引用资源和许可证。\n",
    );
    result.push({
      id: skill.id,
      version: skill.version,
      sourcePackage: skill.sourcePackage,
      packagePath: dest,
    });
  }
  fs.writeFileSync(
    path.join(outDir, "index.json"),
    JSON.stringify(
      result.map((p) => ({ ...p, packagePath: p.id })),
      null,
      2,
    ) + "\n",
  );
  return result;
}
