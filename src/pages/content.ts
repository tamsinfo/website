import { industries, products, services, solutions, type Item } from "../data/site";
import type { IllustrationId } from "../illustrations";

export type Kind = "services" | "solutions" | "products" | "industries";

export const KINDS: Record<Kind, { label: string; singular: string; items: Item[]; hubTitle: string; hubLede: string; station: string; hubK: number; cta: string }> = {
  services: { label: "Services", singular: "Service", items: services, hubTitle: "Four services, one lifecycle", hubLede: "From the first blueprint to the hundredth support ticket, one team carries your SAP landscape.", station: "services", hubK: 0, cta: "Explore" },
  solutions: { label: "Solutions", singular: "Solution", items: solutions, hubTitle: "Solutions guiding your SAP journey", hubLede: "The SAP offerings we implement and extend for manufacturers, and where each one fits.", station: "solutions", hubK: -1, cta: "Read about" },
  products: { label: "Products", singular: "Product", items: products, hubTitle: "Every SAP partner implements. We also build.", hubLede: "Seven SAP-integrated applications built by TAMS for the work around the production line.", station: "products", hubK: -1, cta: "View" },
  industries: { label: "Industries", singular: "Industry", items: industries, hubTitle: "We only work with manufacturers", hubLede: "Six manufacturing segments, one focus. We do not take projects outside manufacturing.", station: "industries", hubK: -1, cta: "Explore" },
};

/* Detail-page story. Every block is PLACEHOLDER copy and renders a visible flag. */
export function story(kind: Kind, title: string): { key: string; title: string; body: string; art: IllustrationId }[] {
  const subject = kind === "industries" ? `manufacturers in ${title.toLowerCase()}` : title;
  return [
    { key: "problem", title: "The problem", body: `Replace with the one problem ${subject} solves or faces: where time, money or visibility is lost today.`, art: "story-problem" },
    { key: "how", title: "How it works", body: `Replace with how ${title} works with SAP: what it reads, what it records, and who uses it.`, art: "story-how" },
    { key: "outcomes", title: "Outcomes", body: "Replace with outcomes TAMS can stand behind. Use only figures the customer has approved for publication.", art: "story-outcome" },
  ];
}
