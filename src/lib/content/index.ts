import type { IconName } from "../icons/solar";
import { industries } from "./industries";
import { products } from "./products";
import { services } from "./services";
import { solutions } from "./solutions";

export { company } from "./company";
export { industries, products, services, solutions };

export type Category = "services" | "solutions" | "products" | "industries";

export type Entry = { slug: string; name: string; tagline: string; icon: IconName; href: string };

export const categories: {
  key: Category;
  label: string;
  /** Link text for the category overview, e.g. "All SAP solutions". */
  all: string;
  href: string;
  blurb: string;
  items: Entry[];
}[] = [
  {
    key: "services",
    label: "Services",
    all: "All services",
    href: "/services",
    blurb: "What we do across the life of an SAP system: implement it, run it, extend it and license it.",
    items: services.map((s) => ({ ...pick(s), href: `/services/${s.slug}` })),
  },
  {
    key: "solutions",
    label: "SAP solutions",
    all: "All SAP solutions",
    href: "/solutions",
    blurb: "The SAP products and platforms we help you adopt, integrate and use.",
    items: solutions.map((s) => ({ ...pick(s), href: `/solutions/${s.slug}` })),
  },
  {
    key: "products",
    label: "TAMS products",
    all: "All TAMS products",
    href: "/products",
    blurb: "Our own applications for the operational steps SAP leaves to paper and spreadsheets.",
    items: products.map((s) => ({ ...pick(s), href: `/products/${s.slug}` })),
  },
  {
    key: "industries",
    label: "Industries",
    all: "All industries",
    href: "/industries",
    blurb: "How these come together for the way specific manufacturing sectors work.",
    items: industries.map((s) => ({ ...pick(s), href: `/industries/${s.slug}` })),
  },
];

function pick(s: { slug: string; name: string; tagline: string; icon: IconName }) {
  return { slug: s.slug, name: s.name, tagline: s.tagline, icon: s.icon };
}

const lookup = new Map<string, Entry & { category: Category }>();
for (const c of categories) for (const item of c.items) lookup.set(`${c.key}/${item.slug}`, { ...item, category: c.key });

export function entry(category: Category, slug: string) {
  const found = lookup.get(`${category}/${slug}`);
  if (!found) throw new Error(`Unknown ${category} entry: ${slug}`);
  return found;
}

export function categoryLabel(category: Category) {
  return categories.find((c) => c.key === category)!.label;
}

/** Storytelling paths between offerings (brief §3.5). These are typical routes, not bundles. */
export const journeys: { title: string; problem: string; chain: [Category, string][] }[] = [
  {
    title: "Moving to cloud ERP",
    problem: "Replacing an ageing ERP or moving from SAP ECC.",
    chain: [
      ["services", "s4hana-cloud-implementation"],
      ["solutions", "rise-with-sap"],
      ["solutions", "grow-with-sap"],
    ],
  },
  {
    title: "Extending the ERP",
    problem: "A workflow SAP doesn't cover, without modifying the core.",
    chain: [
      ["services", "custom-application-build"],
      ["solutions", "sap-btp"],
      ["products", "gate-entry"],
    ],
  },
  {
    title: "Connecting the factory",
    problem: "Machine data that never reaches SAP.",
    chain: [
      ["products", "connected-factory"],
      ["solutions", "integration-suite"],
      ["solutions", "industry-solutions"],
    ],
  },
  {
    title: "Seeing production clearly",
    problem: "Status and exceptions discovered too late.",
    chain: [
      ["products", "digital-manufacturing-ai"],
      ["products", "production-process"],
      ["solutions", "analytics-reporting"],
    ],
  },
  {
    title: "Working with suppliers",
    problem: "Orders, documents and invoices chased by email.",
    chain: [
      ["products", "vendor-portal"],
      ["solutions", "automation-workflow"],
      ["solutions", "integration-suite"],
    ],
  },
  {
    title: "Running after go-live",
    problem: "Keeping a live system stable and current.",
    chain: [
      ["services", "s4hana-managed-services"],
      ["solutions", "analytics-reporting"],
      ["services", "custom-application-build"],
    ],
  },
];
