import type { ManifestCodec } from "@bovinphang/craft-common";
import type { ProductManifest, FileReference } from "./types.js";
import path from "node:path";
import { PRODUCT } from "../product.js";
import { assertProductPath, privateNamespace } from "./safe-path.js";
import { referenceFor, resolveReference } from "./manifest.js";
import type { InstallContext } from "./types.js";
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

export function parseBackendManifest(bytes: Buffer): ProductManifest {
  let value: ProductManifest;
  try {
    value = JSON.parse(bytes.toString("utf8")) as ProductManifest;
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

function legacyContext(
  ctx: Parameters<ManifestCodec["decode"]>[1],
): InstallContext {
  return {
    ...ctx,
    productRoot: "",
    contentRoot: "",
    isGlobal: ctx.scope === "global",
    mode: "install",
  };
}
export const MANIFEST_CODEC: ManifestCodec = {
  decode(bytes, ctx) {
    const original = parseBackendManifest(bytes),
      context = legacyContext(ctx);
    return {
      product: original.product,
      packageVersion: original.packageVersion,
      runtime: original.runtime,
      scope: original.scope,
      language: original.language,
      installedAt: original.installedAt,
      files: original.files.map((file) => ({
        path: resolveReference(context, file),
        hash: file.hash,
      })),
      sharedEntries: original.sharedEntries.map((record) => ({
        path: resolveReference(context, record),
        entry: record.entry,
      })),
      ...(original.common ? { common: original.common } : {}),
    };
  },
  encode(state, ctx) {
    const context = legacyContext(ctx);
    const manifest: ProductManifest = {
      schemaVersion: 1,
      product: PRODUCT.name,
      packageVersion: state.packageVersion,
      runtime: state.runtime,
      scope: state.scope,
      language: state.language,
      installedAt: state.installedAt,
      files: state.files.map((file) => ({
        ...referenceFor(context, file.path),
        hash: file.hash,
      })),
      sharedEntries: state.sharedEntries.map((record) => ({
        ...referenceFor(context, record.path),
        entry: record.entry,
      })),
      ...(state.common ? { common: state.common } : {}),
    };
    return Buffer.from(JSON.stringify(manifest, null, 2) + "\n");
  },
};
