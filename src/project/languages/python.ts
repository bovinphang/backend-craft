import fs from "node:fs";
import path from "node:path";
import { parse } from "smol-toml";
import type { LanguageModule } from "./types.js";
import { stage, readOptional } from "./shared.js";
const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
export const python: LanguageModule = {
  id: "python",
  skillIds: ["bec-python-project-standard", "bec-python-async"],
  suggest: (p) => {
    const raw = readOptional(p.root, "pyproject.toml");
    const config = raw ? parse(raw) : {};
    const tool = record(config.tool),
      result = [];
    const venv = path.join(
      p.root,
      process.platform === "win32"
        ? ".venv/Scripts/python.exe"
        : ".venv/bin/python",
    );
    const executable = fs.existsSync(venv) ? venv : "python";
    if (
      tool.ruff ||
      fs.existsSync(path.join(p.root, "ruff.toml")) ||
      fs.existsSync(path.join(p.root, ".ruff.toml"))
    ) {
      result.push(
        stage(p, "python:format", "format", "ruff", ["format", "--check", "."]),
        stage(p, "python:lint", "lint", "ruff", ["check", "."]),
      );
    }
    if (tool.mypy)
      result.push(
        stage(p, "python:typecheck", "typecheck", executable, [
          "-m",
          "mypy",
          ".",
        ]),
      );
    if (tool.pytest || fs.existsSync(path.join(p.root, "pytest.ini")))
      result.push(
        stage(p, "python:test", "test", executable, ["-m", "pytest", "-q"]),
      );
    else if (
      fs.existsSync(path.join(p.root, "tests")) &&
      fs
        .readdirSync(path.join(p.root, "tests"))
        .some((f) => /^test.*\.py$/.test(f))
    )
      result.push(
        stage(p, "python:test", "test", executable, [
          "-m",
          "unittest",
          "discover",
          "-s",
          "tests",
          "-p",
          "test*.py",
          "-v",
        ]),
      );
    if (config["build-system"])
      result.push(
        stage(p, "python:build", "build", executable, [
          "-m",
          "build",
          "--no-isolation",
        ]),
      );
    return result;
  },
};
