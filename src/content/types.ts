import type { ContentFile, InstallLanguage } from "@bovinphang/craft-common";
export type { InstallLanguage };
export interface ProductCatalog {
  schemaVersion: 1;
  packageVersion: string;
  language: InstallLanguage;
  skills: Array<{
    id: string;
    sourcePackage: string;
    version: string;
    files: ContentFile[];
  }>;
  agents: string[];
  commands: string[];
}
