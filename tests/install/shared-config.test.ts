import test from "node:test";
import { sharedEntryStatus } from "../../src/install/shared-config/index.js";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { parse as parseToml } from "smol-toml";
import {
  entryHash,
  planSharedEntry,
} from "../../src/install/shared-config/index.js";
import type { OwnedEntry } from "../../src/install/shared-config/types.js";
import {
  planProductWrites,
  readPlanned,
  writePlanned,
} from "../../src/install/product-plan.js";
function fixture(
  t: { after(fn: () => void): void },
  name: string,
  body: string,
) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "bec-shared-"));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const file = path.join(root, name);
  fs.writeFileSync(file, body);
  return file;
}
function entry(kind: OwnedEntry["kind"], value: unknown): OwnedEntry {
  const draft =
    kind === "text-marker"
      ? { kind, id: "backend-craft", value: String(value), createdFile: false }
      : kind === "json-hook"
        ? {
            kind,
            id: "backend-craft-hook",
            event: "SessionStart",
            value: value as Record<string, unknown>,
            createdFile: false,
          }
        : {
            kind,
            id: "backend-craft",
            path: ["profiles", "backend-craft"],
            value,
            createdFile: false,
          };
  return { ...draft, hash: entryHash(draft) } as OwnedEntry;
}
function stage(
  file: string,
  e: OwnedEntry,
  action: "upsert" | "remove",
  previous?: OwnedEntry,
) {
  const change = planSharedEntry(file, e, action, previous);
  if (change) writePlanned(file, change.after);
  return change;
}
test("文本共享片段安装/卸载保留用户和前端字节，overlay 连续可读", async (t) => {
  const body =
      "用户正文\r\n<!-- frontend-craft:start -->\nF\n<!-- frontend-craft:end -->\n尾部\n",
    file = fixture(t, "AGENTS.md", body),
    e = entry("text-marker", "后端规范");
  const changes = await planProductWrites(async () => {
    assert.ok(stage(file, e, "upsert"));
    assert.match(readPlanned(file).toString(), /backend-craft:start/);
    assert.ok(stage(file, e, "remove", e));
    assert.equal(readPlanned(file).toString(), body);
  });
  assert.equal(changes.length, 0);
  assert.equal(fs.readFileSync(file, "utf8"), body);
});
test("未知同名、重复、损坏或被修改的文本片段均保留", async (t) => {
  const e = entry("text-marker", "标准");
  for (const body of [
    "<!-- backend-craft:start -->\n用户\n<!-- backend-craft:end -->",
    "<!-- backend-craft:start -->",
    "<!-- backend-craft:end -->",
    "<!-- backend-craft:start -->\n标准\n<!-- backend-craft:end -->\n<!-- backend-craft:start -->",
  ]) {
    const file = fixture(t, "CLAUDE.md", body);
    await planProductWrites(async () => {
      assert.equal(stage(file, e, "upsert", e), undefined);
      assert.equal(stage(file, e, "remove", e), undefined);
    });
    assert.equal(fs.readFileSync(file, "utf8"), body);
  }
});
test("JSON 只维护本产品键，用户增补键和其他插件 hook 保留", async (t) => {
  const file = fixture(
      t,
      "settings.json",
      JSON.stringify({
        user: true,
        hooks: { SessionStart: [{ command: "frontend-craft" }] },
      }),
    ),
    e = entry("json-path", { enabled: true }),
    h = entry("json-hook", { command: "backend-craft" });
  await planProductWrites(async () => {
    stage(file, e, "upsert");
    stage(file, h, "upsert");
    const current = JSON.parse(readPlanned(file).toString());
    current.extra = 42;
    writePlanned(file, Buffer.from(JSON.stringify(current)));
    stage(file, e, "remove", e);
    stage(file, h, "remove", h);
    const actual = JSON.parse(readPlanned(file).toString());
    assert.equal(actual.user, true);
    assert.equal(actual.extra, 42);
    assert.deepEqual(actual.hooks.SessionStart, [
      { command: "frontend-craft" },
    ]);
  });
});
test("结构配置拒绝损坏/重复键/原型路径，修改后的条目保留", async (t) => {
  for (const body of ["{", '{"a":1,"a":2}']) {
    const file = fixture(t, "settings.json", body);
    assert.throws(
      () => planSharedEntry(file, entry("json-path", 1), "upsert"),
      /配置|重复/,
    );
  }
  const file = fixture(
    t,
    "settings.json",
    '{"profiles":{"backend-craft":"user"}}',
  );
  assert.equal(
    planSharedEntry(
      file,
      entry("json-path", 1),
      "remove",
      entry("json-path", 1),
    ),
    undefined,
  );
  assert.throws(
    () =>
      planSharedEntry(
        file,
        { ...entry("json-path", 1), path: ["__proto__", "bad"] } as OwnedEntry,
        "upsert",
      ),
    /路径/,
  );
});
test("TOML 保留注释未知表字节，只移除有摘要证明的追加片段", async (t) => {
  const body = '# 用户注释\n[other]\nvalue = "前端"\n',
    file = fixture(t, "config.toml", body),
    e = entry("toml-key", { model: "local" });
  await planProductWrites(async () => {
    stage(file, e, "upsert");
    assert.equal(
      (
        parseToml(readPlanned(file).toString()).profiles as Record<
          string,
          unknown
        >
      )["backend-craft"] !== undefined,
      true,
    );
    assert.ok(readPlanned(file).toString().startsWith(body));
    stage(file, e, "remove", e);
    assert.equal(readPlanned(file).toString(), body);
  });
});
test("TOML 未知同名表不接管，用户改片段或坏格式不覆盖", async (t) => {
  const e = entry("toml-key", { model: "local" }),
    file = fixture(
      t,
      "config.toml",
      '[profiles.backend-craft]\nmodel="user"\n',
    );
  assert.equal(planSharedEntry(file, e, "upsert"), undefined);
  const bad = fixture(t, "config.toml", "[broken");
  assert.throws(() => planSharedEntry(bad, e, "upsert"), /配置/);
});

test("共享 JSON/TOML 健康检查只比较本产品条目，用户配置变动保留健康", async (t) => {
  for (const kind of ["json-path", "json-hook", "toml-key"] as const) {
    const file = fixture(
        t,
        kind === "toml-key" ? "config.toml" : "settings.json",
        kind === "toml-key"
          ? '# 用户注释\n[other]\nvalue="user"\n'
          : '{"user":true}',
      ),
      e = entry(
        kind,
        kind === "json-hook"
          ? { command: "backend-craft" }
          : { model: "local" },
      );
    await planProductWrites(async () => {
      stage(file, e, "upsert");
      assert.equal(sharedEntryStatus(file, e), "healthy");
      let body = readPlanned(file).toString();
      body =
        kind === "toml-key"
          ? body + "\n# 用户新增注释\n"
          : body.replace('"user": true', '"user": false');
      writePlanned(file, Buffer.from(body));
      assert.equal(sharedEntryStatus(file, e), "healthy");
      writePlanned(
        file,
        Buffer.from(
          body.replace(
            kind === "json-hook" ? '"backend-craft"' : '"local"',
            kind === "json-hook" ? '"user-changed"' : '"changed"',
          ),
        ),
      );
      assert.notEqual(sharedEntryStatus(file, e), "healthy");
    });
  }
});
test("移除已缺失的共享入口不会重新创建空文件", async (t) => {
  for (const kind of ["text-marker", "json-path", "toml-key"] as const) {
    const file = fixture(t, "entry-" + kind, kind === "toml-key" ? "" : "{}");
    fs.unlinkSync(file);
    const e = entry(kind, kind === "text-marker" ? "body" : { enabled: true });
    const mutations = await planProductWrites(async () => {
      stage(file, e, "remove", e);
    });
    assert.equal(mutations.length, 0);
    assert.equal(fs.existsSync(file), false);
  }
});

test("用户改写的 JSON hook 在退役或卸载时保留并报告冲突", async (t) => {
  const file = fixture(
      t,
      "settings.json",
      '{"hooks":{"SessionStart":[{"command":"frontend-craft"}]}}',
    ),
    e = entry("json-hook", { command: "backend-craft" });
  await planProductWrites(async () => {
    stage(file, e, "upsert");
    writePlanned(
      file,
      Buffer.from(
        readPlanned(file)
          .toString()
          .replace('"backend-craft"', '"user-custom-command"'),
      ),
    );
    const before = readPlanned(file);
    assert.equal(stage(file, e, "remove", e), undefined);
    assert.deepEqual(readPlanned(file), before);
  });
});
