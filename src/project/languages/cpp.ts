import type { LanguageModule } from "./types.js";
import { nativeStages } from "./native.js";
export const cpp: LanguageModule = {
  id: "cpp",
  skillIds: ["cc-cpp-project-standard", "cc-native-memory-safety"],
  suggest: nativeStages,
};
