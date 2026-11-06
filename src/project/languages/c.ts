import type { LanguageModule } from "./types.js";
import { nativeStages } from "./native.js";
export const c: LanguageModule = {
  id: "c",
  skillIds: ["bec-c-project-standard", "bec-native-memory-safety"],
  suggest: nativeStages,
};
