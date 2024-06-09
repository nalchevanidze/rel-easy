import { Github } from "../gh";

export type LabelType = "pr" | "scope";

export type ChangeType = "major" | "breaking" | "feature" | "fix" | "chore";

export type Config = {
  gh: {
    org: string;
    repo: string;
  };
  scope: Record<string, string>;
  pr: Record<ChangeType, string>;
  pkg(s: string): string;
  version(): Promise<string>;
  next(isBreaking: boolean): Promise<string>;
};

export type Commit = {
  message: string;
  associatedPullRequests: {
    nodes: Array<{ number: number; repository: { nameWithOwner: string } }>;
  };
};

export type PR = {
  number: number;
  title: string;
  body: string;
  author: { login: string; url: string };
  labels: { nodes: { name: string }[] };
};

export type Change = PR & {
  type: ChangeType;
  scopes: string[];
};

export class Api {
  constructor(protected config: Config, protected github: Github) {}
}
