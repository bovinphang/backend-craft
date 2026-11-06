import fs from "node:fs";
import path from "node:path";
import type { LanguageModule } from "./types.js";
import { stage } from "./shared.js";
export const java: LanguageModule = {
  id: "java",
  skillIds: ["bec-java-project-standard", "bec-java-runtime"],
  suggest: (p) => {
    const result = [];
    // Never bootstrap a wrapper: its distribution needs explicit preparation/configuration.
    if (
      p.buildFiles.some((f) => f.endsWith("pom.xml")) &&
      !["mvnw", "mvnw.cmd"].some((f) => fs.existsSync(path.join(p.root, f)))
    ) {
      result.push(
        stage(p, "java:maven:test", "test", "mvn", ["-o", "-B", "test"]),
        stage(p, "java:maven:build", "build", "mvn", [
          "-o",
          "-B",
          "package",
          "-DskipTests",
        ]),
      );
    }
    if (
      p.buildFiles.some((f) => /build\.gradle(?:\.kts)?$/.test(f)) &&
      !["gradlew", "gradlew.bat"].some((f) =>
        fs.existsSync(path.join(p.root, f)),
      )
    ) {
      result.push(
        stage(p, "java:gradle:test", "test", "gradle", [
          "--offline",
          "--no-daemon",
          "--rerun-tasks",
          "test",
        ]),
        stage(p, "java:gradle:build", "build", "gradle", [
          "--offline",
          "--no-daemon",
          "assemble",
        ]),
      );
    }
    return result;
  },
};
