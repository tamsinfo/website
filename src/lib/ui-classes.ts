/**
 * Class maps for shared components (TASK-003). Token utilities only: every class
 * resolves to a Meridian token in src/styles/global.css, or to the 4px spacing
 * multiplier for snapshot values on the 4px grid (for example h-13 = 52px).
 * Tailwind scans this file, so each class is written out in full.
 */

export type ButtonVariant = "inverse" | "primary" | "outline" | "outline-inverse";
export type ButtonSize = "sm" | "md" | "nav" | "lg" | "xl";

/** design-system.md section 7.1. */
const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  /* Primary on dark sections: limestone pill, slate-900 label. */
  inverse: "bg-limestone-100 text-slate-900 hover:bg-bg-sunk",
  /* Primary on light sections. */
  primary: "bg-primary text-white hover:bg-primary-hover active:bg-primary-active",
  /* Secondary / outline on light sections. */
  outline: "border border-border-strong bg-surface text-text hover:bg-bg-sunk",
  /* Secondary on dark sections (404 "Report a broken link"). */
  "outline-inverse":
    "border border-border-inverse-strong text-text-inverse hover:bg-surface-inverse-raised",
};

/** Sizes from the snapshot: 40, 48, 44 (header pill), 52, and 56 px tall. */
const BUTTON_SIZES: Record<ButtonSize, string> = {
  sm: "h-10 px-5 text-14 leading-4.5",
  md: "h-12 px-6 text-15 leading-4.5",
  nav: "h-11 px-5 text-15 leading-4.5",
  lg: "h-13 px-8 text-16 leading-5",
  xl: "h-14 px-8 text-16 leading-5",
};

/*
 * G4 revision request 2: the fluid layout pattern. Every page band is full-bleed
 * (w-full, background edge to edge) with the design's gutters; its content sits in
 * this centred wrapper. Desktop (xl) caps content at --container-wide, the 1440 frame
 * minus 80px gutters. Below xl the Mobile layout (ADR-013) is one column, so on tablet
 * widths it caps at --container-narrow instead of running text edge to edge.
 */
export const CONTAINER_CLASS = "mx-auto w-full max-w-narrow xl:max-w-wide";

/** Full-bleed band gutters: px-5 on Mobile, px-20 on Desktop (design-system section 5). */
export const GUTTER_CLASS = "px-5 xl:px-20";

export function buttonClasses(variant: ButtonVariant, size: ButtonSize, block: boolean): string {
  return [
    "inline-flex max-w-full shrink-0 items-center justify-center gap-2 rounded-full text-center font-sans font-semibold",
    "aria-disabled:pointer-events-none aria-disabled:opacity-40",
    BUTTON_VARIANTS[variant],
    BUTTON_SIZES[size],
    /* Phones: full-width stacked buttons (design-system section 5). From sm the pill
       fits its label (w-fit also opts out of flex stretch), so tablet widths do not
       draw 800px pills. Desktop: natural width. */
    block ? "w-full sm:w-fit xl:w-auto" : "",
  ]
    .filter(Boolean)
    .join(" ");
}

export type Tone = "light" | "dark";

/** Eyebrow dot and label colour: primary on light, accent-inverse on dark. */
export function eyebrowTone(tone: Tone): { dot: string; label: string } {
  return tone === "dark"
    ? { dot: "bg-accent-inverse", label: "text-accent-inverse" }
    : { dot: "bg-primary", label: "text-primary" };
}

export type SectionTone = "bg" | "sunk" | "surface" | "inverse";

const SECTION_TONES: Record<SectionTone, string> = {
  bg: "bg-bg text-text",
  sunk: "bg-bg-sunk text-text",
  surface: "bg-surface text-text",
  inverse: "bg-surface-inverse text-text-inverse",
};

export function sectionToneClass(tone: SectionTone): string {
  return SECTION_TONES[tone];
}

export type ChipVariant = "track" | "outline" | "warning" | "warning-strong" | "status";

/** design-system.md section 7.6 plus the Careers and Privacy badge captures. */
const CHIP_VARIANTS: Record<ChipVariant, string> = {
  /* Selected-style chip: Careers module chips (MM, PP/QM ...). 28px. */
  track:
    "h-7 px-3 border border-copper-100 bg-primary-soft font-mono text-12 font-medium leading-4 text-primary",
  /* Unselected chip. 30px. */
  outline: "h-7.5 px-3 border border-border-strong font-sans text-14 leading-4.5 text-text-muted",
  /* Privacy "to confirm" marker. 24px. */
  warning:
    "h-6 px-3 bg-warning-soft font-mono text-10 font-semibold uppercase tracking-label leading-3 text-warning-on",
  /* Privacy "Draft — not yet legal advice". 28px. */
  "warning-strong":
    "h-7 px-3 bg-warning font-mono text-11 font-semibold uppercase tracking-label leading-3.5 text-warning-on",
  /* Careers "N roles open" status badge with a dot. 32px. */
  status:
    "h-8 gap-2 px-4 bg-success-soft font-sans text-14 font-semibold leading-4.5 text-success-on",
};

/** Table body row and cell classes (design-system.md section 7.8). */
export const TABLE_ROW_CLASS = "border-b border-border last:border-b-0 even:bg-limestone-50";
export const TABLE_CELL_CLASS = "px-5 py-6 align-middle xl:px-8";

/** DataTable rows and cells stack as blocks below xl (G4 revision request 2). */
export const STACKED_ROW_CLASS = "block xl:table-row";
export const STACKED_CELL_CLASS = "block xl:table-cell";

export type TableHeaderTone = "sunk" | "limestone";

export function tableHeaderClass(tone: TableHeaderTone): string {
  return tone === "limestone" ? "bg-limestone-100" : "bg-bg-sunk";
}

export function chipClasses(variant: ChipVariant): string {
  return `inline-flex shrink-0 items-center self-start rounded-full ${CHIP_VARIANTS[variant]}`;
}
