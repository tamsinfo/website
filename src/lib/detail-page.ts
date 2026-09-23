/**
 * C-26 Detail page model (TASK-006). One data-driven template renders every Services,
 * Products, Solutions, and Industries page (ui-specification.md section 5).
 *
 * A page is a hero plus an ordered list of body sections. Each section is an optional
 * eyebrow and heading plus an ordered list of blocks. Every block kind maps to one
 * pattern captured in the detail-page snapshots, so a new page is new data, not new
 * markup. TASK-007 reuses this model unchanged.
 */

import { type SiteRoute, hrefFor } from "./site-routes";

/** Section background, in snapshot order: bg, bg-sunk, surface-inverse. */
export type DetailSectionTone = "bg" | "sunk" | "inverse";

/** Light blocks sit on bg or bg-sunk; dark blocks sit on surface-inverse. */
export type BlockTone = "light" | "dark";

export function blockTone(tone: DetailSectionTone): BlockTone {
  return tone === "inverse" ? "dark" : "light";
}

/** Display-type lead paragraph sizes: md 26/20, lg 30/22, xl 36/24 (Desktop / Mobile px). */
export type LeadSize = "md" | "lg" | "xl";

/** Lead paragraph measure on Desktop, in px as captured. */
export type LeadMeasure = "960" | "1000" | "1080";

export interface LeadBlock {
  readonly kind: "lead";
  readonly text: string;
  readonly size: LeadSize;
  readonly measure: LeadMeasure;
}

/** Body paragraph, 17/body, 860px measure. */
export interface ParagraphBlock {
  readonly kind: "paragraph";
  readonly text: string;
}

/** Bordered note with the 3px accent bar. */
export interface CalloutBlock {
  readonly kind: "callout";
  readonly title?: string;
  readonly text: string;
}

/** Figure caption with the short accent rule. */
export interface CaptionBlock {
  readonly kind: "caption";
  readonly text: string;
}

/** Text link with trailing arrow. */
export interface LinkBlock {
  readonly kind: "link";
  readonly label: string;
  readonly href: string;
}

export interface RailStep {
  readonly title: string;
  readonly detail?: string;
}

/** Numbered horizontal process rail (circles joined by a hairline). */
export interface RailBlock {
  readonly kind: "rail";
  readonly steps: readonly RailStep[];
}

export interface StepTile {
  readonly title: string;
  readonly detail: string;
  /** Dashed border: a custom-application step (Production Process legend). */
  readonly dashed?: boolean;
}

/** Sentence above a step grid with one emphasised word. */
export interface EmphasisSentence {
  readonly before: string;
  readonly emphasis: string;
  readonly after: string;
}

/** Numbered step tiles, five per row on Desktop. */
export interface StepGridBlock {
  readonly kind: "stepGrid";
  readonly intro?: EmphasisSentence;
  readonly steps: readonly StepTile[];
  readonly legend?: { readonly solid: string; readonly dashed: string };
}

export interface ComparisonRow {
  readonly label: string;
  readonly values: readonly [string, string];
}

/** Row-label plus two value columns (edition comparisons). */
export interface ComparisonTableBlock {
  readonly kind: "comparisonTable";
  readonly caption: string;
  readonly columns: readonly [string, string];
  readonly rows: readonly ComparisonRow[];
}

export interface AttributeRow {
  readonly label: string;
  readonly value: string;
}

/** Two-column attribute and value table. */
export interface AttributeTableBlock {
  readonly kind: "attributeTable";
  readonly caption: string;
  readonly columns: readonly [string, string];
  readonly rows: readonly AttributeRow[];
  /** Label column width on Desktop: 260px or 280px in the snapshots. */
  readonly labelWidth: "md" | "lg";
}

/** Tick list with hairline dividers. */
export interface ChecklistBlock {
  readonly kind: "checklist";
  readonly items: readonly string[];
}

export interface DetailCard {
  readonly title: string;
  readonly body: string;
  /** Italic footnote under a divider ("Needs Connected Factory."). */
  readonly note?: string;
}

/** Card rows. Each inner array is one Desktop row; cards share the row equally. */
export interface CardsBlock {
  readonly kind: "cards";
  readonly rows: readonly (readonly DetailCard[])[];
  /** lg: 22/18 titles, 32px padding. md: 20/17 titles (Desktop / Mobile px). */
  readonly titleSize: "lg" | "md";
  /** 4px primary stripe across the top of each card. */
  readonly accentTop?: boolean;
}

export interface ChipGroup {
  readonly label: string;
  readonly chips: readonly string[];
}

/** Labelled chip groups side by side (AMS coverage). */
export interface ChipGroupsBlock {
  readonly kind: "chipGroups";
  readonly groups: readonly ChipGroup[];
}

export interface OperationRow {
  readonly title: string;
  readonly meta: string;
  readonly chips: readonly string[];
}

/** Card rows with a title, a mono meta line, and operation chips. */
export interface OperationsBlock {
  readonly kind: "operations";
  readonly rows: readonly OperationRow[];
}

export interface NumberedDetail {
  readonly title: string;
  readonly paragraphs: readonly string[];
}

/** Numbered long-form cards (one per application). */
export interface NumberedDetailsBlock {
  readonly kind: "numberedDetails";
  readonly items: readonly NumberedDetail[];
}

export interface BulletColumn {
  readonly label: string;
  readonly items: readonly string[];
}

/** Side-by-side bordered cards, each a labelled bullet list. */
export interface BulletColumnsBlock {
  readonly kind: "bulletColumns";
  readonly columns: readonly BulletColumn[];
}

export interface ArchitectureColumn {
  readonly label: string;
  /** The TAMS product column: primary outline and label. */
  readonly emphasis?: boolean;
  readonly items: readonly string[];
}

/**
 * Three-column system diagram. `connectors[i]` joins column i to column i + 1:
 * solid = system integration, dashed = agency exchange.
 */
export interface ArchitectureBlock {
  readonly kind: "architecture";
  readonly columns: readonly ArchitectureColumn[];
  readonly connectors: readonly ("solid" | "dashed")[];
}

/** Large figure with its explanation. */
export interface StatBlock {
  readonly kind: "stat";
  readonly value: string;
  readonly text: string;
}

export interface FaqItem {
  readonly question: string;
  readonly answer: string;
}

/** Numbered questions, every answer shown (the captured expanded state). */
export interface FaqBlock {
  readonly kind: "faq";
  readonly items: readonly FaqItem[];
}

export type DetailBlock =
  | LeadBlock
  | ParagraphBlock
  | CalloutBlock
  | CaptionBlock
  | LinkBlock
  | RailBlock
  | StepGridBlock
  | ComparisonTableBlock
  | AttributeTableBlock
  | ChecklistBlock
  | CardsBlock
  | ChipGroupsBlock
  | OperationsBlock
  | NumberedDetailsBlock
  | BulletColumnsBlock
  | ArchitectureBlock
  | StatBlock
  | FaqBlock;

export interface DetailSection {
  /** Unique within the page; used for the heading id and aria-labelledby. */
  readonly id: string;
  readonly tone: DetailSectionTone;
  /** Eyebrow plus the section's <h2>. Omitted only by a headingless band (stat). */
  readonly heading?: { readonly eyebrow: string; readonly title: string };
  /** Band layout: tighter vertical padding, no heading (Connected Factory stat). */
  readonly compact?: boolean;
  readonly blocks: readonly DetailBlock[];
}

export interface DetailPageContent {
  /** Hero eyebrow: "Service", "Product", "Solution", or "Industry". */
  readonly eyebrow: string;
  /** The page's H1, verbatim from its snapshot (FR-043). */
  readonly title: string;
  /** Last breadcrumb item, verbatim; differs from the H1 on some screens (EXIM). */
  readonly breadcrumbLabel: string;
  /** Hero introduction paragraph (FR-044 description source). */
  readonly intro: string;
  readonly sections: readonly DetailSection[];
}

export interface DetailFamily {
  /** Middle breadcrumb item: "Services", "Products", "Solutions", "Industries". */
  readonly label: string;
  readonly routes: readonly SiteRoute[];
  readonly pages: Readonly<Record<string, DetailPageContent>>;
}

export interface DetailRouteEntry {
  readonly slug: string;
  readonly route: string;
  readonly family: string;
  readonly page: DetailPageContent;
}

export class DetailContentError extends Error {
  readonly code = "DETAIL_CONTENT_MISSING";
}

/**
 * Pairs every route in a family with its content. Build fails fast when a route has
 * no content, when content has no route, or when a section id repeats: each would
 * otherwise ship a silent 404 or a broken aria-labelledby.
 */
export function detailRoutes(family: DetailFamily): DetailRouteEntry[] {
  const routeIds = new Set(family.routes.map((route) => route.id));
  for (const id of Object.keys(family.pages)) {
    if (!routeIds.has(id)) {
      throw new DetailContentError(`${family.label}: content "${id}" has no route`);
    }
  }
  return family.routes.map((route) => {
    const page = family.pages[route.id];
    if (page === undefined || route.path === null) {
      throw new DetailContentError(`${family.label}: route "${route.id}" has no content`);
    }
    const ids = page.sections.map((section) => section.id);
    if (new Set(ids).size !== ids.length) {
      throw new DetailContentError(`${family.label}: "${route.id}" repeats a section id`);
    }
    const slug = route.path.slice(route.path.lastIndexOf("/") + 1);
    return { slug, route: route.path, family: family.label, page };
  });
}

/** Breadcrumb trail: Home (link), family (text, no index page exists), page. */
export function detailBreadcrumb(
  family: string,
  page: DetailPageContent,
): { label: string; href?: string }[] {
  return [{ label: "Home", href: "/" }, { label: family }, { label: page.breadcrumbLabel }];
}

/**
 * Href of a cross-link to another detail page by route id: the real route once it
 * ships, "#" until then (FR-012). An unknown id fails the build.
 */
export function hrefForRouteId(routes: readonly SiteRoute[], id: string): string {
  const route = routes.find((candidate) => candidate.id === id);
  if (route === undefined) {
    throw new DetailContentError(`No route with id "${id}"`);
  }
  return hrefFor(route);
}

/** Heading id for a section, unique on the page. */
export function sectionHeadingId(section: DetailSection): string {
  return `section-${section.id}`;
}

/**
 * The "Questions we get asked" section every detail page ends with before the
 * closing CTA. Only the tone and eyebrow vary between captures.
 */
export function faqSection(
  tone: DetailSectionTone,
  eyebrow: string,
  items: readonly (readonly [question: string, answer: string])[],
): DetailSection {
  return {
    id: "faq",
    tone,
    heading: { eyebrow, title: "Questions we get asked" },
    blocks: [{ kind: "faq", items: items.map(([question, answer]) => ({ question, answer })) }],
  };
}

/** Two-digit FAQ index as captured ("01"). */
export function faqIndex(position: number): string {
  return String(position + 1).padStart(2, "0");
}
