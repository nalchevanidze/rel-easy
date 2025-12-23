import { GHRelEasy } from "./release";
import { Command } from "commander";

export const cliActions = async (easy: GHRelEasy) => {
  const cli = new Command()
    .name("Releasy")
    .description("Generate Automated Releases")
    .version("0.26.0");

  cli
    .command("open")
    .option("-d, --dry", "only changelog and setup", false)
    .action(({ dry }: { dry: boolean }) => easy.release(dry));

  cli
    .command("changelog")
    .action(() => easy.changelog("changelog").then(() => undefined));

  cli.parse();
};
