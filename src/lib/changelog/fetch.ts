import { isNil, map, pluck, reject, uniq } from "ramda";
import { Maybe } from "../types";
import { Change, Api, Commit, Config, LabelType, PR } from "./types";
import { commitsAfter } from "../git";

const parseNumber = (msg: string) => {
  const num = / \(#(?<prNumber>[0-9]+)\)$/m.exec(msg)?.groups?.prNumber;
  return num ? parseInt(num, 10) : undefined;
};



export class FetchApi extends Api {
  parseLabels = <T extends LabelType>(t: T, labels: string[]) =>
    labels.flatMap((label: string) => {
      const [prefix, name, ...rest] = label.split("/");

      if (prefix !== t) [];

      if (rest.length || !name || !this.config[t][name]) {
        throw new Error(`invalid label ${label}`);
      }

      return [name] as Array<keyof Config[T]>;
    });

  private commits = this.github.batch<Commit>(
    (i) =>
      `object(oid: "${i}") {
      ... on Commit {
        message
        associatedPullRequests(first: 10) { 
          nodes {
            number
            repository { nameWithOwner }
          }
        }
      }
    }`
  );

  private pullRequests = this.github.batch<PR>(
    (i) =>
      `pullRequest(number: ${i}) {
      number
      title
      body
      author { login url }
      labels(first: 10) { nodes { name } }
    }`
  );

  private toPRNumber = (c: Commit): Maybe<number> =>
    c.associatedPullRequests.nodes.find(({ repository }) =>
      this.github.isOwner(repository)
    )?.number ?? parseNumber(c.message);

  public changes = (version: string) =>
    this.commits(commitsAfter(version))
      .then((c) => uniq(reject(isNil, c.map(this.toPRNumber))))
      .then(this.pullRequests)
      .then(
        map((pr): Change => {
          const labels = pluck("name", pr.labels.nodes);

          return {
            ...pr,
            type: this.parseLabels("pr", labels).find(Boolean) ?? "chore",
            scopes: this.parseLabels("scope", labels),
          };
        })
      );
}
