/**
 * G4 revision request 2 regression guard for the fluid layout. It reads every class
 * string in src/ and rejects fixed widths that cannot fit the smallest supported
 * viewport. Fixed widths are fine as max-widths, or behind a min-width breakpoint
 * (sm: to 2xl:), where a container can hold them.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const ROOT = fileURLToPath(new URL("../../", import.meta.url));
const SRC = join(ROOT, "src");

/* 320px viewport minus the 20px Mobile gutters (px-5) on each side. */
const SMALLEST_CONTENT_WIDTH_PX = 320 - 2 * 20;
const SPACING_UNIT_PX = 4;
const MIN_WIDTH_VARIANTS = new Set(["sm", "md", "lg", "xl", "2xl"]);
const FIXED_WIDTH = /^-?(w|min-w|size|basis)-(\d+(?:\.\d+)?)$/;

/*
 * Decorative line drawings that are wider than a phone on purpose. Each is
 * aria-hidden, absolutely positioned, and clipped by its section's overflow-clip, so
 * it can never widen the page.
 */
const DECORATIVE_ALLOWLIST: readonly { file: string; token: string }[] = [
  { file: "src/components/HexWatermark.astro", token: "size-95" },
  { file: "src/components/home/HomeHero.astro", token: "size-95" },
  { file: "src/pages/404.astro", token: "size-95" },
  { file: "src/pages/about.astro", token: "w-95" },
];

interface ClassString {
  readonly file: string;
  readonly tokens: readonly string[];
}

function sourceFiles(directory: string): string[] {
  return readdirSync(directory).flatMap((name) => {
    const path = join(directory, name);
    if (statSync(path).isDirectory()) return sourceFiles(path);
    return path.endsWith(".astro") || path.endsWith(".ts") ? [path] : [];
  });
}

function classStrings(): ClassString[] {
  return sourceFiles(SRC).flatMap((path) => {
    const file = relative(ROOT, path);
    const text = readFileSync(path, "utf8");
    return [...text.matchAll(/"([^"\n]*)"|`([^`]*)`|'([^'\n]*)'/g)].map((match) => ({
      file,
      tokens: (match[1] ?? match[2] ?? match[3] ?? "").split(/\s+/).filter(Boolean),
    }));
  });
}

/** The utility part of a class, or null when a min-width variant gates it. */
function baseUtility(token: string): string | null {
  const parts = token.split(":");
  const variants = parts.slice(0, -1);
  if (variants.some((variant) => MIN_WIDTH_VARIANTS.has(variant) || variant.startsWith("@"))) {
    return null;
  }
  return parts.at(-1) ?? null;
}

function fixedWidthPx(utility: string): number | null {
  const match = FIXED_WIDTH.exec(utility);
  return match?.[2] === undefined ? null : Number(match[2]) * SPACING_UNIT_PX;
}

describe("fixed widths at the Mobile breakpoint (G4 revision request 2, NFR-020)", () => {
  const strings = classStrings();

  it("finds the class strings it guards", () => {
    expect(strings.some((entry) => entry.tokens.includes("w-full"))).toBe(true);
    expect(strings.length).toBeGreaterThan(500);
  });

  it("has no unprefixed fixed width wider than a 320px viewport's content box", () => {
    const violations = strings.flatMap(({ file, tokens }) =>
      tokens
        .filter((token) => {
          const utility = baseUtility(token);
          const width = utility === null ? null : fixedWidthPx(utility);
          return width !== null && width > SMALLEST_CONTENT_WIDTH_PX;
        })
        .filter((token) => !DECORATIVE_ALLOWLIST.some((a) => a.file === file && a.token === token))
        .map((token) => `${file}: ${token}`),
    );
    expect(violations).toEqual([]);
  });

  it("never combines w-full with a fixed width at the Mobile breakpoint", () => {
    const violations = strings
      .filter(({ tokens }) => tokens.includes("w-full"))
      .flatMap(({ file, tokens }) =>
        tokens
          .filter((token) => {
            const utility = baseUtility(token);
            return utility !== null && /^(w|min-w|size)-\d/.test(utility);
          })
          .map((token) => `${file}: w-full with ${token}`),
      );
    expect(violations).toEqual([]);
  });

  it("keeps every decorative allowlist entry current", () => {
    for (const entry of DECORATIVE_ALLOWLIST) {
      const found = strings.some(
        ({ file, tokens }) => file === entry.file && tokens.includes(entry.token),
      );
      expect({ ...entry, found }).toEqual({ ...entry, found: true });
    }
  });
});
