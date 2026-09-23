/**
 * SCR-001 Home copy and link targets (FR-001), transcribed verbatim from
 * docs/03-design/paper-snapshot/desktop/home.jsx and mobile/home.jsx.
 * Every href resolves through site-routes.ts so unshipped pages stay "#" (FR-012).
 */
import type { GlyphName } from "./feature-glyphs";
import {
  PLACEHOLDER_ROUTES,
  PRODUCT_ROUTES,
  SERVICE_ROUTES,
  SOLUTION_ROUTES,
  INDUSTRY_ROUTES,
  hrefFor,
  type SiteRoute,
} from "./site-routes";

/**
 * Resolves a route id to its href. Throws at build time when the id is unknown,
 * because a silent "#" would hide a broken link (core DNA: fail fast).
 */
export function routeHref(routes: readonly SiteRoute[], id: string): string {
  const route = routes.find((candidate) => candidate.id === id);
  if (route === undefined) {
    throw new Error(`Unknown route id "${id}"`);
  }
  return hrefFor(route);
}

/** In-page anchor for "See what we have built" (ui-specification.md SCR-001 item 2). */
export const PRODUCTS_SECTION_ID = "products-section";
export const PRODUCTS_SECTION_HREF = `#${PRODUCTS_SECTION_ID}`;

export const HOME_HERO = {
  eyebrow: "SAP Gold Partner · Manufacturing only",
  title: "Stop Managing Problems. Start Driving Profits with SAP.",
  intro:
    "TAMS Infotech delivers high-impact SAP ERP solutions that eliminate inefficiencies, automate operations, and unlock real-time business intelligence — so you scale faster and outperform competitors.",
  primaryCta: "Accelerate Your Digital Transformation",
  secondaryCta: "See what we have built",
} as const;

export interface HomeStat {
  readonly value: string;
  readonly label: string;
  /** The last stat renders its value in the accent colour. */
  readonly accent: boolean;
}

export const HOME_STATS: readonly HomeStat[] = [
  { value: "14+", label: "years delivering SAP", accent: false },
  { value: "25", label: "SAP consultants in-house", accent: false },
  { value: "25+", label: "projects delivered", accent: false },
  { value: "5", label: "countries supported", accent: false },
  { value: "7", label: "products we built ourselves", accent: true },
];

export interface Challenge {
  readonly problem: string;
  readonly outcome: string;
}

export const CHALLENGES_SECTION = {
  eyebrow: "The starting point",
  title: "What are you facing?",
  aside: "Five problems we hear in almost every plant, and what SAP actually does about each one.",
  problemColumn: "What are you facing?",
  outcomeColumn: "With SAP, you can…",
} as const;

export const CHALLENGES: readonly Challenge[] = [
  {
    problem: "A lack of agility to adapt",
    outcome: "Quickly deploy new business models, adjust organizations, and expand globally",
  },
  {
    problem: "Inefficient, disconnected processes",
    outcome: "Align and automate business processes based on proven industry best practices",
  },
  {
    problem: "Lack of transparency + automation",
    outcome: "Understand the most critical issues, understand impact, and automate resolution",
  },
  {
    problem: "Concerns with digital security",
    outcome: "Get peace of mind with continuous security and compliance updates",
  },
  {
    problem: "Having outgrown your current systems",
    outcome: "Adopt a ready-to-run ERP that will grow with you",
  },
];

export interface HomeTile {
  readonly title: string;
  readonly body: string;
  readonly href: string;
  readonly glyph?: GlyphName;
}

export const SERVICES_SECTION = {
  eyebrow: "Services",
  title: "Four services, one lifecycle",
  allLabel: "All services",
  /* No /services index exists (FR-006 edge case), so the pill is "#" (FR-012). */
  allHref: hrefFor(PLACEHOLDER_ROUTES.allServices),
} as const;

export const SERVICE_TILES: readonly HomeTile[] = [
  {
    title: "SAP S/4HANA Cloud Implementation — GROW and RISE",
    body: "Blueprint to go-live on Public or Private Edition, with fixed scope and a named delivery team.",
    href: routeHref(SERVICE_ROUTES, "s4hana-cloud-implementation"),
  },
  {
    title: "SAP S/4HANA Managed Services (AMS)",
    body: "Full landscape support, skill-specific cover, or spot assignments. Defined SLAs, named team.",
    href: routeHref(SERVICE_ROUTES, "s4hana-managed-services"),
  },
  {
    title: "Custom Application Build",
    body: "Extensions and applications that do what standard SAP will not, built to survive the next upgrade.",
    href: routeHref(SERVICE_ROUTES, "custom-application-build"),
  },
  {
    title: "License Procurement",
    body: "The right modules and subscription plan, sized before you sign rather than discovered afterwards.",
    href: routeHref(SERVICE_ROUTES, "license-procurement"),
  },
];

export const PRODUCTS_SECTION = {
  eyebrow: "Products",
  title: "Every SAP partner implements. We also build.",
  aside: "Seven SAP-integrated applications for the gaps we kept meeting in Indian manufacturing.",
  ctaEyebrow: "Seven products",
  ctaTitle: "Built by us, integrated into standard SAP.",
  ctaLabel: "See what we have built",
} as const;

export const PRODUCT_TILES: readonly HomeTile[] = [
  {
    title: "Gate Entry Application",
    body: "Security desk to weighbridge to goods receipt, on one QR-tracked document.",
    href: routeHref(PRODUCT_ROUTES, "gate-entry"),
    glyph: "scan-frame",
  },
  {
    title: "EXIM",
    body: "DGFT licences, letters of credit, and a compliance gate that blocks delivery and billing in SAP.",
    href: routeHref(PRODUCT_ROUTES, "exim"),
    glyph: "globe",
  },
  {
    title: "Digital Signature",
    body: "Mass DSC signing without a document ever leaving SAP.",
    href: routeHref(PRODUCT_ROUTES, "digisign"),
    glyph: "document-check",
  },
  {
    title: "Production Process",
    body: "Bloom to bundled pipe, with pipe-level traceability on Public Edition.",
    href: routeHref(PRODUCT_ROUTES, "production-process"),
    glyph: "layers",
  },
  {
    title: "Vendor Portal",
    body: "Suppliers see live SAP data. No copy is stored anywhere.",
    href: routeHref(PRODUCT_ROUTES, "vendor-portal"),
    glyph: "people",
  },
  {
    title: "TAMS Connected Factory",
    body: "Machine data into SAP. OEE, downtime, utilization, energy.",
    href: routeHref(PRODUCT_ROUTES, "connected-factory"),
    glyph: "chip",
  },
  {
    title: "TAMS Digital Manufacturing & AI",
    body: "Six AI packages, each built around one measurable outcome.",
    href: routeHref(PRODUCT_ROUTES, "digital-manufacturing-ai"),
    glyph: "network",
  },
];

export const CONNECTED_SECTION = {
  eyebrow: "Connected manufacturing",
  title: "From ERP to the shop floor",
  aside:
    "Your ERP knows what was planned. Your machines know what happened. Most manufacturers reconcile the two in a spreadsheet.",
  flowLabel: "The Connected Factory data flow",
  flowCaption: "It reads from the machine layer. It never writes to it.",
} as const;

export const CONNECTED_FEATURES = {
  factory: {
    title: "TAMS Connected Factory",
    body: "Machine data into SAP, without a person typing it. OEE, downtime, machine utilization, energy, predictive maintenance and production analytics — measured rather than estimated.",
    statValue: "85%",
    statLabel: "cut in unplanned downtime at one automotive customer",
    linkLabel: "Explore Connected Factory",
    href: routeHref(PRODUCT_ROUTES, "connected-factory"),
  },
  ai: {
    title: "TAMS Digital Manufacturing & AI",
    body: "Connecting SAP, the shop floor and AI to improve manufacturing performance. Six solution packages, each built around one outcome you can measure before and after.",
    statusLabel: "In production",
    statusDetail: "Invoice processing is running today",
    linkLabel: "Explore Digital Manufacturing & AI",
    href: routeHref(PRODUCT_ROUTES, "digital-manufacturing-ai"),
  },
} as const;

export interface FlowNode {
  readonly label: string;
  readonly glyph: GlyphName;
}

/** The four machine-side nodes, then TAMS Industry Intelligence, then SAP. */
export const FLOW_SOURCE_NODES: readonly FlowNode[] = [
  { label: "Machine", glyph: "machine" },
  { label: "Sensors", glyph: "sensor" },
  { label: "IIoT platform", glyph: "cloud" },
  { label: "Machine and process data", glyph: "database" },
];
export const FLOW_TAMS_NODE: FlowNode = { label: "TAMS Industry Intelligence", glyph: "bar-chart" };
export const FLOW_SAP_LABEL = "SAP";

export const SOLUTIONS_SECTION = {
  eyebrow: "Solutions",
  title: "Solutions guiding your SAP journey",
  allLabel: "All solutions",
  /* No /solutions index exists (FR-046 edge case), so the pill is "#" (FR-012). */
  allHref: hrefFor(PLACEHOLDER_ROUTES.allSolutions),
} as const;

export const SOLUTION_TILES: readonly HomeTile[] = [
  {
    title: "Private Edition",
    body: "RISE with SAP — your own tenant, release control, full extensibility.",
    href: routeHref(SOLUTION_ROUTES, "rise-with-sap"),
  },
  {
    title: "Public Edition",
    body: "GROW with SAP — ready to run, quarterly innovation, fast go-live.",
    href: routeHref(SOLUTION_ROUTES, "grow-with-sap"),
  },
  {
    title: "SAP BTP",
    body: "Where extensions live instead of inside your core.",
    href: routeHref(SOLUTION_ROUTES, "sap-btp"),
  },
  {
    title: "SAP Business AI",
    body: "Embedded AI and the Joule copilot, activated rather than promised.",
    href: routeHref(SOLUTION_ROUTES, "sap-business-ai"),
  },
  {
    title: "Industry-specific solutions",
    body: "Pre-configured scope shaped by a sector's problems.",
    href: routeHref(SOLUTION_ROUTES, "industry-specific-sap-solutions"),
  },
  {
    title: "Analytics and reporting",
    body: "Dashboards and planning on live SAP data.",
    href: routeHref(SOLUTION_ROUTES, "sap-analytics-and-reporting"),
  },
  {
    title: "Integration Suite",
    body: "SAP connected to everything else you run.",
    href: routeHref(SOLUTION_ROUTES, "sap-integration-suite"),
  },
  {
    title: "Automation and workflow",
    body: "Approvals, documents and exceptions handled without chasing.",
    href: routeHref(SOLUTION_ROUTES, "sap-automation-and-workflow"),
  },
];

export const INDUSTRIES_SECTION = {
  eyebrow: "Industries",
  title: "We only work with manufacturers",
  aside:
    "Six sectors. The configuration, the vocabulary and the compliance questions are already in the room.",
} as const;

export const INDUSTRY_TILES: readonly HomeTile[] = [
  {
    title: "Automotive and Auto Components",
    body: "Schedule agreements, JIT, traceability for recall.",
    href: routeHref(INDUSTRY_ROUTES, "automotive"),
  },
  {
    title: "Metals and Steel",
    body: "Heat traceability, weighbridge, yield and variable pricing.",
    href: routeHref(INDUSTRY_ROUTES, "metals-and-steel"),
  },
  {
    title: "Mill Products",
    body: "Where SAP's embedded AI is furthest along.",
    href: routeHref(INDUSTRY_ROUTES, "mill-products"),
  },
  {
    title: "Pharmaceuticals",
    body: "Batch genealogy, serialisation, and an honest edition answer.",
    href: routeHref(INDUSTRY_ROUTES, "pharmaceuticals"),
  },
  {
    title: "Engineering and Fabrication",
    body: "Engineer-to-order, project costing, milestone billing.",
    href: routeHref(INDUSTRY_ROUTES, "engineering-and-fabrication"),
  },
  {
    title: "Consumer Durables",
    body: "Distribution, trade schemes and the aftermarket.",
    href: routeHref(INDUSTRY_ROUTES, "consumer-durables"),
  },
];

export const PROCESS_SECTION = {
  eyebrow: "Process",
  title: "How we work",
} as const;
