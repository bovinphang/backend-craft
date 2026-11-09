import type { InstallLanguage, InstallSession } from "@bovinphang/craft-common";
import type { OwnedEntry } from "./shared-config/types.js";
export interface InstallContext {
  session?: InstallSession;
  productRoot: string;
  contentRoot: string;
  cwd: string;
  home: string;
  baseDir: string;
  runtime: string;
  isGlobal: boolean;
  language: InstallLanguage;
  mode: "install" | "update";
  dryRun: boolean;
  allowedRoots?: string[];
}
export interface PlanningInstallContext extends InstallContext {
  session: InstallSession;
}
export type ManifestRoot = "baseDir" | "cwd" | "home";
export interface FileReference {
  root: ManifestRoot;
  path: string;
}
export interface ManagedFile extends FileReference {
  hash: string;
}
export interface SharedEntryRecord extends FileReference {
  entry: OwnedEntry;
}
export interface CommonPointer {
  target: string;
  ledgerDir: string;
  packageVersion: string;
  language: InstallLanguage;
  digest: string;
}
export interface ProductManifest {
  schemaVersion: 1;
  product: "@bovinphang/backend-craft";
  packageVersion: string;
  runtime: string;
  scope: "local" | "global";
  language: InstallLanguage;
  installedAt: string;
  files: ManagedFile[];
  sharedEntries: SharedEntryRecord[];
  common?: CommonPointer;
}
export interface ProductSessionResult {
  manifest: ProductManifest;
  preserved: string[];
  changed: string[];
}
