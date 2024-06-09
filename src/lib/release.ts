import { FetchApi } from "./changelog/fetch";
import { RenderAPI } from "./changelog/render";
import { lastTag } from "./git";
import { Change, Api, Config } from "./changelog/types";
import { propEq } from "ramda";
import { Github } from "./gh";

const isBreaking = (changes: Change[]) =>
  Boolean(changes.find(propEq("type", "breaking")));

export class GHRelEasy extends Api {

  private fetch: FetchApi;
  private render: RenderAPI;

  constructor(config: Config) {
    const github = new Github(config.gh.org, config.gh.repo);
    super(config, github);
    this.fetch = new FetchApi(config, github);
    this.render = new RenderAPI(config, github);
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

  public changelog = async () => {
    const version = await this.initialVersion();
    const changes = await this.fetch.changes(version);
    const nextVersion = await this.next(isBreaking(changes));
    return this.render.changes(nextVersion, changes);
  };

  public open = async (body: string) => {
    this.github.release(await this.version(), body);
  };
}
