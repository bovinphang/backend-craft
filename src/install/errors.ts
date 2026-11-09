/** Keep existing Chinese product diagnostics while preserving common error causes. */
export function backendInstallError(error: unknown): never {
  if (!(error instanceof Error)) throw error;
  const messages: Array<[RegExp, string]> = [
    [
      /^Pending (?:common|product) transaction recovery/,
      "存在待恢复事务，dry-run 不执行恢复",
    ],
    [
      /^Product path.*(?:boundary|declared boundary)/,
      "托管目标越过允许路径边界",
    ],
    [/^Product path contains an internal link/, "托管目标不允许内部链接"],
    [/^Product cannot claim a common namespace/, "产品不能认领公共资源"],
    [/^Product cannot claim another/, "产品不能认领其他产品命名空间"],
    [
      /^Product write targets reserved ownership state/,
      "产品不能认领保留的所有权状态",
    ],
    [
      /^(?:Product manifest|Product common target|Common consumer) identity mismatch/,
      "安装清单身份不匹配",
    ],
  ];
  const label = messages.find(([pattern]) => pattern.test(error.message))?.[1];
  if (label) throw new Error(`${label}: ${error.message}`, { cause: error });
  throw error;
}
