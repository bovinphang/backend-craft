import spawn from "cross-spawn";
import { spawn as nativeSpawn } from "node:child_process";
import path from "node:path";
import type { StageSpec } from "./types.js";

export interface ProcessResult {
  code: number | null;
  stdout: string;
  stderr: string;
  error?: "missing" | "failed";
  stopped?: "timeout" | "cancelled" | "output";
  cleanupFailed?: boolean;
}
async function terminateTree(pid: number): Promise<boolean> {
  if (process.platform === "win32") {
    const command = path.join(
      process.env.SystemRoot ?? "C:\\Windows",
      "System32/taskkill.exe",
    );
    return new Promise((resolve) => {
      const kill = nativeSpawn(command, ["/PID", String(pid), "/T", "/F"], {
        stdio: "ignore",
        windowsHide: true,
      });
      kill.once("error", () => resolve(false));
      kill.once("close", (code) => resolve(code === 0));
    });
  }
  try {
    process.kill(-pid, "SIGKILL");
    return true;
  } catch (error) {
    return (error as NodeJS.ErrnoException).code === "ESRCH";
  }
}
export function runProcess(
  stage: StageSpec,
  signal?: AbortSignal,
): Promise<ProcessResult> {
  return new Promise((resolve) => {
    let stdout = "",
      stderr = "",
      bytes = 0,
      stopped: ProcessResult["stopped"],
      error: ProcessResult["error"],
      closed = false;
    let termination: Promise<boolean> | undefined,
      deadline: ReturnType<typeof setTimeout> | undefined;
    const environment = { ...process.env, ...stage.env };
    // node:test 的内部父进程标记会让独立测试命令跳过全部文件。
    delete environment.NODE_TEST_CONTEXT;
    const child = spawn(stage.executable, stage.args, {
      cwd: stage.cwd,
      env: environment,
      stdio: ["ignore", "pipe", "pipe"],
      shell: false,
      windowsHide: true,
      detached: process.platform !== "win32",
    });
    const finish = async (code: number | null): Promise<void> => {
      if (closed) return;
      closed = true;
      clearTimeout(timer);
      if (deadline) clearTimeout(deadline);
      signal?.removeEventListener("abort", abort);
      const clean = termination ? await termination : true;
      resolve({
        code,
        stdout,
        stderr,
        ...(error ? { error } : {}),
        ...(stopped ? { stopped } : {}),
        ...(!clean ? { cleanupFailed: true } : {}),
      });
    };
    const stop = (reason: NonNullable<ProcessResult["stopped"]>): void => {
      if (stopped || closed) return;
      stopped = reason;
      if (child.pid) termination = terminateTree(child.pid);
      deadline = setTimeout(() => {
        child.stdout?.destroy();
        child.stderr?.destroy();
        child.unref();
        void finish(null);
      }, 3000);
    };
    const abort = (): void => stop("cancelled");
    const timer = setTimeout(() => stop("timeout"), stage.timeoutMs);
    signal?.addEventListener("abort", abort, { once: true });
    if (signal?.aborted) abort();
    const collect = (stream: "stdout" | "stderr", chunk: Buffer): void => {
      bytes += chunk.length;
      if (bytes > 1048576) {
        stop("output");
        return;
      }
      if (stream === "stdout") stdout += chunk.toString("utf8");
      else stderr += chunk.toString("utf8");
    };
    child.stdout?.on("data", (chunk: Buffer) => collect("stdout", chunk));
    child.stderr?.on("data", (chunk: Buffer) => collect("stderr", chunk));
    child.once("error", (err) => {
      error =
        (err as NodeJS.ErrnoException).code === "ENOENT" ? "missing" : "failed";
    });
    child.once("close", (code) => {
      void finish(code);
    });
  });
}
