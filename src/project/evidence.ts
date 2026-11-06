import path from "node:path";
import type { LanguageId } from "./types.js";
// Declarative evidence: adding a language does not add a branch in the scanner.
export const BUILD_MARKERS: Readonly<Record<string, readonly LanguageId[]>> = {
  "Cargo.toml": ["rust"],
  "go.mod": ["go"],
  "go.work": ["go"],
  "pom.xml": ["java"],
  "build.gradle": ["java"],
  "build.gradle.kts": ["java"],
  "settings.gradle": ["java"],
  "settings.gradle.kts": ["java"],
  "pyproject.toml": ["python"],
  "setup.py": ["python"],
  "setup.cfg": ["python"],
  "CMakeLists.txt": [],
  "CMakePresets.json": [],
  "meson.build": [],
  Makefile: [],
  makefile: [],
};
export const SOURCE_EXTENSIONS: Readonly<Record<string, LanguageId>> = {
  ".rs": "rust",
  ".go": "go",
  ".java": "java",
  ".py": "python",
  ".c": "c",
  ".cc": "cpp",
  ".cpp": "cpp",
  ".cxx": "cpp",
  ".c++": "cpp",
  ".hpp": "cpp",
  ".hxx": "cpp",
};
export const IGNORED_DIRS = new Set([
  ".git",
  "node_modules",
  "target",
  ".venv",
  "venv",
  "build",
  "dist",
  ".idea",
  ".gradle",
  "__pycache__",
  ".mypy_cache",
  ".pytest_cache",
  "vendor",
]);
export const sensitiveFile = (name: string): boolean =>
  /^\.env(?:\.|$)|\.(?:pem|key|p12|pfx)$|^(?:id_rsa|id_ed25519|credentials|auth\.json)$/i.test(
    name,
  );
export function declaredNativeLanguages(body: string): LanguageId[] {
  const clean = body.replace(/#[^\n]*/g, "");
  const languages = new Set<LanguageId>();
  for (const match of clean.matchAll(
    /\b(?:project|enable_language)\s*\(([^)]*)\)/gi,
  )) {
    const content = match[1];
    const tokens = /\bLANGUAGES\b/i.test(content)
      ? content.split(/\bLANGUAGES\b/i)[1]
      : /^enable_language/i.test(match[0])
        ? content
        : "";
    if (/\bC\b/.test(tokens)) languages.add("c");
    if (/\bCXX\b/.test(tokens)) languages.add("cpp");
  }
  return [...languages].sort();
}
export function sourceLanguage(file: string): LanguageId | undefined {
  return SOURCE_EXTENSIONS[path.extname(file).toLowerCase()];
}
