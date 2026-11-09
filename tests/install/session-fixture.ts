import path from "node:path";
import {
  createInstallSession,
  type InstallSession,
} from "@bovinphang/craft-common";
import { PRODUCT_DEFINITION } from "../../src/product.js";

export function testSession(root: string): InstallSession {
  return createInstallSession({
    definition: PRODUCT_DEFINITION,
    action: "install",
    context: {
      packageVersion: "1.0.0",
      runtime: "claude",
      scope: "local",
      language: "en",
      cwd: root,
      home: root,
      baseDir: root,
      allowedRoots: [root],
      dryRun: false,
    },
  });
}
export async function planForFile(
  file: string,
  operation: (session: InstallSession) => Promise<void>,
): Promise<ReturnType<InstallSession["finish"]>["mutations"]> {
  const session = testSession(path.dirname(file));
  await operation(session);
  return session.finish().mutations;
}
