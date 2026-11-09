import type { LanguageModule } from "./types.js";
import { nativeStages } from "./native.js";
export const c: LanguageModule = {
  id: "c",
  skillIds: ["cc-c-project-standard", "cc-native-memory-safety"],
  suggest: nativeStages,
};
