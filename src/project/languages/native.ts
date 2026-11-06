import fs from "node:fs";
import path from "node:path";
import type { Project, StageSpec } from "../types.js";
import { readOptional, stage } from "./shared.js";
interface Preset {
  name: string;
  hidden?: boolean;
  configurePreset?: string;
  binaryDir?: string;
}
export function nativeStages(p: Project): StageSpec[] {
  const body = readOptional(p.root, "CMakePresets.json");
  if (!body) return [];
  const data = JSON.parse(body) as {
    include?: unknown;
    configurePresets?: Preset[];
    buildPresets?: Preset[];
    testPresets?: Preset[];
  };
  // Includes/inheritance/macros need an explicit project configuration; do not guess.
  if (data.include) return [];
  const result: StageSpec[] = [];
  for (const build of data.buildPresets ?? []) {
    if (build.hidden || !build.configurePreset) continue;
    const configure = data.configurePresets?.find(
      (item) => item.name === build.configurePreset,
    );
    if (!configure?.binaryDir) continue;
    const raw = configure.binaryDir.replaceAll("${sourceDir}", p.root);
    if (raw.includes("${") || raw.includes("$env{") || raw.includes("$penv{"))
      continue;
    const dir = path.resolve(p.root, raw),
      relative = path.relative(p.root, dir);
    if (
      relative === ".." ||
      relative.startsWith(`..${path.sep}`) ||
      path.isAbsolute(relative)
    )
      continue;
    if (!fs.existsSync(path.join(dir, "CMakeCache.txt"))) continue;
    result.push(
      stage(p, `native:${build.name}:build`, "build", "cmake", [
        "--build",
        "--preset",
        build.name,
      ]),
    );
    for (const testing of data.testPresets ?? [])
      if (!testing.hidden && testing.configurePreset === build.configurePreset)
        result.push(
          stage(p, `native:${testing.name}:test`, "test", "ctest", [
            "--preset",
            testing.name,
            "--output-on-failure",
            "--no-tests=error",
          ]),
        );
  }
  return result;
}
