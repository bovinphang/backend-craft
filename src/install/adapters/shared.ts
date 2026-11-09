import fs from "node:fs";
import path from "node:path";
import { parseDocument } from "yaml";
import { stringify } from "smol-toml";

import type { RuntimeAdapter } from "../registry.js";
import { readProductCatalog } from "../../content/catalog.js";
import { writeManaged } from "../manifest.js";
import { entryHash } from "../shared-config/index.js";
import { getRuntimeTarget } from "../paths.js";
import type { PlanningInstallContext } from "../types.js";
export function sharedText(
  ctx: PlanningInstallContext,
  file: string,
  value: string,
): void {
  const draft = {
    kind: "text-marker" as const,
    id: "backend-craft",
    value,
    createdFile: !ctx.session.exists(file),
  };
  ctx.session.editShared(file, { ...draft, hash: entryHash(draft) });
}
export function document(raw: string): {
  name: string;
  description: string;
  body: string;
} {
  const match = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(raw);
  if (!match) throw new Error("入口缺少元信息");
  const doc = parseDocument(match[1], { uniqueKeys: true });
  if (doc.errors.length) throw new Error("入口元信息无效");
  const data = doc.toJS() as { name: string; description: string };
  return { ...data, body: raw.slice(match[0].length).trim() };
}
export async function planCore(
  ctx: PlanningInstallContext,
  adapter: RuntimeAdapter,
): Promise<void> {
  const catalog = readProductCatalog(ctx.productRoot, ctx.language),
    { skillsDir } = getRuntimeTarget(ctx, adapter);
  const referenceDir =
    skillsDir ?? path.join(ctx.baseDir, "backend-craft/reference-skills");
  if (referenceDir)
    for (const skill of catalog.skills.filter(
      (s) => !skillsDir || s.id.startsWith("bec-"),
    ))
      for (const file of skill.files)
        writeManaged(
          ctx,
          path.join(referenceDir, skill.id, file.relativePath),
          fs.readFileSync(
            path.join(ctx.contentRoot, "skills", skill.id, file.relativePath),
          ),
        );
  if (adapter.capabilities.agents)
    for (const id of catalog.agents) {
      const raw = fs.readFileSync(
        path.join(ctx.contentRoot, "agents", id + ".md"),
        "utf8",
      );
      if (ctx.runtime === "codex") {
        const { name, description, body } = document(raw);
        writeManaged(
          ctx,
          path.join(ctx.baseDir, "agents", id + ".toml"),
          Buffer.from(
            stringify({ name, description, developer_instructions: body }),
          ),
        );
      } else
        writeManaged(
          ctx,
          path.join(ctx.baseDir, "agents", id + ".md"),
          Buffer.from(raw),
        );
    }
  if (
    adapter.capabilities.commands &&
    !(ctx.runtime === "copilot" && ctx.isGlobal)
  )
    for (const id of catalog.commands) {
      const raw = fs.readFileSync(
        path.join(ctx.contentRoot, "commands", id + ".md"),
        "utf8",
      );
      const dir =
        ctx.runtime === "windsurf"
          ? ctx.isGlobal
            ? "global_workflows"
            : "workflows"
          : ctx.runtime === "copilot"
            ? "prompts"
            : "commands";
      if (ctx.runtime === "openclaw") {
        if (catalog.skills.some((skill) => skill.id === id)) continue;
        const parsed = document(raw);
        writeManaged(
          ctx,
          path.join(referenceDir, id, "SKILL.md"),
          Buffer.from(
            "---\nname: " +
              id +
              "\ndescription: " +
              JSON.stringify(parsed.description) +
              "\ndisable-model-invocation: true\n---\n\n" +
              parsed.body +
              "\n",
          ),
        );
        continue;
      }
      writeManaged(
        ctx,
        path.join(
          ctx.baseDir,
          dir,
          id + (ctx.runtime === "copilot" ? ".prompt.md" : ".md"),
        ),
        Buffer.from(
          ctx.runtime === "copilot"
            ? "---\ndescription: " +
                JSON.stringify(document(raw).description) +
                "\n---\n\n" +
                document(raw).body
            : raw,
        ),
      );
    }
  if (adapter.capabilities.rules) {
    const root = path.join(ctx.contentRoot, "templates/shared/rules");
    const core = fs.readFileSync(path.join(root, "bec-core.md"), "utf8");
    if (!adapter.capabilities.skills) {
      const guide =
        core +
        "\n" +
        (ctx.language === "zh-CN"
          ? "以下是参考资料而非原生 Skill；按最近工程语言选择一个规范，再按任务选择领域方法。"
          : "These are reference documents, not native Skills. Select only the nearest project language and relevant domain methods.") +
        "\n\n" +
        catalog.skills
          .map(
            (s) =>
              "- [" +
              s.id +
              "](" +
              path
                .relative(
                  ctx.runtime === "copilot" && ctx.isGlobal
                    ? ctx.baseDir
                    : path.join(
                        ctx.baseDir,
                        ctx.runtime === "cline"
                          ? ctx.isGlobal
                            ? "Rules"
                            : ".clinerules"
                          : ctx.runtime === "trae"
                            ? ctx.isGlobal
                              ? "user_rules"
                              : "rules"
                            : "instructions",
                      ),
                  path.join(referenceDir, s.id, "SKILL.md"),
                )
                .split(path.sep)
                .join("/") +
              ")",
          )
          .join("\n") +
        "\n";
      if (ctx.runtime === "copilot" && ctx.isGlobal)
        sharedText(
          ctx,
          path.join(ctx.baseDir, "copilot-instructions.md"),
          guide,
        );
      else {
        const dest =
          ctx.runtime === "cline"
            ? path.join(
                ctx.baseDir,
                ctx.isGlobal ? "Rules" : ".clinerules",
                "backend-craft.md",
              )
            : ctx.runtime === "trae"
              ? path.join(
                  ctx.baseDir,
                  ctx.isGlobal ? "user_rules" : "rules",
                  "backend-craft.md",
                )
              : path.join(
                  ctx.baseDir,
                  "instructions/backend-craft.instructions.md",
                );
        writeManaged(
          ctx,
          dest,
          Buffer.from(
            (ctx.runtime === "copilot" ? '---\napplyTo: "**"\n---\n\n' : "") +
              guide,
          ),
        );
      }
    } else {
      const globs: Record<string, string> = {
        rust: "**/*.rs",
        go: "**/*.go",
        java: "**/*.java",
        python: "**/*.py",
        c: "**/*.{c,h}",
        cpp: "**/*.{cpp,cc,cxx,hpp,hxx}",
      };
      for (const name of fs
        .readdirSync(root)
        .filter((name) => name.endsWith(".md"))) {
        const key = name.slice(4, -3),
          glob = globs[key],
          body = fs.readFileSync(path.join(root, name), "utf8");
        const prefix =
          ctx.runtime === "cursor"
            ? "---\ndescription: Backend Craft " +
              key +
              "\nalwaysApply: " +
              String(key === "core") +
              "\n" +
              (glob ? "globs: " + JSON.stringify(glob) + "\n" : "") +
              "---\n\n"
            : ctx.runtime === "claude" && glob
              ? "---\npaths:\n  - " + JSON.stringify(glob) + "\n---\n\n"
              : ctx.runtime === "windsurf"
                ? "---\ntrigger: " +
                  (glob ? "glob" : "always_on") +
                  "\n" +
                  (glob ? "globs: " + JSON.stringify(glob) + "\n" : "") +
                  "---\n\n"
                : "";
        writeManaged(
          ctx,
          path.join(
            ctx.baseDir,
            "rules",
            ctx.runtime === "cursor" ? name.replace(/\.md$/, ".mdc") : name,
          ),
          Buffer.from(prefix + body),
        );
      }
    }
  }
  const context =
    ctx.runtime === "claude"
      ? path.join(ctx.baseDir, "CLAUDE.md")
      : ctx.runtime === "codex"
        ? path.join(ctx.isGlobal ? ctx.baseDir : ctx.cwd, "AGENTS.md")
        : ctx.runtime === "gemini"
          ? path.join(ctx.isGlobal ? ctx.baseDir : ctx.cwd, "GEMINI.md")
          : undefined;
  if (context) {
    const body = fs.readFileSync(
      path.join(ctx.contentRoot, "templates/shared/rules/bec-core.md"),
      "utf8",
    );
    sharedText(ctx, context, body.trim());
  }
}
export function adapterFor(
  id: string,
  flags: Partial<RuntimeAdapter["capabilities"]>,
  discovery: RuntimeAdapter["discovery"] = "documented",
  manualSteps: string[] = [],
): RuntimeAdapter {
  const adapter: RuntimeAdapter = {
    id,
    capabilities: {
      skills: true,
      agents: false,
      commands: false,
      hooks: false,
      rules: false,
      ...flags,
    },
    discovery,
    manualSteps,
    async plan(ctx) {
      await planCore(ctx, adapter);
    },
  };
  return adapter;
}
