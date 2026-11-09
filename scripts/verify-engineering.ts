import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
export interface RunEvidence {
  exitCode: number | null;
  testNames: string[];
  tests: { total: number; passed: number; failed: number; skipped: number };
  assertionMarkers: string[];
  logPath: string;
}
export interface CaseEvidence {
  caseId: string;
  status: "PASS" | "FAIL" | "MISSING" | "NOT_RUN";
  platform: string;
  toolVersions: Record<string, string>;
  sourceHash: string;
  commands: string[];
  broken?: RunEvidence;
  fixed?: RunEvidence;
  scope: string;
  reason?: string;
}
const names = [
  "TestRetryAfterCommittedResponseFailure",
  "TestSameKeyDifferentIntentRejected",
  "TestConcurrentReplayHasOneEffect",
];
export function assessGo(
  run: { status: number | null; output: string },
  broken: boolean,
  logPath: string,
): RunEvidence {
  const rows: Array<{ name: string; state: string }> = [];
  for (const line of run.output
    .split(/\r?\n/)
    .filter((line) => line.startsWith("{"))) {
    const event = JSON.parse(line) as { Test?: string; Action?: string };
    if (event.Test && ["pass", "fail", "skip"].includes(event.Action ?? ""))
      rows.push({ name: event.Test, state: event.Action! });
  }
  const tests = {
    total: rows.length,
    passed: rows.filter((r) => r.state === "pass").length,
    failed: rows.filter((r) => r.state === "fail").length,
    skipped: rows.filter((r) => r.state === "skip").length,
  };
  if (
    tests.total !== 3 ||
    tests.skipped ||
    new Set(rows.map((r) => r.name)).size !== 3 ||
    names.some((name) => !rows.some((r) => r.name === name))
  )
    throw new Error("Incomplete named HTTP test execution");
  if (
    broken
      ? run.status === null ||
        run.status === 0 ||
        tests.failed !== 3 ||
        !run.output.includes("CRAFT_ASSERTION:")
      : run.status !== 0 || tests.passed !== 3
  )
    throw new Error("Not required HTTP business RED/GREEN");
  return {
    exitCode: run.status,
    testNames: rows.map((r) => r.name),
    tests,
    assertionMarkers: rows
      .filter((r) => r.state === (broken ? "fail" : "pass"))
      .map((r) => r.name),
    logPath,
  };
}
export function parseEngineeringArgs(args: string[]): {
  root: string;
  prepare: boolean;
} {
  let root = process.cwd(),
    prepare = false;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--") continue;
    if (args[i] === "--prepare") prepare = true;
    else if (
      args[i] === "--root" &&
      args[i + 1] &&
      !args[i + 1].startsWith("--")
    )
      root = path.resolve(args[++i]);
    else throw new Error("Unknown or incomplete argument: " + args[i]);
  }
  return { root, prepare };
}
export function verifyEngineeringExamples({
  root,
  prepare: _prepare,
}: {
  root: string;
  prepare: boolean;
}): CaseEvidence[] {
  const evidence: CaseEvidence = {
    caseId: "EP-SVC-01",
    status: "NOT_RUN",
    platform: process.platform + "/" + process.arch,
    toolVersions: {},
    sourceHash: "",
    commands: [],
    scope:
      "Real httptest HTTP clients; process-memory atomic ownership/replay and injected effect count. No database, authentication, crash recovery or distributed exactly-once guarantee.",
  };
  try {
    const version = spawnSync("go", ["version"], {
      encoding: "utf8",
      timeout: 10000,
      shell: false,
    });
    if (version.error) {
      evidence.status = "MISSING";
      evidence.reason = "Go toolchain required; no implicit installation";
      return [evidence];
    }
    if (version.status !== 0) throw new Error("Go version probe failed");
    evidence.toolVersions.go = version.stdout.trim();
    const source = path.join(
        root,
        "skills/bec-api-design/examples/engineering",
      ),
      files = ["go.mod", "server.go", "server_test.go", "README.md"],
      hash = createHash("sha256");
    for (const name of files)
      hash.update(name).update(fs.readFileSync(path.join(source, name)));
    evidence.sourceHash = hash.digest("hex");
    const parent = path.join(root, "reports/engineering");
    fs.mkdirSync(parent, { recursive: true });
    const log = fs.mkdtempSync(path.join(parent, "run-")),
      work = path.join(log, "source");
    fs.mkdirSync(work);
    for (const name of files)
      fs.copyFileSync(path.join(source, name), path.join(work, name));
    const env: NodeJS.ProcessEnv = {
      ...process.env,
      GOTOOLCHAIN: "local",
      GOPROXY: "off",
      GOSUMDB: "off",
      GOWORK: "off",
      GOCACHE: path.join(parent, "go-cache"),
    };
    delete env.NODE_TEST_CONTEXT;
    const invoke = (args: string[], defect: string) =>
      spawnSync("go", args, {
        cwd: work,
        env: { ...env, CRAFT_ENGINEERING_DEFECTIVE: defect },
        encoding: "utf8",
        timeout: 120000,
        shell: false,
        maxBuffer: 8 * 1024 * 1024,
      });
    const compile = [
      "test",
      "-c",
      "-o",
      path.join(
        log,
        process.platform === "win32" ? "contract.exe" : "contract",
      ),
    ];
    evidence.commands.push("go " + compile.join(" "));
    const built = invoke(compile, "0");
    fs.writeFileSync(
      path.join(log, "compile.log"),
      (built.stdout ?? "") + (built.stderr ?? ""),
    );
    if (built.status !== 0)
      throw new Error("Compilation failed before business RED; see " + log);
    for (const broken of [true, false]) {
      const args = ["test", "-json", "-count=1", "."],
        result = invoke(args, broken ? "1" : "0"),
        output = (result.stdout ?? "") + (result.stderr ?? ""),
        file = path.join(log, broken ? "broken.log" : "fixed.log");
      evidence.commands.push(
        "CRAFT_ENGINEERING_DEFECTIVE=" +
          (broken ? "1" : "0") +
          " go " +
          args.join(" "),
      );
      fs.writeFileSync(file, output);
      const assessed = assessGo(
        { status: result.status, output },
        broken,
        file,
      );
      if (broken) evidence.broken = assessed;
      else evidence.fixed = assessed;
    }
    evidence.status = "PASS";
    fs.writeFileSync(
      path.join(log, "evidence.json"),
      JSON.stringify(evidence, null, 2) + "\n",
    );
  } catch (error) {
    evidence.status = "FAIL";
    evidence.reason = error instanceof Error ? error.message : String(error);
  }
  return [evidence];
}
if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  try {
    const results = verifyEngineeringExamples(
      parseEngineeringArgs(process.argv.slice(2)),
    );
    console.log(JSON.stringify(results, null, 2));
    process.exitCode = results.some((r) => r.status === "FAIL")
      ? 1
      : results.some((r) => r.status !== "PASS")
        ? 2
        : 0;
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
