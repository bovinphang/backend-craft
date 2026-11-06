import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
interface Fixture {
  language: string;
  source: string;
  good: string;
  bad: string;
}
export interface LanguageEvidence {
  language: string;
  status: "passed" | "missing";
  redExit: number;
  greenExit?: number;
  red: unknown;
  green?: unknown;
  inspection: unknown;
}
export function verifyLanguageFixtures(
  root: string,
  selected?: string[],
): LanguageEvidence[] {
  const fixtures = JSON.parse(
    fs.readFileSync(
      path.join(root, "tests/fixtures/projects/index.json"),
      "utf8",
    ),
  ) as Fixture[];
  if (selected?.some((id) => !fixtures.some((f) => f.language === id)))
    throw new Error("未知夹具语言");
  const result: LanguageEvidence[] = [];
  for (const fixture of fixtures.filter(
    (f) => !selected || selected.includes(f.language),
  )) {
    const temp = fs.mkdtempSync(
      path.join(os.tmpdir(), "bec-language-" + fixture.language + "-"),
    );
    try {
      fs.cpSync(
        path.join(root, "tests/fixtures/projects", fixture.language),
        temp,
        { recursive: true },
      );
      const cli = path.join(root, "dist/bin/backend-craft.js");
      const run = (argv: string[]) => {
        const value = spawnSync(process.execPath, [cli, ...argv], {
          cwd: temp,
          encoding: "utf8",
          timeout: 180000,
          windowsHide: true,
        });
        if (value.error) throw value.error;
        let json: unknown;
        try {
          json = JSON.parse(value.stdout);
        } catch {
          throw new Error("语言 CLI 输出不是 JSON：" + value.stderr);
        }
        return { exit: value.status ?? 1, json };
      };
      const inspection = run(["project", "inspect", "--json"]);
      if (inspection.exit !== 0) throw new Error("项目识别失败");
      const projects = (
        inspection.json as { projects: Array<{ languages: string[] }> }
      ).projects;
      if (
        projects.length !== 1 ||
        !projects[0].languages.includes(fixture.language)
      )
        throw new Error("语言证据不匹配：" + fixture.language);
      const source = path.join(temp, fixture.source),
        good = fs.readFileSync(source, "utf8");
      if (
        !good.includes(fixture.good) ||
        good.indexOf(fixture.good) !== good.lastIndexOf(fixture.good)
      )
        throw new Error("缺陷注入点必须唯一");
      fs.writeFileSync(source, good.replace(fixture.good, fixture.bad));
      const red = run(["validate", "--json"]);
      if (red.exit === 2) {
        const problems = (red.json as { problems?: string[] }).problems;
        if (
          !problems?.length ||
          problems.some((p) => !p.startsWith("缺少必需工具："))
        )
          throw new Error(
            "夹具配置不完整，不能标记为缺工具：" + fixture.language,
          );
        result.push({
          language: fixture.language,
          status: "missing",
          redExit: 2,
          red: red.json,
          inspection: inspection.json,
        });
        continue;
      }
      if (
        red.exit !== 1 ||
        !(
          red.json as { results: Array<{ id: string; status: string }> }
        ).results.some((r) => r.id === "test" && r.status === "failed")
      )
        throw new Error("未观察到真实测试失败：" + fixture.language);
      fs.writeFileSync(source, good);
      const green = run(["validate", "--json"]);
      if (
        green.exit !== 0 ||
        !(
          green.json as { results: Array<{ id: string; status: string }> }
        ).results.some((r) => r.id === "test" && r.status === "passed")
      )
        throw new Error(
          "修复后验证失败：" +
            fixture.language +
            " " +
            JSON.stringify(green.json),
        );
      result.push({
        language: fixture.language,
        status: "passed",
        redExit: red.exit,
        greenExit: green.exit,
        red: red.json,
        green: green.json,
        inspection: inspection.json,
      });
    } finally {
      fs.rmSync(temp, { recursive: true, force: true });
    }
  }
  return result;
}
if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const args = process.argv.slice(2);
  if (
    args.some((arg, i) => arg !== "--language" && args[i - 1] !== "--language")
  )
    throw new Error("只支持 --language <语言>");
  const selected = args.flatMap((arg, i) =>
    arg === "--language" ? [args[i + 1]] : [],
  );
  const root = path.resolve(import.meta.dirname, ".."),
    evidence = verifyLanguageFixtures(
      root,
      selected.length ? selected : undefined,
    );
  const output = path.join(
    root,
    "reports/backend-craft/language-fixtures.json",
  );
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, JSON.stringify(evidence, null, 2) + "\n");
  console.log(JSON.stringify(evidence, null, 2));
  process.exitCode = evidence.some((item) => item.status === "missing") ? 2 : 0;
}
