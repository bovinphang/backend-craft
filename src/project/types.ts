export type LanguageId = "rust" | "go" | "java" | "python" | "c" | "cpp";
export type Phase = "format" | "lint" | "typecheck" | "test" | "build";
export interface StageSpec {
  id: string;
  phase: Phase;
  executable: string;
  args: string[];
  cwd: string;
  timeoutMs: number;
  required: boolean;
  integration?: boolean;
  env?: Record<string, string>;
  skipReason?: string;
}
export interface Project {
  root: string;
  languages: LanguageId[];
  evidence: string[];
  buildFiles: string[];
  ambiguous: boolean;
}
export interface Inspection {
  schemaVersion: 1;
  workspace: string;
  projects: Project[];
  warnings: string[];
  truncated: boolean;
}
export interface ValidationPlan {
  schemaVersion: 1;
  projects: Project[];
  stages: StageSpec[];
  problems: string[];
  warnings?: string[];
}
export interface StageResult {
  id: string;
  status: "passed" | "failed" | "missing" | "timeout" | "skipped" | "cancelled";
  exitCode: number | null;
  durationMs: number;
  reason?: string;
}
export interface ValidationResult {
  schemaVersion: 1;
  results: StageResult[];
  exitCode: 0 | 1 | 2;
}
export interface ToolStatus {
  available: boolean;
  version?: string;
  reason?: string;
}
export interface InspectOptions {
  workspace: string;
  taskPath?: string;
  maxDepth?: number;
  maxEntries?: number;
}
