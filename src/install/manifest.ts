import fs from "node:fs";
import path from "node:path";
import type {
  InstallContext,
  ProductManifest,
  FileReference,
  ManifestRoot,
} from "./types.js";
import { PRODUCT } from "../product.js";
import { safeDestination, canonicalPath, inside } from "./safe-path.js";
import { parseBackendManifest } from "./manifest-codec.js";
export const allowedRoots = (ctx: InstallContext): string[] =>
  ctx.allowedRoots ?? [ctx.baseDir, ...(ctx.isGlobal ? [] : [ctx.cwd])];
export function manifestPath(ctx: InstallContext): string {
  return safeDestination(
    path.join(ctx.baseDir, PRODUCT.manifestName),
    allowedRoots(ctx),
  );
}
export function readManifest(file: string): ProductManifest | undefined {
  if (!fs.existsSync(file)) return undefined;
  const stat = fs.lstatSync(file);
  if (!stat.isFile() || stat.isSymbolicLink())
    throw new Error("安装清单不是普通文件");
  return parseBackendManifest(fs.readFileSync(file));
}
function validRef(value: FileReference): boolean {
  return Boolean(
    value &&
    ["baseDir", "cwd", "home"].includes(value.root) &&
    typeof value.path === "string" &&
    value.path &&
    !value.path.includes("\\") &&
    !path.isAbsolute(value.path) &&
    !value.path
      .split("/")
      .some((part) => !part || part === "." || part === ".."),
  );
}
export function assertManifestIdentity(
  ctx: InstallContext,
  manifest: ProductManifest,
): void {
  if (
    manifest.runtime !== ctx.runtime ||
    manifest.scope !== (ctx.isGlobal ? "global" : "local")
  )
    throw new Error("清单身份不匹配：runtime/scope 不能切换");
}
export function resolveReference(
  ctx: InstallContext,
  reference: FileReference,
): string {
  if (!validRef(reference)) throw new Error("托管文件路径越界");
  return safeDestination(
    path.resolve(ctx[reference.root], reference.path),
    allowedRoots(ctx),
  );
}
export function referenceFor(ctx: InstallContext, file: string): FileReference {
  const target = safeDestination(file, allowedRoots(ctx));
  for (const root of ["baseDir", "cwd", "home"] as ManifestRoot[]) {
    const base = canonicalPath(ctx[root]);
    if (target !== base && inside(base, target))
      return {
        root,
        path: path.relative(base, target).split(path.sep).join("/"),
      };
  }
  throw new Error("无法为托管文件确定相对根");
}

export function writeManaged(
  ctx: InstallContext,
  file: string,
  content: Buffer,
): void {
  if (!ctx.session) throw new Error("托管写入需要显式会话");
  const reference = referenceFor(ctx, file);
  if (
    !reference.path
      .split(/[\\/]/)
      .some((part) => /^bec-[a-z0-9]|^backend-craft(?:[.-]|$)/i.test(part))
  )
    throw new Error("共享入口不能纳入私有文件命名空间");
  ctx.session.writeManaged(file, content);
}
