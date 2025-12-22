import * as z from "zod";
import { Github } from "../gh";

export type LabelType = "pr" | "scope";

export const ChangeTypeSchema = z.enum([
  "major",
  "breaking",
  "feature",
  "fix",
  "chore",
]);

export type ChangeType = z.infer<typeof ChangeTypeSchema>;

export const ConfigSchema = z.object({
  gh: z.string(),
  scope: z.record(z.string(), z.string()),
  pr: z.record(ChangeTypeSchema, z.string()),
  pkg: z.string(),
  next: z.string(),
  version: z.string(),
  setup: z.string(),
});

export type Config = z.infer<typeof ConfigSchema>;

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
