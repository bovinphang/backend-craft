import path from "node:path";
import { inspectWorkspace } from "@bovinphang/craft-common";
import { BUILD_MARKERS, LANGUAGE_IDS, sourceLanguage } from "./evidence.js";
import { BACKEND_FRAMEWORK_DETECTORS } from "./frameworks.js";
import type { Inspection, InspectOptions, LanguageId } from "./types.js";
const within = (root: string, target: string) => {
  const relative = path.relative(root, target);
  return (
    !path.isAbsolute(relative) &&
    relative !== ".." &&
    !relative.startsWith(".." + path.sep)
  );
};
export function inspectProject(options: InspectOptions): Inspection {
  const facts = inspectWorkspace({
    ...options,
    detectors: BACKEND_FRAMEWORK_DETECTORS,
  });
  const report: Inspection = {
    ...facts,
    projects: facts.units.flatMap((unit) => {
      const languages = unit.languages.filter((l) =>
          LANGUAGE_IDS.includes(l),
        ) as LanguageId[],
        buildFiles = unit.buildFiles.filter((f) =>
          Object.hasOwn(BUILD_MARKERS, path.basename(f)),
        );
      if (!languages.length && !buildFiles.length) return [];
      return [
        {
          root: unit.root,
          languages,
          buildFiles,
          evidence: unit.evidence.filter(
            (f) =>
              Object.hasOwn(BUILD_MARKERS, path.basename(f)) ||
              sourceLanguage(f),
          ),
          ambiguous: !languages.length || !buildFiles.length || unit.ambiguous,
        },
      ];
    }),
  };
  if (options.taskPath) {
    const task = path.resolve(
      facts.workspace,
      path.relative(
        path.resolve(options.workspace),
        path.resolve(options.workspace, options.taskPath),
      ),
    );
    const closest = report.projects
      .filter((p) => within(p.root, task))
      .sort((a, b) => b.root.length - a.root.length)[0];
    report.projects = closest ? [closest] : [];
    if (!closest) report.warnings.push("任务路径没有可确认的项目根");
  }
  return report;
}
