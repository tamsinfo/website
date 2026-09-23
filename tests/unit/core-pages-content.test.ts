import { describe, expect, it } from "vitest";
import { ABOUT_HERO, DIFFERENTIATORS } from "../../src/lib/about-content";
import {
  CAREERS_HERO,
  MODULE_TRACKS,
  OPEN_ROLES,
  OPEN_ROLES_COLUMNS,
  OPEN_ROLES_EMPTY_MESSAGE,
} from "../../src/lib/careers-content";
import { FEATURE_GLYPHS } from "../../src/lib/feature-glyphs";
import {
  CHALLENGES,
  CONNECTED_FEATURES,
  HOME_HERO,
  HOME_STATS,
  INDUSTRY_TILES,
  PRODUCTS_SECTION_HREF,
  PRODUCT_TILES,
  SERVICES_SECTION,
  SERVICE_TILES,
  SOLUTIONS_SECTION,
  SOLUTION_TILES,
  routeHref,
} from "../../src/lib/home-content";
import { buildPageMeta } from "../../src/lib/page-meta";
import {
  DATA_TABLE,
  GROUNDS_TABLE,
  IDENTITY_ROWS,
  PRIVACY_HERO,
  RIGHTS_LISTS,
  type LegalValue,
} from "../../src/lib/privacy-content";
import { PROCESS_STEPS } from "../../src/lib/process-steps";
import {
  INDUSTRY_ROUTES,
  PRODUCT_ROUTES,
  SERVICE_ROUTES,
  SOLUTION_ROUTES,
} from "../../src/lib/site-routes";

describe("SCR-003 Careers open roles (FR-004)", () => {
  it("lists no role, so the table renders its empty state", () => {
    expect(OPEN_ROLES).toHaveLength(0);
  });

  it("uses the user-supplied empty-state copy exactly", () => {
    expect(OPEN_ROLES_EMPTY_MESSAGE).toBe("No openings available");
  });

  it("keeps the snapshot's four column labels and no Apply column", () => {
    expect(OPEN_ROLES_COLUMNS.map((column) => column.label)).toEqual([
      "Role",
      "Module",
      "Location",
      "Experience",
    ]);
  });

  it("shows the six module tracks in snapshot order", () => {
    expect(MODULE_TRACKS.map((track) => track.module)).toEqual([
      "ABAP",
      "FICO",
      "PP/QM/PM",
      "SD",
      "MM",
      "Basis",
    ]);
  });
});

describe("SCR-001 Home content (FR-001, FR-012)", () => {
  it("has five stats, with only the last in the accent colour", () => {
    expect(HOME_STATS).toHaveLength(5);
    expect(HOME_STATS.map((stat) => stat.accent)).toEqual([false, false, false, false, true]);
  });

  it("has five challenge rows", () => {
    expect(CHALLENGES).toHaveLength(5);
  });

  it("links every service and product tile to its shipped route", () => {
    expect(SERVICE_TILES.map((tile) => tile.href)).toEqual(
      SERVICE_ROUTES.map((route) => route.path),
    );
    expect(PRODUCT_TILES.map((tile) => tile.href)).toEqual(
      PRODUCT_ROUTES.map((route) => route.path),
    );
    expect(CONNECTED_FEATURES.factory.href).toBe("/products/connected-factory");
    expect(CONNECTED_FEATURES.ai.href).toBe("/products/digital-manufacturing-ai");
  });

  it("links every solution and industry tile to its shipped route (TASK-007)", () => {
    expect(SOLUTION_TILES.map((tile) => tile.href)).toEqual(
      SOLUTION_ROUTES.map((route) => route.path),
    );
    expect(INDUSTRY_TILES.map((tile) => tile.href)).toEqual(
      INDUSTRY_ROUTES.map((route) => route.path),
    );
  });

  it("links the family index pills to '#': no index page exists", () => {
    expect(SERVICES_SECTION.allHref).toBe("#");
    expect(SOLUTIONS_SECTION.allHref).toBe("#");
  });

  it("points 'See what we have built' at the in-page products section", () => {
    expect(PRODUCTS_SECTION_HREF).toBe("#products-section");
  });

  it("fails fast on an unknown route id instead of emitting a silent '#'", () => {
    expect(() => routeHref(PRODUCT_ROUTES, "no-such-product")).toThrow(/no-such-product/);
  });

  it("gives every product tile a defined glyph", () => {
    for (const tile of PRODUCT_TILES) {
      expect(tile.glyph).toBeDefined();
      expect(FEATURE_GLYPHS[tile.glyph ?? "chip"].paths.length).toBeGreaterThan(0);
    }
  });
});

describe("Shared process rail", () => {
  it("has seven steps", () => {
    expect(PROCESS_STEPS).toHaveLength(7);
  });
});

describe("SCR-002 About content (FR-002)", () => {
  it("has six differentiators", () => {
    expect(DIFFERENTIATORS.map((item) => item.title)).toEqual([
      "SAP Gold Partner",
      "Seven products of our own",
      "Senior consultants",
      "Manufacturing focus",
      "Fixed scope",
      "Honest scoping",
    ]);
  });
});

function confirmValues(values: readonly LegalValue[]): LegalValue[] {
  return values.filter((value) => value.kind === "confirm");
}

describe("SCR-005 Privacy draft (FR-008)", () => {
  it("shows the three hero 'to confirm' markers", () => {
    expect(PRIVACY_HERO.markers.map((marker) => marker.text)).toEqual([
      "to confirm — effective date",
      "to confirm — version number",
      "to confirm — last reviewed by counsel",
    ]);
  });

  it("prefixes every marker with 'to confirm — '", () => {
    const values = [
      ...IDENTITY_ROWS.map((row) => row.value),
      ...DATA_TABLE.rows.flatMap((row) => row.cells),
      ...GROUNDS_TABLE.rows.flatMap((row) => row.cells),
    ];
    for (const value of confirmValues(values)) {
      expect(value.text.startsWith("to confirm — ")).toBe(true);
    }
  });

  it("carries the complete tables and rights lists", () => {
    expect(IDENTITY_ROWS).toHaveLength(10);
    expect(DATA_TABLE.rows).toHaveLength(6);
    expect(GROUNDS_TABLE.rows).toHaveLength(6);
    expect(RIGHTS_LISTS.map((list) => list.items.length)).toEqual([8, 8]);
  });
});

describe("Page metadata (FR-043, FR-044)", () => {
  it.each([
    [HOME_HERO.title, HOME_HERO.intro, "/"],
    [ABOUT_HERO.title, ABOUT_HERO.intro, "/about"],
    [CAREERS_HERO.title, CAREERS_HERO.intro, "/careers"],
    [PRIVACY_HERO.title, PRIVACY_HERO.intro, "/privacy"],
  ])(
    "builds '%s | TAMS Infotech' with a description of at most 160 chars",
    (heading, intro, route) => {
      const meta = buildPageMeta({ heading, description: intro, route });
      expect(meta.title).toBe(`${heading} | TAMS Infotech`);
      expect(meta.description.length).toBeLessThanOrEqual(160);
      expect(meta.ogUrl).toBe(`https://tamsinfotech.com${route}`);
    },
  );
});
