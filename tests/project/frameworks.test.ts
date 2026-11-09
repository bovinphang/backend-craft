import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { inspectProject } from "../../src/project/discover.js";
test("service facts require actual dependency declarations and preserve legacy six-language view", (t) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "bec-facts-"));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const files: Record<string, string> = {
    "spring/pom.xml":
      "<project><parent><groupId>org.springframework.boot</groupId><artifactId>spring-boot-starter-parent</artifactId><version>3.5.16</version></parent></project>",
    "fast/pyproject.toml": '[project]\ndependencies=["fastapi>=0.141"]',
    "gin/go.mod": "module sample\nrequire github.com/gin-gonic/gin v1.11.0",
    "axum/Cargo.toml": '[dependencies]\naxum="0.8"',
    "drogon/CMakeLists.txt":
      "project(app LANGUAGES CXX)\nfind_package(Drogon 1.9 REQUIRED)",
    "fake/Cargo.toml": '[package]\nname="axum"',
    "ui/package.json": '{"dependencies":{"react":"^19"}}',
    "fake/build.gradle":
      '// id("org.springframework.boot")\nval text = "org.springframework.boot:spring-boot:3"',
  };
  for (const [f, b] of Object.entries(files)) {
    fs.mkdirSync(path.dirname(path.join(root, f)), { recursive: true });
    fs.writeFileSync(path.join(root, f), b);
  }
  const report = inspectProject({ workspace: root });
  assert.ok(report.units);
  assert.deepEqual(
    report.units.flatMap((u) => u.frameworks.map((f) => f.id)).sort(),
    ["axum", "drogon", "fastapi", "gin", "spring-boot"],
  );
  assert.ok(!report.projects.some((p) => path.basename(p.root) === "ui"));
  assert.ok(
    report.projects.every((p) =>
      p.languages.every((l) =>
        ["rust", "go", "java", "python", "c", "cpp"].includes(l),
      ),
    ),
  );
  assert.ok(
    !report.units
      .find((u) => path.basename(u.root) === "fake")
      ?.roles.includes("service"),
  );
});
test("requirements dependency names are exact; unrelated prefix packages are not FastAPI evidence", (t) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "bec-no-fake-"));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.writeFileSync(
    path.join(root, "requirements.txt"),
    "# fastapi==1\nfastapix==1\n",
  );
  assert.deepEqual(
    inspectProject({ workspace: root }).units?.[0].frameworks,
    [],
  );
});
