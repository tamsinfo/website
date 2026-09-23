/**
 * SCR-002 About copy (FR-002), transcribed verbatim from
 * docs/03-design/paper-snapshot/desktop/about.jsx and mobile/about.jsx.
 */
import type { GlyphName } from "./feature-glyphs";

export const ABOUT_HERO = {
  eyebrow: "About",
  title: "About TAMS Infotech",
  intro: "An SAP Gold Partner in Bengaluru, working only with Indian manufacturers.",
} as const;

export const WHO_WE_ARE = {
  eyebrow: "The firm",
  title: "Who we are",
  body: "TAMS Infotech is an SAP Gold Partner based in Bengaluru. We implement, convert and run SAP S/4HANA Cloud for Indian manufacturers, and we build our own SAP-integrated applications for the gate, the shop floor, the export desk and the supplier network.",
  highlight:
    "Twenty-five SAP consultants, fourteen years, more than twenty-five project deliveries, and support across five countries.",
} as const;

export const WHY_MANUFACTURING = {
  eyebrow: "Focus",
  title: "Why manufacturing only",
  body: "Not a vertical among twelve. It is the whole business, and it is why we know what breaks in month four. Every product we have built came out of a problem we met on a manufacturing project and could not solve with standard SAP.",
} as const;

export interface Differentiator {
  readonly title: string;
  readonly body: string;
  readonly glyph: GlyphName;
}

export const DIFFERENTIATORS_SECTION = {
  eyebrow: "Differentiators",
  title: "What makes us different",
} as const;

export const DIFFERENTIATORS: readonly Differentiator[] = [
  {
    title: "SAP Gold Partner",
    body: "Accredited, audited by SAP, with direct access to SAP partner tooling and escalation.",
    glyph: "shield-check",
  },
  {
    title: "Seven products of our own",
    body: "Almost no partner of our size has a product line. It exists because we kept meeting the same gaps.",
    glyph: "layers",
  },
  {
    title: "Senior consultants",
    body: "The person who scoped your project is still on the call in month nine.",
    glyph: "people",
  },
  {
    title: "Manufacturing focus",
    body: "Automotive, metals and steel, mill products, pharmaceuticals, engineering, consumer durables.",
    glyph: "factory",
  },
  {
    title: "Fixed scope",
    body: "Deliverables named in the contract, not discovered during delivery.",
    glyph: "document-check",
  },
  {
    title: "Honest scoping",
    body: "We will tell you what an edition cannot do before you buy it, not after.",
    glyph: "scale",
  },
];

export const ABOUT_PROCESS_SECTION = {
  eyebrow: "Process",
  title: "Our process",
} as const;
