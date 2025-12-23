import { execSync, StdioOptions } from "child_process";
import { exec as execAsync } from "node:child_process";
import { promisify } from "node:util";

const BUFFER = 10 * 1024 * 1024; // 10MB
const ENCODING = "utf-8" as const;

export const isKey = <T extends string>(
  obj: Record<T, unknown>,
  key?: string | null
): key is T => typeof key === "string" && key in obj;

export const exec = (command: string, stdio?: StdioOptions) =>
  execSync(command, {
    maxBuffer: BUFFER,
    encoding: ENCODING,
    stdio,
  })?.trimEnd();

export class CLI {
  static async void(cmd: string) {
    console.log(await CLI.exec(cmd));
  }

  static async exec(cmd: string) {
    const { stdout } = await promisify(execAsync)(cmd, {
      maxBuffer: BUFFER,
      encoding: ENCODING,
    });

    return stdout.trim();
  }
}
