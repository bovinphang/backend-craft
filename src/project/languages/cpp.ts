import type { LanguageModule } from "./types.js";
import { nativeStages } from "./native.js";
export const cpp: LanguageModule = {
  id: "cpp",
  skillIds: ["bec-cpp-project-standard", "bec-native-memory-safety"],
  suggest: nativeStages,
};
