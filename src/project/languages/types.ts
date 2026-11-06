import type { LanguageId, Project, StageSpec } from "../types.js";
export interface LanguageModule {
  id: LanguageId;
  skillIds: string[];
  suggest(project: Project): StageSpec[];
}
