import fs from "node:fs";
import path from "node:path";
export function hasFreshTestReport(cwd: string, started: number): boolean {
  const boundary = path.resolve(cwd);
  for (const relative of [
    "build/test-results/test",
    "target/surefire-reports",
  ]) {
    const directory = path.join(boundary, relative);
    let current = directory,
      linked = false;
    while (current !== boundary) {
      try {
        if (fs.lstatSync(current).isSymbolicLink()) linked = true;
      } catch {}
      current = path.dirname(current);
    }
    if (
      linked ||
      !fs.existsSync(directory) ||
      !fs.statSync(directory).isDirectory()
    )
      continue;
    let budget = 1048576;
    for (const file of fs.readdirSync(directory).slice(0, 1000)) {
      if (!file.endsWith(".xml")) continue;
      const full = path.join(directory, file),
        stat = fs.lstatSync(full);
      if (
        !stat.isFile() ||
        stat.isSymbolicLink() ||
        stat.mtimeMs < started ||
        stat.size > 262144 ||
        stat.size > budget
      )
        continue;
      budget -= stat.size;
      const body = fs.readFileSync(full, "utf8");
      if (
        [...body.matchAll(/<testsuite\b([^>]*)>/g)].some((match) => {
          const values = Object.fromEntries(
            [
              ...match[1].matchAll(
                /(?:^|\s)(tests|skipped|disabled)\s*=\s*(["'])(\d+)\2/g,
              ),
            ].map((attribute) => [attribute[1], Number(attribute[3])]),
          );
          return (
            (values.tests ?? 0) -
              (values.skipped ?? 0) -
              (values.disabled ?? 0) >
            0
          );
        })
      )
        return true;
    }
  }
  return false;
}
export function hasTestEvidence(output: string): boolean {
  const patterns = [
    /backend-craft:tests=(\d+)/g,
    /\b(\d+) passed\b/g,
    /(?:#|ℹ)\s*pass\s+(\d+)/g,
  ];
  if (
    patterns.some((pattern) =>
      [...output.matchAll(pattern)].some((match) => Number(match[1]) > 0),
    )
  )
    return true;
  const unittest = [...output.matchAll(/\bRan\s+(\d+)\s+tests?\b/g)].at(-1);
  if (unittest) {
    const skipped = [...output.matchAll(/\bskipped=(\d+)/g)].at(-1);
    if (Number(unittest[1]) - Number(skipped?.[1] ?? 0) > 0) return true;
  }
  for (const match of output.matchAll(/\bTests run:\s*(\d+)([^\r\n]*)/g)) {
    const skipped = /\bSkipped:\s*(\d+)/.exec(match[2]);
    if (Number(match[1]) - Number(skipped?.[1] ?? 0) > 0) return true;
  }
  for (const match of output.matchAll(
    /(\d+)% tests passed,[^\r\n]*out of\s+(\d+)/g,
  ))
    if (Number(match[1]) > 0 && Number(match[2]) > 0) return true;
  for (const line of output.split(/\r?\n/)) {
    if (!line.trim().startsWith("{")) continue;
    try {
      const event: unknown = JSON.parse(line);
      if (
        event &&
        typeof event === "object" &&
        "Action" in event &&
        "Test" in event &&
        event.Action === "pass" &&
        typeof event.Test === "string" &&
        event.Test.length > 0
      )
        return true;
    } catch {
      /* Plain diagnostic output is not test evidence. */
    }
  }
  return false;
}
