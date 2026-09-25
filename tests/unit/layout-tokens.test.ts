/**
 * G4 revision request 2 regression guard. Meridian's --container-full (1440px) in the
 * @theme block made Tailwind compile w-full and max-w-full to 1440px, which broke
 * every full-width element at every viewport. These tests compile the real
 * src/styles/global.css with Tailwind's own compiler and check that sizing keywords
 * keep their built-in meaning. Each test compiles on its own, so order does not matter.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { compile } from "tailwindcss";
import { describe, expect, it } from "vitest";

const ROOT = fileURLToPath(new URL("../../", import.meta.url));
const GLOBAL_CSS = readFileSync(new URL("../../src/styles/global.css", import.meta.url), "utf8");
const TAILWIND_INDEX = readFileSync(
  new URL("../../node_modules/tailwindcss/index.css", import.meta.url),
  "utf8",
);

/* Fonts are irrelevant to utility output, so their imports resolve to nothing. */
async function loadStylesheet(
  id: string,
): Promise<{ path: string; base: string; content: string }> {
  return { path: id, base: ROOT, content: id === "tailwindcss" ? TAILWIND_INDEX : "" };
}

async function buildUtilities(css: string, candidates: string[]): Promise<Map<string, string>> {
  const compiler = await compile(css, { base: ROOT, loadStylesheet });
  const output = compiler.build(candidates);
  const rules = new Map<string, string>();
  for (const match of output.matchAll(/\.([\w-]+)\s*\{([^{}]*)\}/g)) {
    const [, selector, body] = match;
    if (selector !== undefined && body !== undefined) {
      rules.set(selector, body.replace(/\s+/g, " ").trim());
    }
  }
  return rules;
}

/* Keyword values whose meaning Tailwind defines itself (100%, 100vw, auto ...). */
const SIZING_UTILITIES = ["w", "h", "min-w", "min-h", "max-w", "max-h", "size", "basis", "inset"];
const SIZING_KEYWORDS = ["full", "screen", "auto", "min", "max", "fit", "px", "dvw", "svh"];
const KEYWORD_CANDIDATES = SIZING_UTILITIES.flatMap((utility) =>
  SIZING_KEYWORDS.map((keyword) => `${utility}-${keyword}`),
);

describe("built CSS keeps full-width utilities at 100% (G4 revision request 2)", () => {
  it("compiles w-full to width: 100%", async () => {
    const rules = await buildUtilities(GLOBAL_CSS, ["w-full"]);
    expect(rules.get("w-full")).toBe("width: 100%;");
  });

  it("compiles max-w-full to max-width: 100%", async () => {
    const rules = await buildUtilities(GLOBAL_CSS, ["max-w-full"]);
    expect(rules.get("max-w-full")).toBe("max-width: 100%;");
  });

  it("gives every sizing keyword the same output as Tailwind's default theme", async () => {
    const ours = await buildUtilities(GLOBAL_CSS, KEYWORD_CANDIDATES);
    const defaults = await buildUtilities('@import "tailwindcss";', KEYWORD_CANDIDATES);
    expect(defaults.size).toBeGreaterThan(20);
    for (const [candidate, declaration] of defaults) {
      expect({ candidate, declaration: ours.get(candidate) }).toEqual({ candidate, declaration });
    }
  });

  it("keeps the layout containers at their Meridian values", async () => {
    const rules = await buildUtilities(GLOBAL_CSS, ["max-w-wide", "max-w-narrow"]);
    expect(rules.get("max-w-wide")).toBe("max-width: var(--container-wide);");
    expect(rules.get("max-w-narrow")).toBe("max-width: var(--container-narrow);");
    expect(GLOBAL_CSS).toMatch(/--container-wide: 1280px;/);
    expect(GLOBAL_CSS).toMatch(/--container-narrow: 880px;/);
  });

  it("keeps --container-full out of the @theme block", () => {
    const theme = GLOBAL_CSS.slice(GLOBAL_CSS.indexOf("@theme {"), GLOBAL_CSS.indexOf("\n}\n"));
    expect(theme).not.toMatch(/^\s*--container-full\s*:/m);
    expect(GLOBAL_CSS).toMatch(/:root \{\s*--container-full: 1440px;/);
  });
});
