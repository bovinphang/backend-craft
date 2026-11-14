import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createHash } from "node:crypto";
import { main } from "../../src/cli.js";
function fixture(t: { after(fn: () => void): void }) {
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), "bec-parity-"));
  t.after(() => fs.rmSync(cwd, { recursive: true, force: true }));
  const out: string[] = [],
    err: string[] = [];
  return {
    cwd,
    out,
    err,
    io: {
      cwd,
      home: path.join(cwd, "home"),
      productRoot: path.resolve("dist/package"),
      env: {},
      isTTY: false,
      stdout: (s: string) => out.push(s),
      stderr: (s: string) => err.push(s),
    },
  };
}
test("setup aliases and install defaults preview without writing", async (t) => {
  const f = fixture(t);
  assert.equal(
    await main(["setup", "codex", "--lang=zh-CN", "--dry-run", "--json"], f.io),
    0,
    f.err.join(""),
  );
  assert.equal(JSON.parse(f.out.join("")).status, "planned");
  assert.deepEqual(fs.readdirSync(f.cwd), []);
  f.out.length = 0;
  assert.equal(await main(["list", "--json"], f.io), 0);
  assert.equal(JSON.parse(f.out.join("")).length, 15);
});
test("discovered update and remove preserve language and force stays in backend ownership", async (t) => {
  const f = fixture(t);
  assert.equal(
    await main(["setup", "codex", "-l", "--lang=zh-CN", "--json"], f.io),
    0,
    f.err.join(""),
  );
  const manifest = path.join(f.cwd, ".codex/backend-craft.manifest.json");
  assert.equal(JSON.parse(fs.readFileSync(manifest, "utf8")).language, "zh-CN");
  f.out.length = 0;
  assert.equal(
    await main(["runtime", "upgrade", "-l", "--json"], f.io),
    0,
    f.err.join(""),
  );
  assert.equal(JSON.parse(fs.readFileSync(manifest, "utf8")).language, "zh-CN");
  fs.mkdirSync(path.join(f.cwd, ".claude"));
  const corrupt = path.join(f.cwd, ".claude/backend-craft.manifest.json");
  fs.writeFileSync(corrupt, "broken");
  f.out.length = 0;
  assert.equal(
    await main(["runtime", "upgrade", "-l", "--dry-run", "--json"], f.io),
    2,
  );
  assert.equal(JSON.parse(f.out.join("")).status, "planned");
  fs.unlinkSync(corrupt);
  const installed = JSON.parse(fs.readFileSync(manifest, "utf8"));
  const owned = installed.files.find(
    (entry: { root: string }) => entry.root === "baseDir",
  );
  fs.appendFileSync(path.join(f.cwd, ".codex", owned.path), "\nuser edit\n");
  const foreign = path.join(f.cwd, ".codex/frontend-craft.keep");
  fs.writeFileSync(foreign, "foreign");
  assert.equal(await main(["runtime", "remove", "-l", "--json"], f.io), 2);
  assert.equal(fs.existsSync(manifest), true);
  assert.equal(
    await main(["runtime", "remove", "-l", "--force", "--json"], f.io),
    0,
    f.err.join(""),
  );
  assert.equal(fs.existsSync(manifest), false);
  assert.equal(fs.readFileSync(foreign, "utf8"), "foreign");
});
test("metadata is synchronized and help documents self-management", async (t) => {
  const f = fixture(t);
  assert.equal(
    await main(["sync-metadata", "--check"], f.io),
    0,
    f.err.join(""),
  );
  await main(["--help"], f.io);
  assert.match(f.out.join(""), /update\|upgrade/);
  assert.doesNotMatch(f.out.join(""), /首版不提供/);
});

test("doctor rejects cache repair for other runtimes before running diagnostics", async (t) => {
  const f = fixture(t);
  assert.equal(
    await main(["doctor", "codex", "--fix-cache", "--json"], f.io),
    2,
  );
  assert.match(JSON.parse(f.out.join("")).error, /--fix-cache/);
  assert.deepEqual(fs.readdirSync(f.cwd), []);
});

test("metadata checks product skill versions in both languages", async (t) => {
  const f = fixture(t),
    root = path.join(f.cwd, "package");
  const write = (file: string, value: unknown) => {
    const target = path.join(root, file);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, JSON.stringify(value));
  };
  write("package.json", {
    name: "@bovinphang/backend-craft",
    version: "1.1.0",
    dependencies: { "@bovinphang/craft-common": "2.1.0" },
  });
  write(".claude-plugin/plugin.json", { version: "1.1.0" });
  write("openclaw.plugin.json", { version: "1.1.0" });
  write(".claude-plugin/marketplace.json", {
    plugins: [
      {
        name: "backend-craft",
        version: "1.1.0",
        source: { version: "1.1.0", package: "@bovinphang/backend-craft" },
      },
    ],
  });
  const catalogs = Object.fromEntries(
    ["en", "zh-CN"].map((language) => {
      const body = {
        schemaVersion: 1,
        packageName: "@bovinphang/craft-common",
        packageVersion: "2.1.0",
        language,
        skills: [],
      };
      return [
        language,
        {
          ...body,
          digest: createHash("sha256")
            .update(JSON.stringify(body))
            .digest("hex"),
        },
      ];
    }),
  );
  write("common-content.lock.json", {
    schemaVersion: 1,
    packageName: "@bovinphang/craft-common",
    packageVersion: "2.1.0",
    files: [],
    catalogs,
  });
  write("skills/metadata.json", [{ id: "bec-example", version: "1.1.0" }]);
  write("localized/zh-CN/skills/metadata.json", [
    { id: "bec-example", version: "9.0.0" },
  ]);
  assert.equal(
    await main(["sync-metadata", "--check", "--json"], {
      ...f.io,
      productRoot: root,
    }),
    2,
  );
  assert.match(f.out.join(""), /bec-example/);
});
