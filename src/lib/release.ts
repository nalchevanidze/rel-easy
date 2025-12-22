import { FetchApi } from "./changelog/fetch";
import { RenderAPI } from "./changelog/render";
import { lastTag } from "./git";
import {
  Change,
  Api,
  Config,
  RawConfig,
  ConfigSchema,
} from "./changelog/types";
import { propEq } from "ramda";
import { Github } from "./gh";
import { writeFile, readFile } from "fs/promises";
import { cliActions } from "./cli-actions";
import { CLI } from "./cli";
const isBreaking = (changes: Change[]) =>
  Boolean(changes.find(propEq("type", "breaking")));

const defaultPR = {
  major: "Major Change",
  breaking: "Breaking Change",
  feature: "New features",
  fix: "Bug Fixes",
  chore: "Minor Changes",
};

const exit = (error: Error) => {
  console.log(error.message);
  process.exit(1);
};

export class GHRelEasy extends Api {
  private fetch: FetchApi;
  private render: RenderAPI;

  constructor({ pr, ...config }: RawConfig) {
    const github = new Github(config.gh);
    const cfg: Config = { pr: { ...defaultPR, ...pr }, ...config };
    super(cfg, github);
    this.fetch = new FetchApi(cfg, github);
    this.render = new RenderAPI(cfg, github);
  }

  public static async load() {
    const data = await readFile("./releasy.json", "utf8").then(JSON.parse);
    const config = ConfigSchema.parse(data);
    return new GHRelEasy(config);
  }

  public static async cli() {
    GHRelEasy.load()
      .then((rel) => rel.cli())
      .catch(exit);
  }

  public version = () => CLI.exec(this.config.version);

  private initialVersion = async () => {
    const version = lastTag();
    const projectVersion = await this.version();

    if (version !== projectVersion) {
      throw Error(`versions does not match: ${version} ${projectVersion}`);
    }

    return version;
  };

  private next = async (isBreaking: boolean) => {
    const flags = isBreaking ? ["-b"] : [];
    return CLI.void(this.config.next, ...flags);
  };

  private open = async (body: string) => {
    this.github.release(await this.version(), body);
  };

  private genChangelog = async (save?: string) => {
    const version = await this.initialVersion();
    const changes = await this.fetch.changes(version);
    await this.next(isBreaking(changes));
    const txt = await this.render.changes(await this.version(), changes);

    if (save) {
      await writeFile(`./${save}.md`, txt, "utf8");
    }

    return txt;
  };

  public changelog = async (save?: string) =>
    this.genChangelog(save).catch(exit);

  public release = (dry: boolean) =>
    this.genChangelog()
      .then((txt) =>
        CLI.void(this.config.setup).then(() =>
          dry ? undefined : this.open(txt)
        )
      )
      .catch(exit);

  public cli() {
    cliActions(this);
  }
}
