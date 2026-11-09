import {
  BUILD_MARKERS as COMMON_MARKERS,
  sourceLanguage as commonSourceLanguage,
  declaredNativeLanguages as commonNativeLanguages,
} from "@bovinphang/craft-common";
import type { LanguageId } from "./types.js";
export const LANGUAGE_IDS: readonly string[] = [
  "rust",
  "go",
  "java",
  "python",
  "c",
  "cpp",
];
export const BUILD_MARKERS: Readonly<Record<string, readonly string[]>> =
  Object.fromEntries(
    [
      "Cargo.toml",
      "go.mod",
      "go.work",
      "pom.xml",
      "build.gradle",
      "build.gradle.kts",
      "settings.gradle",
      "settings.gradle.kts",
      "pyproject.toml",
      "setup.py",
      "setup.cfg",
      "CMakeLists.txt",
      "CMakePresets.json",
      "meson.build",
      "Makefile",
      "makefile",
    ].map((name) => [name, COMMON_MARKERS[name]]),
  );
export { IGNORED_DIRS, sensitiveFile } from "@bovinphang/craft-common";
export function sourceLanguage(file: string): LanguageId | undefined {
  const language = commonSourceLanguage(file);
  return language && LANGUAGE_IDS.includes(language)
    ? (language as LanguageId)
    : undefined;
}
export function declaredNativeLanguages(body: string): LanguageId[] {
  return commonNativeLanguages(body) as LanguageId[];
}
