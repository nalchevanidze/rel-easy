import { exec } from "node:child_process";
import { promisify } from "node:util";

const BUFFER = 10 * 1024 * 1024;

type Option = string | false | undefined;

export class CLI {

  constructor(private name:string){}

  void(...ops: Option[]){
    console.log(this.exec(...ops))
  }

  exec = async (...ops: Option[]) => {
    const { stdout } = await promisify(exec)(
      [this.name, ops].filter(Boolean).flat().join(" "),
      {
        maxBuffer: BUFFER,
        encoding: "utf-8",
      }
    );

    return stdout.trim();
  };
}