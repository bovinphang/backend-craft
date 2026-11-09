import {
  cargoFrameworkDetector,
  mavenCoordinates,
  gradleCoordinates,
  gradlePlugins,
  pythonDependencies,
  goDependencies,
  cmakePackageVersion,
  versionConstraint,
  type FrameworkDetector,
} from "@bovinphang/craft-common";
const detector = (
  id: string,
  find: (file: string, body: string) => { version?: string } | undefined,
  files: readonly string[],
): FrameworkDetector => ({
  id,
  detect(input) {
    for (const file of files) {
      const body = input.readManifest(file);
      if (body === undefined) continue;
      const found = find(file, body);
      if (found)
        return {
          evidence: { id, version: found.version, paths: [file] },
          roles: ["service"],
          relatedRoots: [],
        };
    }
    return undefined;
  },
});
export const BACKEND_FRAMEWORK_DETECTORS: readonly FrameworkDetector[] = [
  detector(
    "spring-boot",
    (file, body) =>
      file === "pom.xml"
        ? mavenCoordinates(body).find(
            (d) =>
              d.group === "org.springframework.boot" &&
              d.artifact.startsWith("spring-boot"),
          )
        : (gradlePlugins(body).find(
            (d) => d.name === "org.springframework.boot",
          ) ??
          gradleCoordinates(body).find(
            (d) =>
              d.group === "org.springframework.boot" &&
              d.artifact.startsWith("spring-boot"),
          )),
    ["pom.xml", "build.gradle", "build.gradle.kts"],
  ),
  detector(
    "fastapi",
    (file, body) =>
      file === "pyproject.toml"
        ? pythonDependencies(body).find((d) => d.name === "fastapi")
        : (() => {
            const m =
              /^\s*fastapi(?=\s|\[|[<>=!~;#]|$)(?:\[[^\]]*\])?\s*([^#;\r\n]*)/im.exec(
                body,
              );
            return m ? { version: versionConstraint(m[1]) } : undefined;
          })(),
    ["pyproject.toml", "requirements.txt"],
  ),
  detector(
    "gin",
    (_file, body) =>
      goDependencies(body).find((d) => d.name === "github.com/gin-gonic/gin"),
    ["go.mod"],
  ),
  cargoFrameworkDetector("axum", "axum", ["service"]),
  detector(
    "drogon",
    (_file, body) => {
      const found = cmakePackageVersion(body, "Drogon");
      return found.present ? found : undefined;
    },
    ["CMakeLists.txt"],
  ),
];
