import { Github } from "../gh";

export type LabelType = "pr" | "scope";

export type ChangeType = "major" | "breaking" | "feature" | "fix" | "chore";

export type Config = {
  gh: string;
  scope: Record<string, string>;
  pr: Record<ChangeType, string>;
  pkg: string;
  next(isBreaking: boolean): Promise<void>;
  version(): Promise<string>;
  setup(): Promise<void>;
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
