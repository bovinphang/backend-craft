import fs from "node:fs";
import path from "node:path";
export function resolveProjectPath(
  workspace: string,
  relative: string,
  mustExist = true,
): string {
  if (
    typeof relative !== "string" ||
    !relative ||
    relative.includes("\0") ||
    path.isAbsolute(relative)
  )
    throw new Error("配置路径必须是工作区相对路径");
  const boundary = fs.realpathSync(workspace),
    target = path.resolve(boundary, relative),
    rest = path.relative(boundary, target);
  if (
    path.isAbsolute(rest) ||
    rest === ".." ||
    rest.startsWith(`..${path.sep}`)
  )
    throw new Error("配置路径越界");
  let current = target;
  while (current !== boundary) {
    try {
      if (fs.lstatSync(current).isSymbolicLink())
        throw new Error("配置路径不允许内部链接");
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    }
    current = path.dirname(current);
  }
  if (mustExist && !fs.existsSync(target)) throw new Error("配置路径不存在");
  return target;
}
