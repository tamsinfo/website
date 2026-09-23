import { describe, expect, it } from "vitest";
import {
  allRoutes,
  currentNavKey,
  currentNavLabel,
  DISCOVERY_CALL_HREF,
  FOOTER_COLUMNS,
  FOOTER_LEGAL_LINKS,
  hrefFor,
  INDUSTRY_ROUTES,
  isCurrentHref,
  PLACEHOLDER_ROUTES,
  PRIMARY_NAV,
  PRODUCT_ROUTES,
  SERVICE_ROUTES,
  SOLUTION_ROUTES,
} from "../../src/lib/site-routes";

describe("hrefFor (FR-012)", () => {
  it("returns the route path for a shipped page", () => {
    expect(hrefFor({ id: "x", label: "X", path: "/x", ships: true })).toBe("/x");
  });

  it("returns '#' for an unshipped page even when it has a path", () => {
    expect(hrefFor({ id: "x", label: "X", path: "/x", ships: false })).toBe("#");
  });

  it("returns '#' for every placeholder destination", () => {
    for (const route of Object.values(PLACEHOLDER_ROUTES)) {
      expect(hrefFor(route)).toBe("#");
    }
  });

  it("returns the real route for every Solutions and Industries page (TASK-007)", () => {
    for (const route of [...SOLUTION_ROUTES, ...INDUSTRY_ROUTES]) {
      expect(route.ships).toBe(true);
      expect(route.path).not.toBeNull();
      expect(hrefFor(route)).toBe(route.path);
      expect(hrefFor(route)).not.toBe("#");
    }
  });

  it("keeps the family index destinations at '#': no index page exists", () => {
    expect(hrefFor(PLACEHOLDER_ROUTES.allSolutions)).toBe("#");
    expect(hrefFor(PLACEHOLDER_ROUTES.allIndustries)).toBe("#");
  });
});

describe("route inventory (system-architecture.md section 2.3)", () => {
  it("declares 4 services, 7 products, 8 solutions, and 6 industries", () => {
    expect(SERVICE_ROUTES).toHaveLength(4);
    expect(PRODUCT_ROUTES).toHaveLength(7);
    expect(SOLUTION_ROUTES).toHaveLength(8);
    expect(INDUSTRY_ROUTES).toHaveLength(6);
  });

  it("ships every Must page and every Solutions and Industries page", () => {
    const shipped = allRoutes()
      .filter((route) => route.ships)
      .map((route) => route.path);
    expect(shipped).toEqual(
      expect.arrayContaining([
        "/",
        "/about",
        "/careers",
        "/contact",
        "/privacy",
        ...SERVICE_ROUTES.map((route) => route.path),
        ...PRODUCT_ROUTES.map((route) => route.path),
        ...SOLUTION_ROUTES.map((route) => route.path),
        ...INDUSTRY_ROUTES.map((route) => route.path),
      ]),
    );
    expect(shipped).toHaveLength(30);
  });

  it("uses unique ids and paths", () => {
    const routes = allRoutes();
    expect(new Set(routes.map((route) => route.id)).size).toBe(routes.length);
    const paths = routes.map((route) => route.path).filter((path) => path !== null);
    expect(new Set(paths).size).toBe(paths.length);
  });
});

describe("navigation data", () => {
  it("lists the eight header items in the captured order", () => {
    expect(PRIMARY_NAV.map((item) => item.label)).toEqual([
      "Home",
      "Services",
      "Solutions",
      "Products",
      "Industries",
      "About Us",
      "Careers",
      "Contact Us",
    ]);
  });

  it("points every dropdown link, Solutions and Industries included, at its own route", () => {
    const menus = PRIMARY_NAV.filter((item) => item.kind === "menu");
    expect(menus.map((item) => item.key)).toEqual([
      "services",
      "solutions",
      "products",
      "industries",
    ]);
    for (const item of menus) {
      expect(item.links.length).toBeGreaterThan(0);
      expect(item.links.every((link) => link.href.startsWith(`/${item.key}/`))).toBe(true);
    }
  });

  it("links Terms, Cookies, and Sitemap to '#' and Privacy to /privacy", () => {
    expect(FOOTER_LEGAL_LINKS).toEqual([
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "#" },
      { label: "Cookies", href: "#" },
      { label: "Sitemap", href: "#" },
    ]);
  });

  it("uses the frozen footer copy for footer labels", () => {
    const services = FOOTER_COLUMNS.find((column) => column.heading === "Services");
    expect(services?.links[0]).toEqual({
      label: "SAP S/4HANA Cloud Implementation — GROW and RISE",
      href: "/services/s4hana-cloud-implementation",
    });
  });

  it("sends 'Book a discovery call' to the contact form anchor (FR-016)", () => {
    expect(DISCOVERY_CALL_HREF).toBe("/contact#contact-form");
  });
});

describe("currentNavKey", () => {
  it.each([
    ["/", "home"],
    ["/about", "about"],
    ["/careers/", "careers"],
    ["/contact", "contact"],
    ["/services/license-procurement", "services"],
    ["/products/exim", "products"],
    ["/solutions/sap-btp", "solutions"],
    ["/industries/automotive", "industries"],
  ])("maps %s to %s", (path, key) => {
    expect(currentNavKey(path)).toBe(key);
  });

  it("highlights nothing on the 404 and Privacy pages", () => {
    expect(currentNavKey("/404")).toBeUndefined();
    expect(currentNavKey("/privacy")).toBeUndefined();
    expect(currentNavLabel(undefined)).toBeUndefined();
  });

  it("gives the Mobile badge label for the current item", () => {
    expect(currentNavLabel("contact")).toBe("Contact Us");
    expect(currentNavLabel("services")).toBe("Services");
  });

  it("never marks '#' as the current page", () => {
    expect(isCurrentHref("#", "/")).toBe(false);
    expect(isCurrentHref("/about", "/about/")).toBe(true);
  });
});
