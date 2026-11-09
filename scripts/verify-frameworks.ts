import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
const definitions = {
  gin: {
    image: "golang:1.25-bookworm",
    cache: "/cache",
    env: ["GOMODCACHE=/cache/mod", "GOCACHE=/cache/build", "GOTOOLCHAIN=local"],
    marker:
      /TestInvalidInput[\s\S]*FAIL|rejected input caused \d+ side effects/,
  },
  axum: {
    image: "rust:1.96-bookworm",
    cache: "/cache",
    env: [
      "CARGO_HOME=/cache/cargo",
      "CARGO_TARGET_DIR=/cache/target",
      "RUSTUP_AUTO_INSTALL=0",
    ],
    marker: /rejects_invalid_json[\s\S]*FAILED/,
  },
  "spring-boot": {
    image: "maven:3.9-eclipse-temurin-17",
    cache: "/root/.m2",
    env: [] as string[],
    marker: /Failures: [1-9]|expected:.*400|Status expected:<400>/,
  },
  drogon: {
    image: "drogonframework/drogon:latest",
    cache: "/cache",
    env: [] as string[],
    marker: /CONTRACT_FAILURE/,
  },
} as const;
export function verifyFrameworks(
  root: string,
  selected: string[],
  prepare = false,
): void {
  if (
    !selected.length ||
    selected.some((id) => !Object.hasOwn(definitions, id))
  )
    throw new Error("Choose gin, axum, spring-boot or drogon");
  for (const id of selected) {
    const definition = definitions[id as keyof typeof definitions],
      out = path.join(root, "reports/backend-craft/frameworks", id);
    fs.mkdirSync(out, { recursive: true });
    const invoke = (args: string[]) =>
      spawnSync("docker", args, {
        cwd: root,
        encoding: "utf8",
        windowsHide: true,
        timeout: 900000,
        maxBuffer: 8 * 1024 * 1024,
      });
    let inspect = invoke([
      "image",
      "inspect",
      definition.image,
      "--format",
      "{{.Id}}",
    ]);
    if (inspect.status !== 0 && prepare) {
      const pull = invoke(["pull", definition.image]);
      if (pull.status !== 0)
        throw new Error("Image preparation failed: " + id + "\n" + pull.stderr);
      inspect = invoke([
        "image",
        "inspect",
        definition.image,
        "--format",
        "{{.Id}}",
      ]);
    }
    if (inspect.status !== 0)
      throw new Error("MISSING Docker image: " + definition.image);
    const imageId = inspect.stdout.trim(),
      source = path.join(
        root,
        "skills",
        `bec-${id}-project-standard/examples/minimal`,
      );
    const args = [
      "run",
      "--rm",
      "--pull",
      "never",
      "--mount",
      `type=bind,source=${source},target=/src,readonly`,
      "--mount",
      `type=bind,source=${path.join(root, "scripts/framework-container.sh")},target=/run-fixture.sh,readonly`,
      "--mount",
      `type=bind,source=${out},target=/out`,
      "--mount",
      `type=volume,source=craft-foundation-${id}-20261108,target=${definition.cache}`,
      "-e",
      `FRAMEWORK=${id}`,
      "-e",
      `PREPARE=${prepare ? 1 : 0}`,
      ...definition.env.flatMap((value) => ["-e", value]),
      imageId,
      "sh",
      "/run-fixture.sh",
    ];
    const run = invoke(args);
    fs.writeFileSync(
      path.join(out, "preparation.log"),
      (run.stdout ?? "") + "\n" + (run.stderr ?? ""),
    );
    if (run.error || run.status !== 0)
      throw new Error(
        "Framework setup/build failed (not a business RED): " +
          id +
          "; see " +
          path.join(out, "preparation.log"),
      );
    const red = Number(fs.readFileSync(path.join(out, "red-exit.txt"), "utf8")),
      green = Number(fs.readFileSync(path.join(out, "green-exit.txt"), "utf8")),
      redLog = fs.readFileSync(path.join(out, "red.log"), "utf8");
    const status =
      red !== 0 && green === 0 && definition.marker.test(redLog)
        ? "passed"
        : "failed";
    fs.writeFileSync(
      path.join(out, "evidence.json"),
      JSON.stringify(
        {
          framework: id,
          status,
          image: definition.image,
          imageId,
          redExit: red,
          greenExit: green,
          versions: fs.readFileSync(path.join(out, "versions.txt"), "utf8"),
          scope:
            "real framework in-process boundary tests; external DB, deployment and load NOT RUN",
        },
        null,
        2,
      ) + "\n",
    );
    if (status !== "passed")
      throw new Error(
        `Framework ${id} did not show business RED then GREEN; red=${red}, green=${green}, evidence=${out}`,
      );
    console.log(
      `${id}: real business RED (${red}) -> GREEN (${green}); ${imageId}`,
    );
  }
}
export function parseFrameworkOptions(args: string[]): {
  selected: string[];
  prepare: boolean;
} {
  let selected = Object.keys(definitions),
    prepare = false,
    hasSelection = false;
  for (let index = 0; index < args.length; index++) {
    if (args[index] === "--") continue;
    if (args[index] === "--prepare") {
      if (prepare) throw new Error("Duplicate --prepare");
      prepare = true;
    } else if (args[index] === "--framework") {
      if (hasSelection || !args[index + 1])
        throw new Error("--framework requires one comma-separated list");
      selected = args[++index].split(",");
      hasSelection = true;
      if (
        selected.some((id) => !Object.hasOwn(definitions, id)) ||
        new Set(selected).size !== selected.length
      )
        throw new Error("Unknown or duplicate framework");
    } else
      throw new Error(
        "Unknown framework verification argument: " + args[index],
      );
  }
  return { selected, prepare };
}
if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const { selected, prepare } = parseFrameworkOptions(process.argv.slice(2));
  verifyFrameworks(path.resolve(import.meta.dirname, ".."), selected, prepare);
}
