import { exec } from "node:child_process";
import { promisify } from "node:util";

export { GHRelEasy, Config } from "./lib/release";

const BUFFER = 10 * 1024 * 1024;

export const runCli =
  (name: string) =>
  async (...ops: string[]) => {
    const { stdout } = await promisify(exec)([name, ops].flat().join(" "), {
      maxBuffer: BUFFER,
      encoding: "utf-8",
    });

    return stdout.trim();
  };
