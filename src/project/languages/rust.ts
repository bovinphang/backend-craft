import type { LanguageModule } from "./types.js";
import { stage } from "./shared.js";
export const rust: LanguageModule = {
  id: "rust",
  skillIds: ["cc-rust-project-standard", "cc-rust-async"],
  suggest: (p) => {
    const env = { RUSTUP_AUTO_INSTALL: "0", CARGO_NET_OFFLINE: "true" };
    return [
      stage(
        p,
        "rust:format",
        "format",
        "cargo",
        ["fmt", "--all", "--", "--check"],
        env,
      ),
      stage(
        p,
        "rust:lint",
        "lint",
        "cargo",
        [
          "clippy",
          "--offline",
          "--locked",
          "--all-targets",
          "--",
          "-D",
          "warnings",
        ],
        env,
      ),
      stage(
        p,
        "rust:test",
        "test",
        "cargo",
        ["test", "--offline", "--locked"],
        env,
      ),
      stage(
        p,
        "rust:build",
        "build",
        "cargo",
        ["build", "--offline", "--locked"],
        env,
      ),
    ];
  },
};
