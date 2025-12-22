import { exec } from "node:child_process";
import { promisify } from "node:util";

const BUFFER = 10 * 1024 * 1024;

type Option = string | false | undefined;

export class CLI {
  static async void(cmd: string, ...addons: Option[]) {
    console.log(await CLI.exec(cmd, ...addons));
  }

  static async exec(cmd: string, ...addons: Option[]) {
    const [name, ...ops] = cmd.split(" ");

    const { stdout } = await promisify(exec)(
      [name, ...ops, ...addons].filter(Boolean).flat().join(" "),
      {
        maxBuffer: BUFFER,
        encoding: "utf-8",
      }
    );

    return stdout.trim();
  }
}
