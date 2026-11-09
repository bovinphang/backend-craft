import fs from "node:fs";
import path from "node:path";
import { createInstallSession } from "@bovinphang/craft-common";
import {
  PRODUCT_DEFINITION,
  LEGACY_SKILL_IDS,
  toProductContext,
} from "../product.js";
import { readManifest, manifestPath, resolveReference } from "./manifest.js";
import { MANIFEST_CODEC } from "./manifest-codec.js";
import { createInstallContext, getRuntimeTarget } from "./paths.js";
import { RUNTIMES, getRuntime } from "./registry.js";
import type { InstallContext } from "./types.js";
export interface MigrationFinding {
  file: string;
  line?: number;
  id: string;
  replacement: string;
  kind: "rename" | "legacy-install" | "conflict";
  message: string;
}
export interface MigrationReport {
  findings: MigrationFinding[];
  errors: string[];
  exitCode: 0 | 1 | 2;
}
export function inspectLegacyInstall(ctx: InstallContext): {
  findings: MigrationFinding[];
  roots: string[];
} {
  const manifest = readManifest(manifestPath(ctx)),
    context = toProductContext(ctx),
    previous = manifest
      ? MANIFEST_CODEC.decode(Buffer.from(JSON.stringify(manifest)), context)
      : undefined;
  const session = createInstallSession({
    definition: PRODUCT_DEFINITION,
    context,
    previous,
    common: previous?.common,
    action: "update",
  });
  const referenceDir =
    getRuntimeTarget(ctx, getRuntime(ctx.runtime)).skillsDir ??
    path.join(ctx.baseDir, "backend-craft/reference-skills");
  const findings: MigrationFinding[] = [],
    roots: string[] = [];
  for (const [id, replacement] of Object.entries(LEGACY_SKILL_IDS)) {
    const root = path.join(referenceDir, id);
    try {
      fs.lstatSync(root);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") continue;
      throw error;
    }
    try {
      session.retireTree(root, { rejectUnknown: true });
      roots.push(root);
      findings.push({
        file: root,
        id,
        replacement,
        kind: "legacy-install",
        message: "旧入口全部由本产品托管且未修改，可随事务退役",
      });
    } catch {
      findings.push({
        file: root,
        id,
        replacement,
        kind: "conflict",
        message: "旧入口包含用户修改、未知文件、链接或所有权不明；请先处理",
      });
    }
  }
  return { findings, roots };
}
const excluded = new Set([
  ".git",
  "node_modules",
  "dist",
  "build",
  "target",
  ".venv",
  "venv",
  ".superpowers",
  "reports",
  "skill-packages",
  "npm-packages",
  "sessions",
  "history",
  "logs",
  "cache",
  ".ssh",
  ".aws",
  ".azure",
  ".kube",
]);
const sensitive =
  /^\.env(?:\.|$)|credential|secret|password|private[-_]key|auth\.json$|\.(?:pem|key|p12|pfx)$/i;
export function checkMigration(input: {
  cwd: string;
  productRoot: string;
  home?: string;
  env?: NodeJS.ProcessEnv;
  runtime?: string;
  isGlobal: boolean;
}): MigrationReport {
  const report: MigrationReport = { findings: [], errors: [], exitCode: 0 },
    seen = new Set<string>();
  let count = 0;
  const scan = (file: string, depth = 0): void => {
    if (++count > 10000 || depth > 12)
      throw new Error("迁移引用扫描达到上限，结果不完整");
    if (seen.has(file) || sensitive.test(path.basename(file))) return;
    seen.add(file);
    const stat = fs.lstatSync(file);
    if (stat.isSymbolicLink()) return;
    if (stat.isDirectory()) {
      if (!excluded.has(path.basename(file)))
        for (const child of fs.readdirSync(file).sort())
          scan(path.join(file, child), depth + 1);
      return;
    }
    if (
      !stat.isFile() ||
      stat.size > 262144 ||
      !/\.(?:md|mdx|txt|json|ya?ml|toml|[cm]?[jt]sx?|sh|ps1)$/i.test(file)
    )
      return;
    const body = fs.readFileSync(file);
    if (body.includes(0)) return;
    for (const [index, line] of body.toString("utf8").split(/\r?\n/).entries())
      for (const match of line.matchAll(
        /(?<![a-z0-9-])(bec-[a-z0-9-]+)(?![a-z0-9-])/g,
      )) {
        const id = match[1],
          replacement = LEGACY_SKILL_IDS[id];
        if (replacement)
          report.findings.push({
            file,
            line: index + 1,
            id,
            replacement,
            kind: "rename",
            message: "旧通用入口已迁入 common；领域入口仍保留",
          });
      }
  };
  try {
    if (input.runtime) getRuntime(input.runtime);
    if (!input.isGlobal) scan(path.resolve(input.cwd));
    for (const runtime of input.runtime
      ? [input.runtime]
      : Object.keys(RUNTIMES)) {
      const ctx = createInstallContext({ ...input, runtime });
      if (input.isGlobal) {
        const manifest = readManifest(manifestPath(ctx));
        for (const ref of manifest?.files ?? []) {
          const file = resolveReference(ctx, ref);
          if (fs.existsSync(file)) scan(file);
        }
      }
      report.findings.push(...inspectLegacyInstall(ctx).findings);
    }
  } catch (error) {
    report.errors.push(error instanceof Error ? error.message : "迁移检查失败");
  }
  report.exitCode =
    report.errors.length || report.findings.some((f) => f.kind === "conflict")
      ? 2
      : report.findings.length
        ? 1
        : 0;
  return report;
}
