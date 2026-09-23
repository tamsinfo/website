/**
 * Class maps for the detail template (TASK-006). Token utilities only, transcribed
 * from desktop/services-*.jsx, desktop/products-*.jsx, and their mobile captures.
 * Mobile values come first; the xl: variant carries the Desktop value.
 * Tailwind scans this file, so each class is written out in full.
 */

import type { BlockTone, LeadMeasure, LeadSize } from "./detail-page";

interface ToneClasses {
  readonly light: string;
  readonly dark: string;
}

function pick(classes: ToneClasses, tone: BlockTone): string {
  return tone === "dark" ? classes.dark : classes.light;
}

const LEAD_SIZES: Record<LeadSize, string> = {
  md: "text-20/snug xl:text-26/snug",
  lg: "text-22/snug xl:text-30/snug",
  xl: "text-24/snug xl:text-36/snug",
};

const LEAD_MEASURES: Record<LeadMeasure, string> = {
  "960": "xl:max-w-240",
  "1000": "xl:max-w-250",
  "1080": "xl:max-w-270",
};

export function leadClasses(size: LeadSize, measure: LeadMeasure, tone: BlockTone): string {
  return [
    "font-display font-regular tracking-snug",
    LEAD_SIZES[size],
    LEAD_MEASURES[measure],
    pick({ light: "text-text-muted", dark: "text-text-inverse-muted" }, tone),
  ].join(" ");
}

export function paragraphClasses(tone: BlockTone): string {
  return `text-17/body xl:max-w-215 ${pick({ light: "text-text-muted", dark: "text-text-inverse-muted" }, tone)}`;
}

/** Callout and card surfaces: hairline card on light, raised panel on dark. */
export function panelClasses(tone: BlockTone): string {
  return pick(
    {
      light: "border border-border bg-surface",
      dark: "bg-surface-inverse-raised",
    },
    tone,
  );
}

export function accentBarClasses(tone: BlockTone): string {
  return pick({ light: "bg-primary", dark: "bg-accent-inverse" }, tone);
}

export function strongTextClasses(tone: BlockTone): string {
  return pick({ light: "text-text", dark: "text-text-inverse" }, tone);
}

export function mutedTextClasses(tone: BlockTone): string {
  return pick({ light: "text-text-muted", dark: "text-text-inverse-muted" }, tone);
}

export function dividerClasses(tone: BlockTone): string {
  return pick({ light: "border-border", dark: "border-border-inverse" }, tone);
}

export function tickClasses(tone: BlockTone): string {
  return pick({ light: "stroke-primary", dark: "stroke-accent-inverse" }, tone);
}

/** Card title sizes: lg 22 / 18, md 20 / 17 (Desktop / Mobile px). */
export function cardTitleClasses(size: "lg" | "md"): string {
  return size === "lg"
    ? "text-18/heading xl:text-22/heading"
    : "text-17/heading xl:text-20/heading";
}

/** Attribute table label column: 260px or 280px on Desktop. */
export function attributeLabelWidth(width: "md" | "lg"): string {
  return width === "lg" ? "xl:w-70" : "xl:w-65";
}

/** Attribute table surfaces per tone. */
export function attributeTableClasses(tone: BlockTone): {
  readonly frame: string;
  readonly head: string;
  readonly firstHead: string;
  readonly otherHead: string;
  readonly stripe: string;
  readonly label: string;
  readonly value: string;
  readonly divider: string;
} {
  return tone === "dark"
    ? {
        frame: "border border-border-inverse bg-surface-inverse-raised",
        head: "bg-surface-inverse",
        firstHead: "text-accent-inverse",
        otherHead: "text-text-inverse",
        stripe: "even:bg-surface-inverse",
        label: "text-text-inverse",
        value: "text-text-inverse-muted",
        divider: "border-border-inverse",
      }
    : {
        frame: "border border-border bg-surface",
        head: "bg-bg-sunk",
        firstHead: "text-primary",
        otherHead: "text-text",
        stripe: "even:bg-limestone-50",
        label: "text-text",
        value: "text-text-muted",
        divider: "border-border",
      };
}
