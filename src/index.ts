export { PRODUCT } from "./product.js";
export { readProductCatalog } from "./content/catalog.js";
export type { ProductCatalog, InstallLanguage } from "./content/types.js";
export { inspectProject } from "./project/discover.js";
export { planValidation } from "./project/validation-plan.js";
export { executeValidation } from "./project/execute.js";
export { readProjectConfig } from "./project/config.js";
export { installRuntime, uninstallRuntime } from "./install/lifecycle.js";
export { createInstallContext, getRuntimeTarget } from "./install/paths.js";
export { RUNTIMES, getRuntime } from "./install/registry.js";
export { main } from "./cli.js";
export type { InstallContext } from "./install/types.js";
export type {
  LanguageId,
  Inspection,
  ValidationPlan,
  ValidationResult,
  StageSpec,
} from "./project/types.js";
