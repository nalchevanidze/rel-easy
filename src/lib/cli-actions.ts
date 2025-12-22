import { GHRelEasy } from "./release";
import { Command } from "commander";

export const cliActions = async (gh: GHRelEasy) => {
  const cli = new Command()
    .name("release-cli")
    .description("Automated Releases")
    .version("1.0");

  cli
    .command("open")
    .option("-d, --dry", "only changelog and setup", false)
    .action(({ dry }: { dry: boolean }) => gh.release(dry));

  cli
    .command("changelog")
    .action(() => gh.changelog("changelog").then(() => undefined));

  cli.parse();
};
