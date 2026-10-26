import type { IconName } from "../icons/solar";
import type { IllustrationId } from "../illustrations";

/* All site copy lives here. Headlines, labels and one-liners follow the content brief.
   Slide paragraphs (`body`) that expand a one-liner are DRAFT copy written for this build
   and are listed in the README under "Placeholders" for TAMS to confirm. */

export const company = {
  name: "TAMS Infotech",
  legalName: "TAMS Infotech Pvt. Ltd.",
  short: "TAMS",
  description: "SAP Gold Partner serving Indian manufacturers.",
  address: "Bengaluru, Karnataka",
  phone: "+91 80 4130 1039",
  phoneHref: "tel:+918041301039",
  email: "sales@tamsinfotech.com",
  trademark: "SAP, S/4HANA, RISE with SAP and GROW with SAP are trademarks of SAP SE; TAMS is an independent partner.",
  year: 2026,
};

export type Item = {
  slug: string;
  title: string;
  /** one line: mega menu, slide lead */
  short: string;
  /** one paragraph, ≤40 words */
  body: string;
  icon: IconName;
  art: IllustrationId;
  tag?: string;
};

export const services: Item[] = [
  {
    slug: "s4hana-cloud-implementation",
    title: "S/4HANA Cloud Implementation",
    short: "GROW and RISE, blueprint to go-live.",
    body: "GROW and RISE, blueprint to go-live. We map your plant and finance processes to SAP best practice, configure only what you need, and take you live with your team trained.",
    icon: "cloud-upload",
    art: "svc-implementation",
  },
  {
    slug: "s4hana-managed-services",
    title: "S/4HANA Managed Services (AMS)",
    short: "SLAs and a named team.",
    body: "SLAs and a named team. The consultants who know your system handle tickets, changes and upgrades, so support never starts from zero.",
    icon: "headphones-round",
    art: "svc-ams",
  },
  {
    slug: "custom-application-build",
    title: "Custom Application Build",
    short: "Extensions that survive upgrades.",
    body: "Extensions that survive upgrades. We build around a clean SAP core, so the apps your teams rely on keep working when SAP releases change.",
    icon: "code-square",
    art: "svc-build",
  },
  {
    slug: "license-procurement",
    title: "License Procurement",
    short: "Right-sized modules and subscriptions.",
    body: "Right-sized modules and subscriptions. We help you license the SAP your plants actually use, and nothing they will not.",
    icon: "key",
    art: "svc-license",
  },
];

export const products: Item[] = [
  {
    slug: "gate-entry",
    title: "Gate Entry Application",
    short: "Trucks, plates and deliveries checked in at the gate.",
    body: "Every truck checked in at the boom barrier: number plate, purchase order and delivery recorded against SAP before the vehicle reaches the dock.",
    icon: "delivery",
    art: "gate",
  },
  {
    slug: "exim",
    title: "EXIM",
    short: "Export-import compliance, from order to port.",
    body: "Export-import compliance in one place. Shipping documents, licences and port movements tracked against SAP orders, so shipments clear on time.",
    icon: "globus",
    art: "exim",
  },
  {
    slug: "digisign",
    title: "Digital Signature",
    short: "Sign SAP documents with a verifiable seal.",
    body: "Invoices, purchase orders and certificates signed inside the SAP workflow, with a verifiable seal, instead of printed, signed and scanned.",
    icon: "pen-2",
    art: "signature",
  },
  {
    slug: "production-process",
    title: "Production Process",
    short: "Work orders tracked stage by stage.",
    body: "Each stage of the line confirmed where the work happens, with status flowing straight back to SAP production orders.",
    icon: "widget-5",
    art: "production",
  },
  {
    slug: "vendor-portal",
    title: "Vendor Portal",
    short: "One place for suppliers to see orders and invoices.",
    body: "Suppliers confirm orders, schedule deliveries and submit invoices through one portal connected to SAP procurement.",
    icon: "users-group-two-rounded",
    art: "vendor",
  },
  {
    slug: "connected-factory",
    title: "TAMS Connected Factory",
    short: "Machine and sensor data, linked to SAP.",
    body: "Machines report their state as it happens, so planners see the shop floor as it is, not as it was at the last shift report.",
    icon: "plug-circle",
    art: "factory",
  },
  {
    slug: "digital-manufacturing-ai",
    title: "TAMS Digital Manufacturing & AI",
    short: "Production analytics with anomaly detection.",
    body: "Trend and anomaly views on production data that flag drift early, before it turns into downtime.",
    icon: "diagram-up",
    art: "ai",
    tag: "In production",
  },
];

export const solutions: Item[] = [
  { slug: "rise-with-sap", title: "RISE with SAP", short: "S/4HANA Cloud as one managed subscription.", body: "Move to S/4HANA Cloud as a single subscription that bundles software, infrastructure and SAP-run operations.", icon: "cloud-check", art: "sol-rise" },
  { slug: "grow-with-sap", title: "GROW with SAP", short: "Public cloud S/4HANA with best-practice processes.", body: "Start on public-cloud S/4HANA with ready best-practice processes, built for fast, standard rollouts.", icon: "graph-up", art: "sol-grow" },
  { slug: "sap-btp", title: "SAP BTP", short: "Extend and integrate without touching the core.", body: "The SAP Business Technology Platform lets you extend and integrate SAP while the core stays clean.", icon: "layers-minimalistic", art: "sol-btp" },
  { slug: "sap-business-ai", title: "SAP Business AI", short: "AI inside the processes you already run.", body: "Put AI to work inside the processes you already run: forecasting, matching and assistance in context.", icon: "cpu-bolt", art: "sol-ai" },
  { slug: "industry-specific-sap-solutions", title: "Industry-specific solutions", short: "Processes shaped for manufacturing.", body: "SAP processes shaped for discrete and process manufacturing, from variant configuration to batch management.", icon: "settings-minimalistic", art: "sol-industry" },
  { slug: "sap-analytics-and-reporting", title: "Analytics and reporting", short: "Numbers you can act on today.", body: "Plant, sales and finance numbers on one screen, current enough to act on the same day.", icon: "chart-2", art: "sol-analytics" },
  { slug: "sap-integration-suite", title: "Integration Suite", short: "Connect SAP to portals, partners and plants.", body: "Connect SAP to portals, partners and plant systems through managed, monitored integrations.", icon: "transfer-horizontal", art: "sol-integration" },
  { slug: "sap-automation-and-workflow", title: "Automation and workflow", short: "Approvals that move without chasing.", body: "Approvals and hand-offs that move on their own, with every step visible and nothing lost in email.", icon: "routing", art: "sol-automation" },
];

export const industries: Item[] = [
  { slug: "automotive", title: "Automotive and auto components", short: "Schedules, quality and supplier flow for tiered production.", body: "Schedules, quality and supplier flow for tiered production.", icon: "wheel", art: "ind-automotive" },
  { slug: "metals-and-steel", title: "Metals and steel", short: "Heat, grade and batch traceability from melt to dispatch.", body: "Heat, grade and batch traceability from melt to dispatch.", icon: "fire", art: "ind-metals" },
  { slug: "mill-products", title: "Mill products", short: "Variant-heavy orders, rolls and lots handled cleanly.", body: "Variant-heavy orders, rolls and lots handled cleanly.", icon: "layers", art: "ind-mill" },
  { slug: "pharmaceuticals", title: "Pharmaceuticals", short: "Batch records and quality release built for compliance.", body: "Batch records and quality release built for compliance.", icon: "test-tube", art: "ind-pharma" },
  { slug: "engineering-and-fabrication", title: "Engineering and fabrication", short: "Project manufacturing with costed bills of material.", body: "Project-based manufacturing with costed bills of material.", icon: "sledgehammer", art: "ind-fabrication" },
  { slug: "consumer-durables", title: "Consumer durables", short: "Demand, distribution and service in one system.", body: "Demand, distribution and service in one system.", icon: "fridge", art: "ind-durables" },
];

export const figures = [
  { value: 14, suffix: "+", label: "years delivering SAP" },
  { value: 25, suffix: "", label: "in-house SAP consultants" },
  { value: 25, suffix: "+", label: "projects delivered" },
  { value: 5, suffix: "", label: "countries supported" },
  { value: 7, suffix: "", label: "products we built ourselves" },
];

export const problems: { title: string; body: string; art: IllustrationId }[] = [
  { title: "Lack of agility", body: "What SAP addresses: configurable processes and regular cloud releases, so you change how you work without re-platforming.", art: "prb-agility" },
  { title: "Disconnected processes", body: "What SAP addresses: one data model linking sales, production, procurement and finance, end to end.", art: "prb-disconnected" },
  { title: "Poor transparency and automation", body: "What SAP addresses: live dashboards and workflow automation in place of spreadsheets and manual hand-offs.", art: "prb-transparency" },
  { title: "Security concerns", body: "What SAP addresses: role-based access, audit trails and SAP-run cloud security around plant and finance data.", art: "prb-security" },
  { title: "Outgrowing your current systems", body: "What SAP addresses: a system that scales across plants, entities and countries as the business grows.", art: "prb-outgrow" },
];

export const processSteps: { title: string; text: string }[] = [
  { title: "Discovery", text: "We walk the plant and the processes before we open a slide." },
  { title: "Strategic planning", text: "Scope, phasing and budget agreed against business outcomes." },
  { title: "Tailored solution design", text: "Fit-to-standard first; custom only where it pays back." },
  { title: "Agile execution", text: "Short sprints with your key users in every review." },
  { title: "Quality assurance", text: "Scripted, integrated and user-acceptance testing on real data." },
  { title: "Deployment", text: "Cut-over planned to the hour, with hypercare on site." },
  { title: "Continuous support", text: "A named team that already knows your system." },
];

export const diagramSteps = [
  { id: "sensors", title: "Machine sensors", text: "PLCs, meters and sensors report cycle counts, states and alarms." },
  { id: "iiot", title: "IIoT platform", text: "Collects and normalises machine signals at the edge." },
  { id: "intel", title: "TAMS Industry Intelligence", text: "Turns signals into availability, downtime reasons and anomaly flags." },
  { id: "sap", title: "SAP", text: "Production, maintenance and quality act on what the floor is doing." },
] as const;
export type DiagramStepId = (typeof diagramSteps)[number]["id"];

export type NavGroup = {
  label: string;
  to: string;
  items?: { label: string; to: string; desc: string; icon: IconName }[];
};

const group = (label: string, to: string, list: Item[]): NavGroup => ({
  label,
  to,
  items: list.map((s) => ({ label: s.title, to: `${to}/${s.slug}`, desc: s.short, icon: s.icon })),
});

export const nav: NavGroup[] = [
  { label: "Home", to: "/" },
  group("Services", "/services", services),
  group("Solutions", "/solutions", solutions),
  group("Products", "/products", products),
  group("Industries", "/industries", industries),
  { label: "About Us", to: "/about" },
  { label: "Careers", to: "/careers" },
  { label: "Contact Us", to: "/contact" },
];
