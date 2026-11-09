import {
  isSnapshotResource,
  hashBytes as commonHashBytes,
} from "@bovinphang/craft-common";
import { SNAPSHOT_DECLARATIONS } from "./snapshot-declarations.js";
export { snapshotPath, mixedIndex } from "@bovinphang/craft-common";
export const hashBytes = (value: string | Buffer): string =>
  commonHashBytes(Buffer.from(value));
export const generatedResource = (relative: string): boolean =>
  isSnapshotResource(relative, SNAPSHOT_DECLARATIONS);
