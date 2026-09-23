import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { PRODUCTS_FAMILY } from "../../src/lib/detail-content/products";
import { SERVICES_FAMILY } from "../../src/lib/detail-content/services";
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
import { SOLUTION_ROUTES } from "../../src/lib/site-routes";

const SNAPSHOT_DIR = fileURLToPath(
  new URL("../../docs/03-design/paper-snapshot/", import.meta.url),
);

/** FR-006 and FR-007 route tables, verbatim. */
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
 * mobile/products-vendor-portal.jsx alone carries a dismissible "In build" banner that
 * the Desktop capture lacks. ui-specification.md section 5 makes a Mobile-only section
 * a BLOCKED finding, so it is not built until the user decides.
 */
const MOBILE_ONLY_PENDING = new Set([
  "In build",
  "The portal is in development against SAP fixture data and is not yet generally available. Early-access conversations are open now.",
]);

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
        line !== "Book a discovery call" && !/^\d+$/.test(line) && !MOBILE_ONLY_PENDING.has(line),
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
];

describe.each(FAMILIES)("%s family", (family, prefix, expectedRoutes) => {
  const entries = detailRoutes(family);

  it("builds exactly the routes the FR table lists, in order", () => {
    expect(entries.map((entry) => entry.route)).toEqual(expectedRoutes);
  });

  it("builds no family index page (FR-006, FR-007 edge cases)", () => {
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
    expect(hrefForRouteId(SOLUTION_ROUTES, "sap-btp")).toBe("#");
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
