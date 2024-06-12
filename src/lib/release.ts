import { FetchApi } from "./changelog/fetch";
import { RenderAPI } from "./changelog/render";
import { lastTag } from "./git";
import { Change, Api, Config as FullConf, ChangeType } from "./changelog/types";
import { propEq } from "ramda";
import { Github } from "./gh";

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

  public changelog = async () => {
    const version = await this.initialVersion();
    const changes = await this.fetch.changes(version);
    await this.next(isBreaking(changes));
    return this.render.changes(await this.version(), changes);
  };

  public release = (dry: boolean) =>
    this.changelog().then((txt) =>
      this.config.setup().then(() => (dry ? undefined : this.open(txt)))
    );
}
