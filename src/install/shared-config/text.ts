import type { OwnedEntry } from "./types.js";
import { hashBytes } from "../../content/snapshot.js";
const start = "<!-- backend-craft:start -->",
  end = "<!-- backend-craft:end -->";
export const textFragment = (value: string): string =>
  "\n" + start + "\n" + value + "\n" + end + "\n";
export function editText(
  body: string,
  entry: Extract<OwnedEntry, { kind: "text-marker" }>,
  action: "upsert" | "remove",
  previous?: OwnedEntry,
): string | null | undefined {
  const starts = body.split(start).length - 1,
    ends = body.split(end).length - 1;
  if (starts === 0 && ends === 0)
    return action === "remove" ? body : body + textFragment(entry.value);
  if (
    starts !== 1 ||
    ends !== 1 ||
    !previous ||
    previous.kind !== "text-marker"
  )
    return;
  const first = body.indexOf(start) - 1,
    last = body.indexOf(end) + end.length + 1;
  if (first < 0 || last <= first) return;
  const owned = body.slice(first, last);
  if (hashBytes(Buffer.from(owned)) !== previous.hash) return;
  const after =
    body.slice(0, first) +
    (action === "upsert" ? textFragment(entry.value) : "") +
    body.slice(last);
  return action === "remove" && entry.createdFile && after === ""
    ? null
    : after;
}
