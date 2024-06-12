import { FetchApi } from "./changelog/fetch";
import { RenderAPI } from "./changelog/render";
import { lastTag } from "./git";
import { Change, Api, Config as FullConf, ChangeType } from "./changelog/types";
import { propEq } from "ramda";
import { Github } from "./gh";
import { writeFile } from "fs/promises";

const isBreaking = (changes: Change[]) =>
  Boolean(changes.find(propEq("type", "breaking")));

export type Config = Omit<FullConf, "pr"> & { pr?: Record<ChangeType, string> };

const pr = {
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

  constructor(config: Config) {
    const github = new Github(config.gh);
    const cfg = { pr, ...config };
    super(cfg, github);
    this.fetch = new FetchApi(cfg, github);
    this.render = new RenderAPI(cfg, github);
  }

  version = () => this.config.version();

  private initialVersion = async () => {
    const version = lastTag();
    const projectVersion = await this.version();

    if (version !== projectVersion) {
      throw Error(`versions does not match: ${version} ${projectVersion}`);
    }

    return version;
  };

  private next = async (isBreaking: boolean) => this.config.next(isBreaking);

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
        this.config.setup().then(() => (dry ? undefined : this.open(txt)))
      )
      .catch(exit);
}
