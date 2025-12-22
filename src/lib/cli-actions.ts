import { GHRelEasy } from "./release";
import { Command } from "commander";

export const cliActions = async (easy: GHRelEasy) => {
  const cli = new Command()
    .name("release-cli")
    .description("Automated Releases")
    .version("1.0");

  cli
    .command("open")
    .option("-d, --dry", "only changelog and setup", false)
    .action(({ dry }: { dry: boolean }) => easy.release(dry));

  cli.command("gh-setup").action(() => {
    easy.github.setup();
  });

  cli
    .command("changelog")
    .action(() => easy.changelog("changelog").then(() => undefined));

  cli.parse();
};
