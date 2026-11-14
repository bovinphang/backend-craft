import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";
test(
  "Windows 同一根大小写、分隔符与尾斜杠在有界进程内正常规划",
  { skip: process.platform !== "win32" },
  (t) => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "bec-case-"));
    t.after(() => fs.rmSync(root, { recursive: true, force: true }));
    const url = pathToFileURL(path.resolve("src/install/safe-path.ts")).href;
    const code = `import assert from 'node:assert/strict';import {safeDestination,canonicalPath} from ${JSON.stringify(url)};const root=${JSON.stringify(root)},file=root+'/bec-file';for(const variant of [root.toUpperCase(),root.replaceAll('\\\\','/')+'/',root.toUpperCase()+'\\\\'])assert.equal(safeDestination(file,[variant]),canonicalPath(file));console.log('ok');`;
    const run = spawnSync(
      process.execPath,
      ["--import", "tsx", "--input-type=module", "-e", code],
      { encoding: "utf8", timeout: 3000, windowsHide: true },
    );
    assert.equal(run.error, undefined, run.error?.message);
    assert.equal(run.status, 0, run.stderr);
    assert.match(run.stdout, /ok/);
  },
);
test(
  "Windows 大写工作区通过真实公共协调器完成无写入预览",
  { skip: process.platform !== "win32" },
  (t) => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "bec-case-runtime-"));
    t.after(() => fs.rmSync(root, { recursive: true, force: true }));
    const lifecycle = pathToFileURL(
        path.resolve("src/install/lifecycle.ts"),
      ).href,
      paths = pathToFileURL(path.resolve("src/install/paths.ts")).href;
    const code =
      "import {installRuntime} from " +
      JSON.stringify(lifecycle) +
      ";import {createInstallContext} from " +
      JSON.stringify(paths) +
      ";await installRuntime(createInstallContext({productRoot:" +
      JSON.stringify(path.resolve("dist/package")) +
      ",cwd:" +
      JSON.stringify(root.toUpperCase()) +
      ",home:" +
      JSON.stringify(path.join(root, "home")) +
      ',runtime:"claude",dryRun:true,env:{}}));console.log("ok");';
    const run = spawnSync(
      process.execPath,
      ["--import", "tsx", "--input-type=module", "-e", code],
      { encoding: "utf8", timeout: 8000, windowsHide: true },
    );
    assert.equal(run.error, undefined, run.error?.message);
    assert.equal(run.status, 0, run.stderr);
    assert.match(run.stdout, /ok/);
    assert.deepEqual(fs.readdirSync(root), []);
  },
);
