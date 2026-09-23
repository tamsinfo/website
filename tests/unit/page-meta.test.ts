import { describe, expect, it } from "vitest";
import {
  buildPageMeta,
  buildTitle,
  canonicalUrl,
  DESCRIPTION_MAX_LENGTH,
  truncateDescription,
} from "../../src/lib/page-meta";

describe("buildTitle (FR-043)", () => {
  it("formats '<H1> | TAMS Infotech'", () => {
    expect(buildTitle("License Procurement")).toBe("License Procurement | TAMS Infotech");
  });

  it("uses the 404 screen's heading, not '404'", () => {
    expect(buildTitle("That page has moved, been renamed, or never existed.")).toBe(
      "That page has moved, been renamed, or never existed. | TAMS Infotech",
    );
  });
});

describe("truncateDescription (FR-044)", () => {
  it("returns text of 160 characters or fewer unchanged", () => {
    const text = "a".repeat(DESCRIPTION_MAX_LENGTH);
    expect(truncateDescription(text)).toBe(text);
  });

  it("collapses whitespace from multi-line source copy", () => {
    expect(truncateDescription("  One\n   two\tthree  ")).toBe("One two three");
  });

  it("cuts a long text at a word boundary and appends an ellipsis", () => {
    const words = Array.from({ length: 40 }, (_, index) => `word${index}`).join(" ");
    const result = truncateDescription(words);
    expect(result.length).toBeLessThanOrEqual(DESCRIPTION_MAX_LENGTH);
    expect(result.endsWith("…")).toBe(true);
    const body = result.slice(0, -1);
    // The kept text is a prefix of the source that ends on a whole word.
    expect(words.startsWith(body)).toBe(true);
    expect(words.charAt(body.length)).toBe(" ");
  });

  it("keeps the full 159-character budget when the cut lands on a space", () => {
    const first = "x".repeat(159);
    const result = truncateDescription(`${first} tail words here`);
    expect(result).toBe(`${first}…`);
    expect(result.length).toBe(160);
  });

  it("drops a word that would cross the limit", () => {
    const text = `${"a".repeat(150)} ${"b".repeat(20)}`;
    expect(truncateDescription(text)).toBe(`${"a".repeat(150)}…`);
  });

  it("does not leave trailing punctuation before the ellipsis", () => {
    const text = `${"a".repeat(140)}, ${"b".repeat(30)}`;
    expect(truncateDescription(text)).toBe(`${"a".repeat(140)}…`);
  });

  it("cuts a single overlong word hard when no boundary exists", () => {
    const result = truncateDescription("z".repeat(300));
    expect(result).toBe(`${"z".repeat(159)}…`);
  });

  it("keeps the 404 intro whole because it fits in 160 characters", () => {
    const intro =
      "No need to start again from the homepage — the six places worth going are below. If you followed a link from somewhere and it broke, tell us and we will fix it.";
    expect(intro.length).toBeLessThanOrEqual(160);
    expect(truncateDescription(intro)).toBe(intro);
  });
});

describe("buildPageMeta (FR-045)", () => {
  it("fills Open Graph values from the title, description, and route", () => {
    const meta = buildPageMeta({
      heading: "About TAMS",
      description: "Short intro.",
      route: "/about",
    });
    expect(meta).toEqual({
      title: "About TAMS | TAMS Infotech",
      description: "Short intro.",
      ogTitle: "About TAMS | TAMS Infotech",
      ogDescription: "Short intro.",
      ogType: "website",
      ogUrl: "https://tamsinfotech.com/about",
    });
  });

  it("omits og:url when no route is given (404 page)", () => {
    const meta = buildPageMeta({ heading: "Gone", description: "Intro." });
    expect(meta.ogUrl).toBeUndefined();
    expect("ogUrl" in meta).toBe(false);
  });

  it("builds canonical URLs with no trailing slash except the root", () => {
    expect(canonicalUrl("/")).toBe("https://tamsinfotech.com/");
    expect(canonicalUrl("/products/exim/")).toBe("https://tamsinfotech.com/products/exim");
  });
});
