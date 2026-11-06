import type { LanguageId } from "../types.js";
import type { LanguageModule } from "./types.js";
import { rust } from "./rust.js";
import { go } from "./go.js";
import { java } from "./java.js";
import { python } from "./python.js";
import { c } from "./c.js";
import { cpp } from "./cpp.js";
export const LANGUAGES: Record<LanguageId, LanguageModule> = {
  rust,
  go,
  java,
  python,
  c,
  cpp,
};
