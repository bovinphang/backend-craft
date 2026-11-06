import type {
  CommonPointer,
  InstallContext,
  ProductManifest,
  ProductSessionResult,
  ManagedFile,
} from "./types.js";
import type { FileReference, ManifestRoot } from "./types.js";
import type { OwnedEntry } from "./shared-config/types.js";
import path from "node:path";
import { PRODUCT } from "../product.js";
import { hashBytes } from "../content/snapshot.js";
import {
  safeDestination,
  canonicalPath,
  inside,
  assertProductPath,
  privateNamespace,
  pathKey,
} from "./safe-path.js";
import { readPlanned, writePlanned, existsPlanned } from "./product-plan.js";
import { planSharedEntry } from "./shared-config/index.js";

const hashPattern = /^[a-f0-9]{64}$/;
const validRef = (value: FileReference): boolean =>
  Boolean(
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
export const allowedRoots = (ctx: InstallContext): string[] =>
  ctx.allowedRoots ?? [ctx.baseDir, ...(ctx.isGlobal ? [] : [ctx.cwd])];
export function manifestPath(ctx: InstallContext): string {
  return safeDestination(
    path.join(ctx.baseDir, PRODUCT.manifestName),
    allowedRoots(ctx),
  );
}
export function readManifest(file: string): ProductManifest | undefined {
  if (!existsPlanned(file)) return undefined;
  let value: ProductManifest;
  try {
    value = JSON.parse(readPlanned(file).toString("utf8")) as ProductManifest;
  } catch {
    throw new Error("无法读取后端安装清单");
  }
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value) ||
    value.schemaVersion !== 1 ||
    value.product !== PRODUCT.name ||
    typeof value.packageVersion !== "string" ||
    typeof value.runtime !== "string" ||
    !["local", "global"].includes(value.scope) ||
    !["en", "zh-CN"].includes(value.language) ||
    typeof value.installedAt !== "string" ||
    !Array.isArray(value.files) ||
    !Array.isArray(value.sharedEntries)
  )
    throw new Error("后端安装清单结构无效");
  const seen = new Set<string>();
  for (const entry of value.files) {
    if (!validRef(entry)) throw new Error("清单路径无效或越界");
    assertProductPath(entry.path);
    if (!privateNamespace(entry.path) || !hashPattern.test(entry.hash))
      throw new Error("清单私有文件命名或哈希无效");
    const key = `${entry.root}:${entry.path}`;
    if (seen.has(key)) throw new Error("清单文件重复");
    seen.add(key);
  }
  for (const entry of value.sharedEntries)
    if (
      !validRef(entry) ||
      !entry.entry ||
      !["text-marker", "json-path", "json-hook", "toml-key"].includes(
        entry.entry.kind,
      ) ||
      typeof entry.entry.id !== "string" ||
      !entry.entry.id.startsWith("backend-craft") ||
      !hashPattern.test(entry.entry.hash)
    )
      throw new Error("清单共享条目或路径无效");
  if (
    value.common &&
    (!path.isAbsolute(value.common.target) ||
      !path.isAbsolute(value.common.ledgerDir) ||
      !hashPattern.test(value.common.digest))
  )
    throw new Error("清单公共依赖指针无效");
  return value;
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
interface Session {
  requestedFiles: Set<string>;
  requestedShared: Set<string>;
  previousFiles: Map<string, ManagedFile>;
  ctx: InstallContext;
  previous?: ProductManifest;
  manifest: ProductManifest;
  preserved: string[];
  changed: string[];
}
let session: Session | undefined;
export function beginManifestSession(
  ctx: InstallContext,
  common?: CommonPointer,
): void {
  if (session) throw new Error("清单会话不能嵌套");
  const previous = readManifest(manifestPath(ctx));
  if (previous) assertManifestIdentity(ctx, previous);
  if (
    previous?.common &&
    (!common ||
      previous.common.target !== common.target ||
      previous.common.ledgerDir !== common.ledgerDir)
  )
    throw new Error("清单公共目标身份不匹配");
  for (const entry of previous?.files ?? []) resolveReference(ctx, entry);
  for (const entry of previous?.sharedEntries ?? [])
    resolveReference(ctx, entry);
  session = {
    requestedFiles: new Set(),
    requestedShared: new Set(),
    previousFiles: new Map(
      (previous?.files ?? []).map((entry) => [
        pathKey(resolveReference(ctx, entry)),
        entry,
      ]),
    ),
    ctx,
    previous,
    manifest: {
      schemaVersion: 1,
      product: PRODUCT.name,
      packageVersion: PRODUCT.version,
      runtime: ctx.runtime,
      scope: ctx.isGlobal ? "global" : "local",
      language: ctx.language,
      installedAt: previous?.installedAt ?? new Date().toISOString(),
      files: [...(previous?.files ?? [])],
      sharedEntries: [...(previous?.sharedEntries ?? [])],
      ...(common ? { common } : {}),
    },
    preserved: [],
    changed: [],
  };
}
export function writeManaged(file: string, content: Buffer): void {
  if (!session) throw new Error("托管写入需要清单会话");
  const { ctx, manifest } = session;
  const target = safeDestination(file, allowedRoots(ctx));
  assertProductPath(target);
  const reference = referenceFor(ctx, target);
  if (!privateNamespace(reference.path))
    throw new Error("共享入口不能纳入私有文件命名空间");
  const old = session.previousFiles.get(pathKey(target));
  session.requestedFiles.add(pathKey(target));
  if (
    existsPlanned(target) &&
    (!old || hashBytes(readPlanned(target)) !== old.hash)
  ) {
    session.preserved.push(target);
    return;
  }
  writePlanned(target, content);
  manifest.files = manifest.files.filter(
    (entry) =>
      !(entry.root === reference.root && entry.path === reference.path) &&
      entry !== old,
  );
  manifest.files.push({ ...reference, hash: hashBytes(content) });
  session.changed.push(target);
}
export function recordSharedEntry(file: string, entry: OwnedEntry): void {
  if (!session) throw new Error("共享条目需要清单会话");
  const reference = referenceFor(session.ctx, file);
  session.requestedShared.add(
    pathKey(resolveReference(session.ctx, reference)) + ":" + entry.id,
  );
  session.manifest.sharedEntries = session.manifest.sharedEntries.filter(
    (old) =>
      !(
        old.root === reference.root &&
        old.path === reference.path &&
        old.entry.id === entry.id
      ),
  );
  session.manifest.sharedEntries.push({ ...reference, entry });
}
export function previousSharedEntry(
  file: string,
  id: string,
): OwnedEntry | undefined {
  if (!session) throw new Error("共享条目需要清单会话");
  const key = pathKey(safeDestination(file, allowedRoots(session.ctx)));
  return session.previous?.sharedEntries.find(
    (entry) =>
      pathKey(resolveReference(session!.ctx, entry)) === key &&
      entry.entry.id === id,
  )?.entry;
}
export function preserveShared(file: string): void {
  if (!session) throw new Error("共享条目需要清单会话");
  const key = pathKey(safeDestination(file, allowedRoots(session.ctx)));
  for (const record of session.previous?.sharedEntries ?? [])
    if (pathKey(resolveReference(session.ctx, record)) === key)
      session.requestedShared.add(key + ":" + record.entry.id);
  session.preserved.push(file);
}
export function endManifestSession(): ProductSessionResult {
  if (!session) throw new Error("没有清单会话");
  const current = session;
  session = undefined;
  for (const old of current.previous?.files ?? []) {
    const file = resolveReference(current.ctx, old);
    if (current.requestedFiles.has(pathKey(file))) continue;
    if (existsPlanned(file) && hashBytes(readPlanned(file)) !== old.hash) {
      current.preserved.push(file);
      continue;
    }
    writePlanned(file, null);
    current.manifest.files = current.manifest.files.filter(
      (entry) => entry !== old,
    );
    current.changed.push(file);
  }
  for (const old of current.previous?.sharedEntries ?? []) {
    const file = resolveReference(current.ctx, old);
    if (current.requestedShared.has(pathKey(file) + ":" + old.entry.id))
      continue;
    const mutation = planSharedEntry(file, old.entry, "remove", old.entry);
    if (!mutation) {
      current.preserved.push(file);
      continue;
    }
    writePlanned(file, mutation.after);
    current.manifest.sharedEntries = current.manifest.sharedEntries.filter(
      (entry) => entry !== old,
    );
    current.changed.push(file);
  }
  current.manifest.files.sort((a, b) =>
    `${a.root}:${a.path}`.localeCompare(`${b.root}:${b.path}`, "en"),
  );
  current.manifest.sharedEntries.sort((a, b) =>
    `${a.root}:${a.path}:${a.entry.id}`.localeCompare(
      `${b.root}:${b.path}:${b.entry.id}`,
      "en",
    ),
  );
  writePlanned(
    manifestPath(current.ctx),
    Buffer.from(JSON.stringify(current.manifest, null, 2) + "\n"),
  );
  return {
    manifest: current.manifest,
    preserved: [...new Set(current.preserved)],
    changed: [...new Set(current.changed)],
  };
}
export function discardManifestSession(): void {
  session = undefined;
}
export function uninstallManagedFiles(
  ctx: InstallContext,
  manifest: ProductManifest,
): { remaining: ManagedFile[]; preserved: string[] } {
  assertManifestIdentity(ctx, manifest);
  const remaining: ManagedFile[] = [],
    preserved: string[] = [];
  for (const entry of manifest.files) {
    const file = resolveReference(ctx, entry);
    assertProductPath(file);
    if (!privateNamespace(entry.path))
      throw new Error("清单不允许认领共享命名空间");
    if (!existsPlanned(file)) continue;
    if (hashBytes(readPlanned(file)) !== entry.hash) {
      remaining.push(entry);
      preserved.push(file);
      continue;
    }
    writePlanned(file, null);
  }
  return { remaining, preserved };
}
