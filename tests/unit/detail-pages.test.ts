import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { INDUSTRIES_FAMILY } from "../../src/lib/detail-content/industries";
import { PRODUCTS_FAMILY } from "../../src/lib/detail-content/products";
import { SERVICES_FAMILY } from "../../src/lib/detail-content/services";
import { SOLUTIONS_FAMILY } from "../../src/lib/detail-content/solutions";
import {
  type DetailFamily,
  type DetailPageContent,
  DetailContentError,
  detailBreadcrumb,
  detailRoutes,
  faqIndex,
  faqSection,
  hrefForRouteId,
} from "../../src/lib/detail-page";
import { buildPageMeta } from "../../src/lib/page-meta";
import { INDUSTRY_ROUTES, SOLUTION_ROUTES } from "../../src/lib/site-routes";

const SNAPSHOT_DIR = fileURLToPath(
  new URL("../../docs/03-design/paper-snapshot/", import.meta.url),
);

/** FR-006, FR-007, FR-046, and FR-047 route tables, verbatim. */
const FR_006_ROUTES = [
  "/services/s4hana-cloud-implementation",
  "/services/s4hana-managed-services",
  "/services/custom-application-build",
  "/services/license-procurement",
];
const FR_007_ROUTES = [
  "/products/gate-entry",
  "/products/exim",
  "/products/digisign",
  "/products/production-process",
  "/products/vendor-portal",
  "/products/connected-factory",
  "/products/digital-manufacturing-ai",
];
const FR_046_ROUTES = [
  "/solutions/rise-with-sap",
  "/solutions/grow-with-sap",
  "/solutions/sap-btp",
  "/solutions/sap-business-ai",
  "/solutions/industry-specific-sap-solutions",
  "/solutions/sap-analytics-and-reporting",
  "/solutions/sap-integration-suite",
  "/solutions/sap-automation-and-workflow",
];
const FR_047_ROUTES = [
  "/industries/automotive",
  "/industries/metals-and-steel",
  "/industries/mill-products",
  "/industries/pharmaceuticals",
  "/industries/engineering-and-fabrication",
  "/industries/consumer-durables",
];

/** Keys whose values are presentation settings or accessible names, not captured copy. */
const NON_COPY_KEYS = new Set([
  "kind",
  "size",
  "measure",
  "tone",
  "id",
  "labelWidth",
  "titleSize",
  "href",
  "connectors",
  "caption",
]);

function collectCopy(value: unknown, key = ""): string[] {
  if (typeof value === "string") return NON_COPY_KEYS.has(key) ? [] : [value];
  if (Array.isArray(value)) return value.flatMap((item) => collectCopy(item, key));
  if (value !== null && typeof value === "object") {
    return Object.entries(value).flatMap(([childKey, child]) => collectCopy(child, childKey));
  }
  return [];
}

/** Visible text of a Paper JSX capture: every line that is not markup, joined. */
function snapshotText(file: string): string {
  return readFileSync(`${SNAPSHOT_DIR}${file}`, "utf8")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line !== "" && !line.startsWith("<") && !line.startsWith("}"))
    .join(" ")
    .replace(/\s+/g, " ");
}

/**
 * Captured text intentionally not built:
 * - KD-005: the Mobile-only Vendor Portal "In build" banner, omitted on both layouts.
 * - KD-007: four design-note captions removed at the user's decision.
 * - KD-010: four more design-note captions removed (Business AI, Integration, Automation).
 */
const INTENTIONAL_EXCLUSIONS = new Set([
  "In build",
  "The portal is in development against SAP fixture data and is not yet generally available. Early-access conversations are open now.",
  "Outbound cycle, drawn to mirror the inbound flow so the pair reads as one family. Both diagrams share the same component.",
  "Six packages, each tied to one measurable outcome. Only the first is running in production today, and the page says so.",
  "Six stages from the machine to the ERP. The IIoT platform is selected to fit the equipment and environment — TAMS is not tied to a single vendor, and no vendor is named on the site.",
  "Two audiences, one diagram. The left column is the purchasing conversation; the right column is the IT conversation. They are usually different meetings.",
  "SAP Business AI across the value chain. Almost all of this is available today — the constraint is entitlement, release level and activation, not availability.",
  "Four steps, in this order. The entitlement check comes before the demo, because a demo of something you are not licensed for wastes everybody's time.",
  "An integration without an error path is not finished. Silent integration failures are the expensive kind.",
  "Four tests before building. A process that runs eleven times a year rarely justifies the build and the maintenance.",
]);

/** KD-010 captions: the Solutions page each was captured on, and its opening words. */
const KD_010_CAPTIONS = [
  ["sap-business-ai", "SAP Business AI across the value chain."],
  ["sap-business-ai", "Four steps, in this order."],
  ["sap-integration-suite", "An integration without an error path is not finished."],
  ["sap-automation-and-workflow", "Four tests before building."],
] as const;

/**
 * Captured body lines of a snapshot: every text line after the hero paragraph and
 * before the closing CTA heading, less the hero CTA label and generated numbering.
 */
function snapshotBodyLines(file: string, intro: string): string[] {
  const lines = readFileSync(`${SNAPSHOT_DIR}${file}`, "utf8")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line !== "" && !line.startsWith("<") && !line.startsWith("}"));
  const start = lines.indexOf(intro);
  /* The closing CTA's own eyebrow ("Contact") precedes its heading. */
  const end = lines.indexOf("Tell us what is breaking") - 1;
  return lines
    .slice(start + 1, end)
    .filter(
      (line) =>
        line !== "Book a discovery call" &&
        !/^\d+$/.test(line) &&
        !INTENTIONAL_EXCLUSIONS.has(line),
    );
}

function pageCopy(page: DetailPageContent): string[] {
  const copy = collectCopy(page);
  const intros = page.sections.flatMap((section) =>
    section.blocks.flatMap((block) =>
      block.kind === "stepGrid" && block.intro !== undefined
        ? [`${block.intro.before}${block.intro.emphasis}${block.intro.after}`.replace(/\s+/g, " ")]
        : [],
    ),
  );
  return [...copy.map((text) => text.trim()).filter((text) => text !== ""), ...intros];
}

const FAMILIES: readonly [DetailFamily, string, readonly string[]][] = [
  [SERVICES_FAMILY, "services", FR_006_ROUTES],
  [PRODUCTS_FAMILY, "products", FR_007_ROUTES],
  [SOLUTIONS_FAMILY, "solutions", FR_046_ROUTES],
  [INDUSTRIES_FAMILY, "industries", FR_047_ROUTES],
];

describe.each(FAMILIES)("%s family", (family, prefix, expectedRoutes) => {
  const entries = detailRoutes(family);

  it("builds exactly the routes the FR table lists, in order", () => {
    expect(entries.map((entry) => entry.route)).toEqual(expectedRoutes);
  });

  it("builds no family index page (FR-006, FR-007, FR-046, FR-047 edge cases)", () => {
    expect(entries.some((entry) => entry.slug === "" || entry.route === `/${prefix}`)).toBe(false);
  });

  describe.each(entries.map((entry) => [entry.route, entry] as const))("%s", (_route, entry) => {
    const desktop = snapshotText(`desktop/${prefix}-${entry.slug}.jsx`);
    const mobile = snapshotText(`mobile/${prefix}-${entry.slug}.jsx`);

    it("transcribes every string verbatim from its own Desktop snapshot", () => {
      const missing = pageCopy(entry.page).filter((text) => !desktop.includes(text));
      expect(missing).toEqual([]);
    });

    it("transcribes every string verbatim from its own Mobile snapshot", () => {
      const missing = pageCopy(entry.page).filter((text) => !mobile.includes(text));
      expect(missing).toEqual([]);
    });

    it.each(["desktop", "mobile"])("omits no captured body text from the %s snapshot", (width) => {
      const copy = pageCopy(entry.page).join(" ");
      const lines = snapshotBodyLines(`${width}/${prefix}-${entry.slug}.jsx`, entry.page.intro);
      expect(lines.length).toBeGreaterThan(0);
      expect(lines.filter((line) => !copy.includes(line))).toEqual([]);
    });

    it("builds none of the KD-005, KD-007, and KD-010 exclusions", () => {
      const copy = pageCopy(entry.page);
      expect(copy.filter((text) => INTENTIONAL_EXCLUSIONS.has(text))).toEqual([]);
    });

    it("ends the body with the FAQ section, before the closing CTA", () => {
      expect(entry.page.sections.at(-1)?.id).toBe("faq");
    });

    it("carries FR-043 to FR-045 metadata from its H1 and hero paragraph", () => {
      const meta = buildPageMeta({
        heading: entry.page.title,
        description: entry.page.intro,
        route: entry.route,
      });
      expect(meta.title).toBe(`${entry.page.title} | TAMS Infotech`);
      expect(meta.description.length).toBeLessThanOrEqual(160);
      expect(meta.ogUrl).toBe(`https://tamsinfotech.com${entry.route}`);
    });

    it("links Home in the breadcrumb and leaves the family crumb unlinked", () => {
      const crumbs = detailBreadcrumb(entry.family, entry.page);
      expect(crumbs).toEqual([
        { label: "Home", href: "/" },
        { label: family.label },
        { label: entry.page.breadcrumbLabel },
      ]);
    });
  });
});

const TASK_007_ENTRIES = [SOLUTIONS_FAMILY, INDUSTRIES_FAMILY].flatMap((family) =>
  detailRoutes(family).map((entry) => [entry.route, entry, family] as const),
);

describe.each(TASK_007_ENTRIES)("%s (TASK-007)", (_route, entry, family) => {
  it("uses the ui-specification H1, which is also its menu label and last crumb", () => {
    const route = family.routes.find((candidate) => candidate.path === entry.route);
    expect(entry.page.title).toBe(route?.label);
    expect(entry.page.breadcrumbLabel).toBe(entry.page.title);
  });

  it("uses the family eyebrow and the captured 'Questions' FAQ eyebrow", () => {
    expect(entry.page.eyebrow).toBe(family.label === "Solutions" ? "Solution" : "Industry");
    expect(entry.page.sections.at(-1)?.heading?.eyebrow).toBe("Questions");
  });

  it("links every in-page cross-reference to a shipped route, never '#'", () => {
    const hrefs = entry.page.sections.flatMap((section) =>
      section.blocks.flatMap((block) => (block.kind === "link" ? [block.href] : [])),
    );
    expect(hrefs.filter((href) => href === "#")).toEqual([]);
  });
});

function solutionLinks(id: string) {
  return SOLUTIONS_FAMILY.pages[id]!.sections.flatMap((section) =>
    section.blocks.flatMap((block) => (block.kind === "link" ? [block] : [])),
  );
}

describe("KD-010 caption removal", () => {
  it.each(KD_010_CAPTIONS)("drops the %s caption starting %j on both layouts", (id, start) => {
    for (const width of ["desktop", "mobile"]) {
      expect(snapshotText(`${width}/solutions-${id}.jsx`)).toContain(start);
    }
    const page = SOLUTIONS_FAMILY.pages[id]!;
    expect(pageCopy(page).some((text) => text.includes(start))).toBe(false);
    const captions = page.sections.flatMap((section) =>
      section.blocks.filter((block) => block.kind === "caption"),
    );
    expect(captions).toEqual([]);
  });
});

describe("TASK-007 cross-links", () => {
  it("links GROW to Production Process and Business AI to Mill products", () => {
    expect(solutionLinks("grow-with-sap")).toEqual([
      {
        kind: "link",
        label: "Production Process applications",
        href: "/products/production-process",
      },
    ]);
    expect(solutionLinks("sap-business-ai")).toEqual([
      { kind: "link", label: "Mill products", href: "/industries/mill-products" },
    ]);
    expect(solutionLinks("industry-specific-sap-solutions").map((link) => link.href)).toEqual(
      INDUSTRY_ROUTES.map((route) => route.path),
    );
  });
});

describe("detailRoutes", () => {
  it("fails the build when a route has no content", () => {
    const family: DetailFamily = { ...SERVICES_FAMILY, pages: {} };
    expect(() => detailRoutes(family)).toThrow(DetailContentError);
  });

  it("fails the build when content has no route", () => {
    const family: DetailFamily = {
      ...SERVICES_FAMILY,
      pages: { ...SERVICES_FAMILY.pages, unknown: SERVICES_FAMILY.pages["license-procurement"]! },
    };
    expect(() => detailRoutes(family)).toThrow(DetailContentError);
  });

  it("fails the build when a page repeats a section id", () => {
    const page = SERVICES_FAMILY.pages["license-procurement"]!;
    const family: DetailFamily = {
      ...SERVICES_FAMILY,
      pages: {
        ...SERVICES_FAMILY.pages,
        "license-procurement": { ...page, sections: [...page.sections, ...page.sections] },
      },
    };
    expect(() => detailRoutes(family)).toThrow(DetailContentError);
  });
});

describe("hrefForRouteId (FR-012)", () => {
  it("points at the route once the destination ships", () => {
    expect(hrefForRouteId(PRODUCTS_FAMILY.routes, "vendor-portal")).toBe("/products/vendor-portal");
  });

  it("uses '#' while the destination has not shipped", () => {
    const unshipped = [{ id: "draft", label: "Draft", path: "/solutions/draft", ships: false }];
    expect(hrefForRouteId(unshipped, "draft")).toBe("#");
  });

  it("points Solutions and Industries cross-links at their shipped routes (TASK-007)", () => {
    expect(hrefForRouteId(SOLUTION_ROUTES, "sap-btp")).toBe("/solutions/sap-btp");
    expect(hrefForRouteId(INDUSTRY_ROUTES, "mill-products")).toBe("/industries/mill-products");
  });

  it("rejects an unknown route id", () => {
    expect(() => hrefForRouteId(PRODUCTS_FAMILY.routes, "unknown")).toThrow(DetailContentError);
  });
});

describe("faqSection and faqIndex", () => {
  it("builds the captured FAQ heading with numbered two-digit indexes", () => {
    const section = faqSection("bg", "FAQ", [["Question?", "Answer."]]);
    expect(section.heading).toEqual({ eyebrow: "FAQ", title: "Questions we get asked" });
    expect(section.blocks).toEqual([
      { kind: "faq", items: [{ question: "Question?", answer: "Answer." }] },
    ]);
    expect(faqIndex(0)).toBe("01");
    expect(faqIndex(9)).toBe("10");
  });
});
