import { execSync, StdioOptions } from "child_process";

export const isKey = <T extends string>(
  obj: Record<T, unknown>,
  key?: string | null
): key is T => typeof key === "string" && key in obj;

export const exec = (command: string, stdio?: StdioOptions) =>
  execSync(command, {
    maxBuffer: 10 * 1024 * 1024, // 10MB
    encoding: "utf-8",
    stdio,
  })?.trimEnd();
