import type { FileMutation } from "@bovinphang/craft-common";
import type { OwnedEntry } from "./types.js";
import { readPlanned, existsPlanned } from "../product-plan.js";
import { hashBytes } from "../../content/snapshot.js";
import { editText, textFragment } from "./text.js";
import { editJson, readJson, getPath, safeKeys } from "./json.js";
import { editToml, fragment } from "./toml.js";
import { parse as parseToml } from "smol-toml";
export function stable(value: unknown): string {
  if (Array.isArray(value)) return "[" + value.map(stable).join(",") + "]";
  if (value && typeof value === "object")
    return (
      "{" +
      Object.keys(value)
        .sort()
        .map(
          (k) =>
            JSON.stringify(k) +
            ":" +
            stable((value as Record<string, unknown>)[k]),
        )
        .join(",") +
      "}"
    );
  return JSON.stringify(value);
}
export function entryHash(entry: {
  kind: OwnedEntry["kind"];
  value: unknown;
}): string {
  return hashBytes(
    Buffer.from(
      entry.kind === "text-marker"
        ? textFragment(String(entry.value))
        : stable(entry.value),
    ),
  );
}
export function planSharedEntry(
  file: string,
  entry: OwnedEntry,
  action: "upsert" | "remove",
  previous?: OwnedEntry,
): FileMutation | undefined {
  if (
    !/^backend-craft(?:-[a-z0-9-]+)?$/.test(entry.id) ||
    entry.hash !== entryHash(entry)
  )
    throw new Error("共享条目身份或摘要无效");
  const before = existsPlanned(file) ? readPlanned(file) : null,
    body = before?.toString("utf8") ?? "";
  if (action === "remove" && before === null)
    return { path: file, beforeHash: null, after: null };
  if (action === "remove" && previous) {
    const status = sharedEntryStatus(file, previous);
    if (status === "modified") return;
    if (status === "missing")
      return { path: file, beforeHash: hashBytes(before!), after: before };
  }
  const after =
    entry.kind === "text-marker"
      ? editText(body, entry, action, previous)
      : entry.kind === "toml-key"
        ? editToml(body, entry, action, previous)
        : editJson(body, entry, action, previous);
  if (after === undefined) return;
  const result = after === null ? null : Buffer.from(after);
  return {
    path: file,
    beforeHash: before === null ? null : hashBytes(before),
    after: result,
  };
}
export function sharedEntryStatus(
  file: string,
  entry: OwnedEntry,
): "healthy" | "missing" | "modified" {
  if (!existsPlanned(file)) return "missing";
  try {
    if (entry.hash !== entryHash(entry)) return "modified";
    const body = readPlanned(file).toString("utf8");
    if (entry.kind === "text-marker") {
      const start = "<!-- backend-craft:start -->",
        end = "<!-- backend-craft:end -->";
      if (!body.includes(start) && !body.includes(end)) return "missing";
      return body.split(start).length === 2 &&
        body.split(end).length === 2 &&
        body.includes(textFragment(entry.value))
        ? "healthy"
        : "modified";
    }
    const root =
      entry.kind === "toml-key"
        ? (parseToml(body) as Record<string, unknown>)
        : readJson(body);
    if (entry.kind === "json-hook") {
      safeKeys(["hooks", entry.event]);
      const array = getPath(root, ["hooks", entry.event]);
      if (array === undefined) return "missing";
      if (!Array.isArray(array)) return "modified";
      const matches = array.filter(
        (value) => entryHash({ kind: "json-hook", value }) === entry.hash,
      ).length;
      return matches === 1
        ? "healthy"
        : matches === 0 && array.length === 0
          ? "missing"
          : "modified";
    }
    safeKeys(entry.path);
    const value = getPath(root, entry.path);
    if (value === undefined) return "missing";
    if (entryHash({ kind: entry.kind, value }) !== entry.hash)
      return "modified";
    return entry.kind === "toml-key" && !body.includes(fragment(entry))
      ? "modified"
      : "healthy";
  } catch {
    return "modified";
  }
}
