import type { LanguageModule } from "./types.js";
import { stage } from "./shared.js";
export const go: LanguageModule = {
  id: "go",
  skillIds: ["bec-go-project-standard", "bec-go-concurrency"],
  suggest: (p) => {
    const env = { GOPROXY: "off", GOSUMDB: "off", GOTOOLCHAIN: "local" };
    return [
      stage(p, "go:format", "format", "gofmt", ["-l", "."], env),
      stage(p, "go:lint", "lint", "go", ["vet", "-mod=readonly", "./..."], env),
      stage(
        p,
        "go:test",
        "test",
        "go",
        ["test", "-json", "-count=1", "-mod=readonly", "./..."],
        env,
      ),
      stage(
        p,
        "go:build",
        "build",
        "go",
        ["build", "-mod=readonly", "./..."],
        env,
      ),
    ];
  },
};
