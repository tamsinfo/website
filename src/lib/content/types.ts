import type { IconName } from "../icons/solar";

export type Pair = { title: string; body: string };
export type Step = { title: string; body: string };

export type Related = {
  services?: string[];
  solutions?: string[];
  products?: string[];
  industries?: string[];
};

export interface Service {
  slug: string;
  name: string;
  tagline: string;
  icon: IconName;
  summary: string;
  lede: string;
  problem: Pair;
  covers: Pair[];
  process: { title: string; caption: string; steps: Step[] };
  /** A comparison specific to the service, e.g. deployment models. */
  matrix?: {
    title: string;
    intro: string;
    columns: string[];
    rows: { label: string; cells: string[] }[];
  };
  role: Pair[];
  note?: string;
  related: Related;
}

export interface Solution {
  slug: string;
  name: string;
  tagline: string;
  icon: IconName;
  summary: string;
  lede: string;
  fromSap: string[];
  fromTams: string[];
  covers: Pair[];
  fit?: { suits: string[]; consider: string[] };
  diagram: DiagramKey;
  caveat: string;
  related: Related;
}

export interface Product {
  slug: string;
  name: string;
  tagline: string;
  icon: IconName;
  summary: string;
  lede: string;
  /** documented: capabilities come from product documentation the team supplied.
      brief: capabilities describe the intended scope and are confirmed in a walkthrough. */
  evidence: "documented" | "brief";
  problem: string;
  users: Pair[];
  environment: string;
  workflow: { caption: string; steps: Step[] };
  capabilities: Pair[];
  integrations: Pair[];
  deployment: Pair[];
  related: Related;
}

export interface Industry {
  slug: string;
  name: string;
  short: string;
  tagline: string;
  icon: IconName;
  headline: string;
  context: string;
  challenges: Pair[];
  flow: { caption: string; steps: Step[] };
  standard: string[];
  extended: string[];
  apps: { slug: string; why: string }[];
  tech: { slug: string; why: string }[];
  cta: string;
  related: Related;
}

export type DiagramKey =
  | "rise"
  | "grow"
  | "btp"
  | "ai"
  | "industry"
  | "analytics"
  | "integration"
  | "workflow";
