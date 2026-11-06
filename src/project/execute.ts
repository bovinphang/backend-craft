import type { ValidationPlan, ValidationResult } from "./types.js";
import fs from "node:fs";
import path from "node:path";
import { runProcess } from "./process.js";
import { hasTestEvidence, hasFreshTestReport } from "./test-evidence.js";
import { resolveToolPath } from "./toolchain.js";
export async function executeValidation(
  plan: ValidationPlan,
  { signal }: { signal?: AbortSignal } = {},
): Promise<ValidationResult> {
  const result: ValidationResult = {
    schemaVersion: 1,
    results: [],
    exitCode: 0,
  };
  if (plan.problems.length || !plan.stages.length)
    return { ...result, exitCode: 2 };
  const failed = new Set<string>();
  for (const stage of plan.stages) {
    const started = Date.now();
    const base = { id: stage.id, exitCode: null, durationMs: 0 };
    if (signal?.aborted) {
      result.results.push({
        ...base,
        status: "cancelled",
        reason: "验证已取消",
      });
      continue;
    }
    if (stage.skipReason || failed.has(stage.cwd)) {
      result.results.push({
        ...base,
        status: "skipped",
        reason: stage.skipReason ?? "同项目先前阶段失败",
      });
      continue;
    }
    if (
      !Number.isInteger(stage.timeoutMs) ||
      stage.timeoutMs < 1 ||
      stage.timeoutMs > 600000 ||
      !Array.isArray(stage.args) ||
      stage.args.some((arg) => typeof arg !== "string" || arg.includes("\0")) ||
      !fs.existsSync(stage.cwd)
    ) {
      result.results.push({
        ...base,
        status: "missing",
        reason: "阶段配置无效",
      });
      failed.add(stage.cwd);
      continue;
    }
    const executable = path.isAbsolute(stage.executable)
      ? stage.executable
      : resolveToolPath(stage.executable, stage.cwd);
    if (
      !executable ||
      !fs.existsSync(executable) ||
      !fs.statSync(executable).isFile()
    ) {
      result.results.push({ ...base, status: "missing", reason: "工具不存在" });
      failed.add(stage.cwd);
      continue;
    }
    const processResult = await runProcess({ ...stage, executable }, signal);
    let status: "passed" | "failed" | "missing" | "timeout" | "cancelled" =
        "passed",
      reason: string | undefined;
    if (processResult.error === "missing") {
      status = "missing";
      reason = "工具无法启动";
    } else if (processResult.stopped === "cancelled") {
      status = "cancelled";
      reason = "验证已取消";
    } else if (processResult.stopped === "timeout") {
      status = "timeout";
      reason = "命令执行超时";
    } else if (processResult.stopped === "output") {
      status = "failed";
      reason = "命令输出超过 1 MiB 上限";
    } else if (processResult.error || processResult.code !== 0) {
      status = "failed";
      reason = "命令执行失败";
    } else if (
      stage.phase === "test" &&
      !hasTestEvidence(processResult.stdout + "\n" + processResult.stderr) &&
      !hasFreshTestReport(stage.cwd, started)
    ) {
      status = "failed";
      reason = "没有确认实际运行过测试，零测试或跳过不能报成功";
    } else if (
      stage.phase === "format" &&
      /^gofmt(?:\.exe)?$/i.test(path.basename(executable)) &&
      processResult.stdout.trim()
    ) {
      status = "failed";
      reason = "gofmt 检查发现未格式化文件";
    }
    if (processResult.cleanupFailed) {
      status = "failed";
      reason = (reason ?? "执行停止") + "；无法确认子进程树已全部清理";
    }
    result.results.push({
      id: stage.id,
      status,
      exitCode: processResult.code,
      durationMs: Date.now() - started,
      ...(reason ? { reason } : {}),
    });
    if (status !== "passed" && stage.required) failed.add(stage.cwd);
  }
  const required = new Set(
    plan.stages.filter((stage) => stage.required).map((stage) => stage.id),
  );
  if (
    result.results.some((stage) => ["failed", "timeout"].includes(stage.status))
  )
    result.exitCode = 1;
  else if (
    result.results.some(
      (stage) =>
        required.has(stage.id) &&
        ["missing", "skipped", "cancelled"].includes(stage.status),
    )
  )
    result.exitCode = 2;
  return result;
}
