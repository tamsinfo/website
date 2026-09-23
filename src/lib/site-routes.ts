/**
 * C-22 Site routes (TASK-003). Every route in the architecture route inventory
 * (system-architecture.md section 2.3), its label, and whether it ships.
 *
 * FR-012: a link whose destination does not exist in the build MUST be "#".
 * Every component resolves hrefs through `hrefFor`, never from `path` directly.
 * TASK-007 alone MAY flip the `ships` flags of the Solutions and Industries routes.
 */

export interface SiteRoute {
  /** Stable identifier used by components and tests. */
  readonly id: string;
  /** Link text: the destination screen's captured H1 (ui-specification.md section 1). */
  readonly label: string;
  /** Footer link text where the frozen footer capture differs from the H1. */
  readonly footerLabel?: string;
  /** Route path, or null for destinations with no page in V1 (Blog, Terms, and so on). */
  readonly path: string | null;
  /** True when the page exists in this build. */
  readonly ships: boolean;
}

export type NavKey =
  | "home"
  | "services"
  | "solutions"
  | "products"
  | "industries"
  | "about"
  | "careers"
  | "contact";

export const PLACEHOLDER_HREF = "#";

/** FR-016: every "Book a discovery call" control links here. */
export const DISCOVERY_CALL_HREF = "/contact#contact-form";

export const PAGE_ROUTES = {
  home: { id: "home", label: "Home", path: "/", ships: true },
  about: { id: "about", label: "About Us", path: "/about", ships: true },
  careers: { id: "careers", label: "Careers", path: "/careers", ships: true },
  contact: { id: "contact", label: "Contact Us", path: "/contact", ships: true },
  privacy: { id: "privacy", label: "Privacy", path: "/privacy", ships: true },
} as const satisfies Record<string, SiteRoute>;

/** FR-012 placeholders: no page exists in V1. */
export const PLACEHOLDER_ROUTES = {
  blog: { id: "blog", label: "Blog", path: null, ships: false },
  caseStudies: { id: "case-studies", label: "Case Studies", path: null, ships: false },
  terms: { id: "terms", label: "Terms", path: null, ships: false },
  cookies: { id: "cookies", label: "Cookies", path: null, ships: false },
  sitemap: { id: "sitemap", label: "Sitemap", path: null, ships: false },
  /* Family index pages do not exist: "/services", "/products", "/solutions", and
     "/industries" are 404 (FR-006, FR-007, FR-046, FR-047 edge cases). Used by the
     Home "All services" / "All solutions" pills and the 404 wayfinding cards. */
  allServices: { id: "all-services", label: "All services", path: null, ships: false },
  allSolutions: { id: "all-solutions", label: "All solutions", path: null, ships: false },
  allProducts: { id: "all-products", label: "All products", path: null, ships: false },
  allIndustries: { id: "all-industries", label: "All industries", path: null, ships: false },
} as const satisfies Record<string, SiteRoute>;

/** FR-006, SCR-007 to SCR-010. Footer labels are the frozen footer capture's copy. */
export const SERVICE_ROUTES: readonly SiteRoute[] = [
  {
    id: "s4hana-cloud-implementation",
    label: "SAP S/4HANA Cloud Implementation",
    footerLabel: "SAP S/4HANA Cloud Implementation — GROW and RISE",
    path: "/services/s4hana-cloud-implementation",
    ships: true,
  },
  {
    id: "s4hana-managed-services",
    label: "SAP S/4HANA Managed Services",
    footerLabel: "SAP S/4HANA Managed Services (AMS)",
    path: "/services/s4hana-managed-services",
    ships: true,
  },
  {
    id: "custom-application-build",
    label: "Custom Application Build",
    path: "/services/custom-application-build",
    ships: true,
  },
  {
    id: "license-procurement",
    label: "License Procurement",
    path: "/services/license-procurement",
    ships: true,
  },
];

/** FR-007, SCR-011 to SCR-017. */
export const PRODUCT_ROUTES: readonly SiteRoute[] = [
  { id: "gate-entry", label: "Gate Entry Application", path: "/products/gate-entry", ships: true },
  {
    id: "exim",
    label: "Export and Import Management",
    footerLabel: "EXIM",
    path: "/products/exim",
    ships: true,
  },
  {
    id: "digisign",
    label: "TAMS DigiSign",
    footerLabel: "Digital Signature",
    path: "/products/digisign",
    ships: true,
  },
  {
    id: "production-process",
    label: "TAMS Production Process",
    footerLabel: "Production Process",
    path: "/products/production-process",
    ships: true,
  },
  {
    id: "vendor-portal",
    label: "TAMS Vendor Portal",
    footerLabel: "Vendor Portal",
    path: "/products/vendor-portal",
    ships: true,
  },
  {
    id: "connected-factory",
    label: "TAMS Connected Factory",
    path: "/products/connected-factory",
    ships: true,
  },
  {
    id: "digital-manufacturing-ai",
    label: "TAMS Digital Manufacturing & AI",
    path: "/products/digital-manufacturing-ai",
    ships: true,
  },
];

/** FR-046 (should), SCR-018 to SCR-025. Shipped by TASK-007. */
export const SOLUTION_ROUTES: readonly SiteRoute[] = [
  { id: "rise-with-sap", label: "RISE with SAP", path: "/solutions/rise-with-sap", ships: true },
  { id: "grow-with-sap", label: "GROW with SAP", path: "/solutions/grow-with-sap", ships: true },
  { id: "sap-btp", label: "SAP BTP", path: "/solutions/sap-btp", ships: true },
  {
    id: "sap-business-ai",
    label: "SAP Business AI",
    path: "/solutions/sap-business-ai",
    ships: true,
  },
  {
    id: "industry-specific-sap-solutions",
    label: "Industry-specific SAP solutions",
    path: "/solutions/industry-specific-sap-solutions",
    ships: true,
  },
  {
    id: "sap-analytics-and-reporting",
    label: "SAP Analytics and Reporting",
    path: "/solutions/sap-analytics-and-reporting",
    ships: true,
  },
  {
    id: "sap-integration-suite",
    label: "SAP Integration Suite",
    path: "/solutions/sap-integration-suite",
    ships: true,
  },
  {
    id: "sap-automation-and-workflow",
    label: "SAP Automation and Workflow",
    path: "/solutions/sap-automation-and-workflow",
    ships: true,
  },
];

/** FR-047 (should), SCR-026 to SCR-031. Shipped by TASK-007. */
export const INDUSTRY_ROUTES: readonly SiteRoute[] = [
  {
    id: "automotive",
    label: "SAP for automotive and auto components",
    path: "/industries/automotive",
    ships: true,
  },
  {
    id: "metals-and-steel",
    label: "SAP for metals and steel",
    path: "/industries/metals-and-steel",
    ships: true,
  },
  {
    id: "mill-products",
    label: "SAP for mill products",
    path: "/industries/mill-products",
    ships: true,
  },
  {
    id: "pharmaceuticals",
    label: "SAP for pharmaceuticals",
    path: "/industries/pharmaceuticals",
    ships: true,
  },
  {
    id: "engineering-and-fabrication",
    label: "SAP for engineering and fabrication",
    path: "/industries/engineering-and-fabrication",
    ships: true,
  },
  {
    id: "consumer-durables",
    label: "SAP for consumer durables",
    path: "/industries/consumer-durables",
    ships: true,
  },
];

/** FR-012: the real route when the destination ships, otherwise "#". */
export function hrefFor(route: SiteRoute): string {
  return route.ships && route.path !== null ? route.path : PLACEHOLDER_HREF;
}

/** Every declared route, for tests and inventories. */
export function allRoutes(): readonly SiteRoute[] {
  return [
    ...Object.values(PAGE_ROUTES),
    ...Object.values(PLACEHOLDER_ROUTES),
    ...SERVICE_ROUTES,
    ...PRODUCT_ROUTES,
    ...SOLUTION_ROUTES,
    ...INDUSTRY_ROUTES,
  ];
}

export interface NavLink {
  readonly key: NavKey;
  readonly label: string;
  readonly href: string;
}

export interface NavMenu {
  readonly key: NavKey;
  readonly label: string;
  /** id of the dropdown panel, used by aria-controls. */
  readonly menuId: string;
  readonly links: readonly { readonly label: string; readonly href: string }[];
}

export type NavItem = ({ readonly kind: "link" } & NavLink) | ({ readonly kind: "menu" } & NavMenu);

function menu(key: NavKey, label: string, routes: readonly SiteRoute[]): NavItem {
  return {
    kind: "menu",
    key,
    label,
    menuId: `menu-${key}`,
    links: routes.map((route) => ({ label: route.label, href: hrefFor(route) })),
  };
}

function link(key: NavKey, route: SiteRoute): NavItem {
  return { kind: "link", key, label: route.label, href: hrefFor(route) };
}

/** Header navigation, in the captured order (ui-specification.md section 1). */
export const PRIMARY_NAV: readonly NavItem[] = [
  link("home", PAGE_ROUTES.home),
  menu("services", "Services", SERVICE_ROUTES),
  menu("solutions", "Solutions", SOLUTION_ROUTES),
  menu("products", "Products", PRODUCT_ROUTES),
  menu("industries", "Industries", INDUSTRY_ROUTES),
  link("about", PAGE_ROUTES.about),
  link("careers", PAGE_ROUTES.careers),
  link("contact", PAGE_ROUTES.contact),
];

export interface FooterColumn {
  readonly id: string;
  readonly heading: string;
  readonly links: readonly { readonly label: string; readonly href: string }[];
}

function footerLinks(routes: readonly SiteRoute[]): FooterColumn["links"] {
  return routes.map((route) => ({
    label: route.footerLabel ?? route.label,
    href: hrefFor(route),
  }));
}

/** Footer link columns, in the captured order (design-system.md section 7.15). */
export const FOOTER_COLUMNS: readonly FooterColumn[] = [
  { id: "footer-services", heading: "Services", links: footerLinks(SERVICE_ROUTES) },
  { id: "footer-products", heading: "Products", links: footerLinks(PRODUCT_ROUTES) },
  {
    id: "footer-company",
    heading: "Company",
    links: footerLinks([PAGE_ROUTES.about, PAGE_ROUTES.careers, PAGE_ROUTES.contact]),
  },
];

/** Footer legal row: Privacy ships; Terms, Cookies, and Sitemap are "#". */
export const FOOTER_LEGAL_LINKS: readonly { readonly label: string; readonly href: string }[] = [
  PAGE_ROUTES.privacy,
  PLACEHOLDER_ROUTES.terms,
  PLACEHOLDER_ROUTES.cookies,
  PLACEHOLDER_ROUTES.sitemap,
].map((route) => ({ label: route.label, href: hrefFor(route) }));

const FAMILY_PREFIXES: readonly (readonly [string, NavKey])[] = [
  ["/services/", "services"],
  ["/solutions/", "solutions"],
  ["/products/", "products"],
  ["/industries/", "industries"],
];

/**
 * The header item to highlight for a path: the page's own item, or the family
 * dropdown for a detail page. Undefined when no item matches (404, Privacy).
 */
export function currentNavKey(pathname: string): NavKey | undefined {
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  if (path === "/") return "home";
  if (path === "/about") return "about";
  if (path === "/careers") return "careers";
  if (path === "/contact") return "contact";
  const family = FAMILY_PREFIXES.find(([prefix]) => path.startsWith(prefix));
  return family?.[1];
}

/** The mobile header's current-page badge text (ui-specification.md section 1). */
export function currentNavLabel(key: NavKey | undefined): string | undefined {
  if (key === undefined) return undefined;
  return PRIMARY_NAV.find((item) => item.key === key)?.label;
}

/** True when an href points at the page being rendered, for aria-current. */
export function isCurrentHref(href: string, pathname: string): boolean {
  if (href === PLACEHOLDER_HREF) return false;
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  return href === path;
}
