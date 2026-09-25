/**
 * G4 revision request 2 regression guard for the fluid layout. It reads every class
 * string in src/ and rejects widths that cannot fit the smallest viewport their
 * breakpoint applies to. It resolves numeric spacing multiples, named container and
 * spacing tokens (w-narrow is 880px), and var() widths (w-(--x)) from global.css. It
 * rejects arbitrary values (w-[600px]) and viewport widths (w-screen) outright.
 * max-w-* is a cap, not a width, so only its arbitrary form is checked.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { DECORATION_CLASSES } from "../../src/lib/decoration-classes";

const ROOT = fileURLToPath(new URL("../../", import.meta.url));
const SRC = join(ROOT, "src");
const GLOBAL_CSS = readFileSync(join(SRC, "styles/global.css"), "utf8");
const DECORATION_FILE = "src/lib/decoration-classes.ts";
const SPACING_UNIT_PX = 4;

/*
 * Widest content box for each breakpoint, at the smallest viewport it applies to.
 * base: 320 - 2 x 20px gutters. sm: 640 - 40. md: 768 - 40. lg: capped at
 * --container-narrow (880). xl: 1280 - 2 x 80px gutters. 2xl: --container-wide.
 * max-* variants apply down to 320px, so they keep the base budget.
 */
const BUDGET_PX: Readonly<Record<string, number>> = {
  base: 280,
  sm: 600,
  md: 728,
  lg: 880,
  xl: 1120,
  "2xl": 1280,
};

const WIDTH_UTILITY = /^-?(w|min-w|size|basis|max-w)-(.+)$/;
/* Tailwind keywords that are relative or tiny: never a fixed overflow risk. */
const SAFE_KEYWORDS = new Set(["full", "auto", "fit", "min", "max", "px", "0"]);

/** Every `--name: <n>px` token in global.css, by name. */
const TOKEN_PX: ReadonlyMap<string, number> = new Map(
  [...GLOBAL_CSS.matchAll(/(--[\w-]+):\s*(\d+(?:\.\d+)?)px;/g)].map((m) => [
    m[1] ?? "",
    Number(m[2]),
  ]),
);

interface ClassString {
  readonly file: string;
  readonly tokens: readonly string[];
}

type WidthVerdict = { readonly kind: "ok" } | { readonly kind: "bad"; readonly reason: string };

function budgetFor(variants: readonly string[]): number {
  const budgets = variants.flatMap((variant) => {
    const budget = BUDGET_PX[variant];
    return budget === undefined ? [] : [budget];
  });
  return budgets.length === 0 ? (BUDGET_PX["base"] ?? 0) : Math.max(...budgets);
}

/** Resolves a width value to px, or explains why it is not allowed. */
function widthPx(utility: string, value: string): number | string | null {
  if (value.startsWith("[")) return "arbitrary value";
  if (value.startsWith("(")) {
    const name = /--[\w-]+/.exec(value)?.[0];
    const px = name === undefined ? undefined : TOKEN_PX.get(name);
    return px ?? "unresolved var() width";
  }
  if (utility === "max-w") return null;
  if (value === "screen") return "viewport width (100vw includes the scrollbar)";
  if (SAFE_KEYWORDS.has(value) || value.includes("/")) return null;
  if (/^\d+(\.\d+)?$/.test(value)) return Number(value) * SPACING_UNIT_PX;
  return TOKEN_PX.get(`--container-${value}`) ?? TOKEN_PX.get(`--spacing-${value}`) ?? null;
}

/** Judges one class token. Pure, so the fixtures below exercise the same rule. */
function judge(token: string): WidthVerdict {
  const parts = token.split(":");
  const utility = parts.at(-1) ?? "";
  const match = WIDTH_UTILITY.exec(utility);
  if (match?.[1] === undefined || match[2] === undefined) return { kind: "ok" };
  const width = widthPx(match[1], match[2]);
  if (width === null) return { kind: "ok" };
  if (typeof width === "string") return { kind: "bad", reason: width };
  const budget = budgetFor(parts.slice(0, -1));
  return width > budget
    ? { kind: "bad", reason: `${width}px exceeds the ${budget}px content box` }
    : { kind: "ok" };
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

const DECORATION_VALUES: ReadonlySet<string> = new Set(Object.values(DECORATION_CLASSES));

/* Only the named decoration constants, in their own module, may exceed a budget. */
function isDecoration({ file, tokens }: ClassString): boolean {
  return file === DECORATION_FILE && DECORATION_VALUES.has(tokens.join(" "));
}

function violations(strings: readonly ClassString[]): string[] {
  return strings
    .filter((entry) => !isDecoration(entry))
    .flatMap(({ file, tokens }) =>
      tokens.flatMap((token) => {
        const verdict = judge(token);
        return verdict.kind === "bad" ? [`${file}: ${token} (${verdict.reason})`] : [];
      }),
    );
}

/** The opening tag that contains `index`, found by walking back to its "<". */
function enclosingTag(markup: string, index: number): string {
  const start = markup.lastIndexOf("<", index);
  let depth = 0;
  for (let i = start; i < markup.length; i++) {
    const char = markup[i];
    if (char === "{") depth++;
    if (char === "}") depth--;
    if (char === ">" && depth === 0) return markup.slice(start, i + 1);
  }
  return markup.slice(start);
}

describe("width judgement (G4 revision request 2, NFR-020)", () => {
  it.each([
    ["w-narrow", "named container, 880px"],
    ["w-wide", "named container, 1280px"],
    ["min-w-content", "named container, 1120px"],
    ["basis-prose", "named container, 680px"],
    ["size-narrow", "named container, 880px"],
    ["w-[600px]", "arbitrary value"],
    ["min-w-[20rem]", "arbitrary value"],
    ["max-w-[900px]", "arbitrary value"],
    ["w-(--container-wide)", "var() width, 1280px"],
    ["basis-(--unknown-token)", "unresolved var() width"],
    ["w-screen", "viewport width"],
    ["w-150", "600px at base"],
    ["max-xl:w-150", "max-xl keeps the base budget"],
    ["hover:w-75", "state variants keep the base budget"],
    ["sm:w-200", "800px over the 600px sm budget"],
    ["md:w-190", "760px over the 728px md budget"],
    ["lg:w-225", "900px over the 880px lg budget"],
    ["xl:w-300", "1200px over the 1120px xl budget"],
    ["2xl:w-330", "1320px over the 1280px 2xl budget"],
  ])("rejects %s (%s)", (token) => {
    expect(judge(token).kind).toBe("bad");
  });

  it.each([
    "w-full",
    "max-w-full",
    "w-fit",
    "w-auto",
    "w-5/11",
    "w-70",
    "min-w-39.5",
    "size-(--size-icon-xl)",
    "max-w-narrow",
    "xl:max-w-wide",
    "xl:max-w-270",
    "sm:w-150",
    "md:w-180",
    "lg:w-narrow",
    "xl:w-150",
    "xl:w-content",
    "2xl:w-wide",
    "border-(length:--border-width-thick)",
  ])("accepts %s", (token) => {
    expect(judge(token)).toEqual({ kind: "ok" });
  });
});

describe("fixed widths in src/ (G4 revision request 2, NFR-020)", () => {
  const strings = classStrings();

  it("finds the class strings it guards", () => {
    expect(strings.some((entry) => entry.tokens.includes("w-full"))).toBe(true);
    expect(strings.length).toBeGreaterThan(500);
  });

  it("has no width wider than its breakpoint's content box", () => {
    expect(violations(strings)).toEqual([]);
  });

  it("reports a planted violation in a real file's strings", () => {
    const planted = [...strings, { file: "src/pages/contact.astro", tokens: ["w-narrow"] }];
    expect(violations(planted)).toEqual([
      "src/pages/contact.astro: w-narrow (880px exceeds the 280px content box)",
    ]);
  });

  it("exempts a decoration only in its own module, not a copy elsewhere", () => {
    const copy = DECORATION_CLASSES.heroWatermark.split(" ");
    expect(violations([{ file: DECORATION_FILE, tokens: copy }])).toEqual([]);
    expect(violations([{ file: "src/pages/404.astro", tokens: copy }])).not.toEqual([]);
  });

  it("never combines w-full with a fixed width at the same breakpoint", () => {
    const clashes = strings
      .filter(({ tokens }) => tokens.includes("w-full"))
      .flatMap(({ file, tokens }) =>
        tokens
          .filter((token) => /^(w|min-w|size)-(\d|\[|\()/.test(token))
          .map((token) => `${file}: w-full with ${token}`),
      );
    expect(clashes).toEqual([]);
  });

  it("hand-writes no band gutters outside GUTTER_CLASS", () => {
    const copies = strings
      .filter(({ file }) => file !== "src/lib/ui-classes.ts")
      .filter(({ tokens }) => tokens.includes("xl:px-20") || tokens.includes("xl:p-20"))
      .map(({ file, tokens }) => `${file}: ${tokens.join(" ")}`);
    expect(copies).toEqual([]);
  });
});

describe("decoration classes (G4 revision request 2)", () => {
  it("keeps every decoration absolutely positioned and inert", () => {
    for (const [name, classes] of Object.entries(DECORATION_CLASSES)) {
      const tokens = classes.split(" ");
      expect({ name, absolute: tokens.includes("absolute") }).toEqual({ name, absolute: true });
      expect({ name, inert: tokens.includes("pointer-events-none") }).toEqual({
        name,
        inert: true,
      });
    }
  });

  it("uses a decoration only on an aria-hidden element", () => {
    const uses = sourceFiles(SRC)
      .filter((path) => path.endsWith(".astro"))
      .flatMap((path) => {
        const text = readFileSync(path, "utf8");
        const markup = text.slice(text.indexOf("---", 3) + 3);
        return [...markup.matchAll(/DECORATION_CLASSES/g)].map((match) => ({
          file: relative(ROOT, path),
          hidden: enclosingTag(markup, match.index).includes('aria-hidden="true"'),
        }));
      });
    expect(uses.length).toBeGreaterThanOrEqual(3);
    for (const use of uses) expect(use).toEqual({ file: use.file, hidden: true });
  });
});
