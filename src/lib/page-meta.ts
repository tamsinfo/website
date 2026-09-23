/**
 * C-21 Page metadata (TASK-003). FR-043 title, FR-044 description, FR-045 Open Graph.
 * BaseLayout calls `buildPageMeta`; pages pass their H1 and hero paragraph.
 */

export const SITE_NAME = "TAMS Infotech";
export const SITE_ORIGIN = "https://tamsinfotech.com";
export const DESCRIPTION_MAX_LENGTH = 160;
const ELLIPSIS = "…";

export interface PageMetaInput {
  /** The page's H1 text, verbatim from its screen. */
  readonly heading: string;
  /** The hero introduction paragraph, or the first body paragraph (FR-044 edge case). */
  readonly description: string;
  /** Route path such as "/about". Omit on the 404 page, which has no og:url (FR-045). */
  readonly route?: string;
}

export interface PageMeta {
  readonly title: string;
  readonly description: string;
  readonly ogTitle: string;
  readonly ogDescription: string;
  readonly ogType: "website";
  readonly ogUrl?: string;
}

/** FR-043: "<H1 text> | TAMS Infotech". */
export function buildTitle(heading: string): string {
  return `${collapseWhitespace(heading)} | ${SITE_NAME}`;
}

/**
 * FR-044: at most `max` characters including the ellipsis. A shortened text ends at a
 * word boundary followed by "…". Text within the limit is returned unchanged
 * (after whitespace is collapsed).
 */
export function truncateDescription(text: string, max = DESCRIPTION_MAX_LENGTH): string {
  const clean = collapseWhitespace(text);
  if (clean.length <= max) return clean;

  const budget = max - ELLIPSIS.length;
  // A cut is at a word boundary when the character after it is a space.
  const endsOnBoundary = clean.charAt(budget) === " ";
  const lastSpace = clean.lastIndexOf(" ", budget);
  let cut: string;
  if (endsOnBoundary) {
    cut = clean.slice(0, budget);
  } else if (lastSpace > 0) {
    cut = clean.slice(0, lastSpace);
  } else {
    // One word longer than the limit: no boundary exists, so cut hard.
    cut = clean.slice(0, budget);
  }
  // Do not leave dangling punctuation or dashes before the ellipsis.
  cut = cut.replace(/[\s,;:.–—-]+$/u, "");
  return `${cut}${ELLIPSIS}`;
}

/** FR-045: absolute URL for og:url. */
export function canonicalUrl(route: string): string {
  const path = route.startsWith("/") ? route : `/${route}`;
  // trailingSlash is "never" (ADR-003), so only the root keeps its slash.
  const trimmed = path.length > 1 ? path.replace(/\/+$/, "") : path;
  return `${SITE_ORIGIN}${trimmed}`;
}

export function buildPageMeta(input: PageMetaInput): PageMeta {
  const title = buildTitle(input.heading);
  const description = truncateDescription(input.description);
  const base = {
    title,
    description,
    ogTitle: title,
    ogDescription: description,
    ogType: "website" as const,
  };
  return input.route === undefined ? base : { ...base, ogUrl: canonicalUrl(input.route) };
}

function collapseWhitespace(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}
