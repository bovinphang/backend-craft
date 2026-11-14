import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { installRuntime } from "../../src/install/lifecycle.js";
import { createInstallContext } from "../../src/install/paths.js";
import { manifestPath } from "../../src/install/manifest.js";
import { hashBytes } from "@bovinphang/craft-common";
import { main } from "../../src/cli.js";
function fixture(t: { after(fn: () => void): void }) {
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), "bec-migration-"));
  t.after(() => fs.rmSync(cwd, { recursive: true, force: true }));
  return createInstallContext({
    productRoot: path.resolve("dist/package"),
    cwd,
    home: path.join(cwd, "home"),
    runtime: "claude",
    env: {},
  });
}
function seed(ctx: ReturnType<typeof fixture>, owned = true) {
  const file = path.join(
    ctx.baseDir,
    "skills/bec-rust-project-standard/SKILL.md",
  );
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, "old owned");
  if (owned)
    fs.writeFileSync(
      manifestPath(ctx),
      JSON.stringify({
        schemaVersion: 1,
        product: "@bovinphang/backend-craft",
        packageVersion: "1.0.0",
        runtime: "claude",
        scope: "local",
        language: "en",
        installedAt: "2026-11-01",
        files: [
          {
            root: "baseDir",
            path: "skills/bec-rust-project-standard/SKILL.md",
            hash: hashBytes(Buffer.from("old owned")),
          },
        ],
        sharedEntries: [],
      }),
    );
  return file;
}
test("unknown or edited old entry blocks whole install before any common deployment", async (t) => {
  for (const mode of ["unknown", "edited", "extra", "link"]) {
    const ctx = fixture(t);
    const file = seed(ctx, mode !== "unknown");
    if (mode === "edited") fs.appendFileSync(file, "edit");
    if (mode === "extra")
      fs.writeFileSync(path.join(path.dirname(file), "notes.txt"), "user");
    if (mode === "link") {
      fs.renameSync(path.dirname(file), path.dirname(file) + "-external");
      fs.symlinkSync(
        path.dirname(file) + "-external",
        path.dirname(file),
        process.platform === "win32" ? "junction" : "dir",
      );
    }
    await assert.rejects(
      installRuntime(ctx),
      /旧|退役|unknown|modified|link|链接/i,
    );
    assert.equal(
      fs.existsSync(path.join(ctx.baseDir, "skills/cc-rust-project-standard")),
      false,
    );
    assert.ok(fs.existsSync(file));
  }
});
test("owned legacy language entry retires in the common transaction and dry-run writes nothing", async (t) => {
  const ctx = fixture(t),
    file = seed(ctx);
  const before = fs.readFileSync(manifestPath(ctx));
  await installRuntime({ ...ctx, dryRun: true });
  assert.ok(fs.existsSync(file));
  assert.deepEqual(fs.readFileSync(manifestPath(ctx)), before);
  await installRuntime(ctx);
  assert.equal(fs.existsSync(file), false);
  assert.ok(
    fs.existsSync(
      path.join(ctx.baseDir, "skills/cc-rust-project-standard/SKILL.md"),
    ),
  );
});
test("migration CLI is read-only, reports old references without original text and validates arguments", async (t) => {
  const ctx = fixture(t);
  fs.writeFileSync(
    path.join(ctx.cwd, "README.md"),
    "PRIVATE_ORIGINAL bec-c-project-standard",
  );
  const out: string[] = [],
    errors: string[] = [];
  const io = {
    cwd: ctx.cwd,
    home: ctx.home,
    productRoot: ctx.productRoot,
    env: {},
    stdout: (v: string) => out.push(v),
    stderr: (v: string) => errors.push(v),
  };
  assert.equal(
    await main(["runtime", "check-migration", "claude", "--json"], io),
    1,
  );
  assert.doesNotMatch(out.join(""), /PRIVATE_ORIGINAL/);
  assert.equal(fs.existsSync(ctx.baseDir), false);
  assert.equal(
    await main(["runtime", "check-migration", "bad", "--json"], io),
    2,
  );
});
