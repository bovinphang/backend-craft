import fs from "node:fs";
import {
  entryHash as hashEntry,
  configEntryStatus,
  planConfigEntry,
  hashBytes,
  type FileMutation,
  type InstallSession,
  type OwnedEntry,
} from "@bovinphang/craft-common";
import { PRODUCT_DEFINITION } from "../../product.js";
export function entryHash(entry: {
  kind: OwnedEntry["kind"];
  value: unknown;
}): string {
  return hashEntry(entry, PRODUCT_DEFINITION);
}
export function sharedEntryStatus(
  file: string,
  entry: OwnedEntry,
  session?: InstallSession,
): "healthy" | "missing" | "modified" {
  try {
    return configEntryStatus(
      session
        ? session.exists(file)
          ? session.read(file)
          : null
        : fs.existsSync(file)
          ? fs.readFileSync(file)
          : null,
      PRODUCT_DEFINITION,
      entry,
    );
  } catch {
    return "modified";
  }
}
export function planSharedEntry(
  file: string,
  entry: OwnedEntry,
  action: "upsert" | "remove",
  previous?: OwnedEntry,
  session?: InstallSession,
): FileMutation | undefined {
  const before = session
    ? session.exists(file)
      ? session.read(file)
      : null
    : fs.existsSync(file)
      ? fs.readFileSync(file)
      : null;
  const result = planConfigEntry({
    before,
    owner: PRODUCT_DEFINITION,
    entry,
    previous,
    action,
  });
  return result.status === "preserved"
    ? undefined
    : {
        path: file,
        beforeHash: before === null ? null : hashBytes(before),
        after: result.after,
      };
}
