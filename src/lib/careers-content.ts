/**
 * SCR-003 Careers copy (FR-003, FR-004), transcribed from
 * docs/03-design/paper-snapshot/desktop/careers.jsx and mobile/careers.jsx.
 *
 * FR-004 overrides the snapshot's populated "Open roles" table (user decision,
 * ui-specification.md SCR-003 "Resolved"): the table keeps its column shell, lists
 * no role, shows no "roles open" badge, and offers no Apply control.
 */

export const CAREERS_HERO = {
  eyebrow: "Careers",
  title: "Careers at TAMS",
  intro: "SAP consultants who want to work on manufacturing problems, not tickets.",
} as const;

export const WORK_SECTION = {
  eyebrow: "The work",
  title: "What it is like here",
  body: "Twenty-five consultants means you are not a resource number. You will be in the plant, in the workshop, and on the call when a decision gets made. You will also be expected to have an opinion.",
} as const;

export const DEVELOPMENT_SECTION = {
  eyebrow: "Development",
  title: "How we develop consultants",
  aside:
    "We run structured development plans across six module tracks — ABAP, FICO, PP/QM/PM, SD, MM and Basis — with defined milestones rather than a vague promise of training.",
} as const;

export interface ModuleTrack {
  readonly label: string;
  readonly module: string;
}

export const MODULE_TRACKS: readonly ModuleTrack[] = [
  { label: "TRACK 01", module: "ABAP" },
  { label: "TRACK 02", module: "FICO" },
  { label: "TRACK 03", module: "PP/QM/PM" },
  { label: "TRACK 04", module: "SD" },
  { label: "TRACK 05", module: "MM" },
  { label: "TRACK 06", module: "Basis" },
];

export const OPEN_ROLES_SECTION = {
  eyebrow: "Vacancies",
  title: "Open roles",
} as const;

/** Column shell from the snapshot header row, with the widths it captures. */
export const OPEN_ROLES_COLUMNS: readonly { readonly label: string; readonly class?: string }[] = [
  { label: "Role" },
  { label: "Module", class: "xl:w-30" },
  { label: "Location", class: "xl:w-37.5" },
  { label: "Experience", class: "xl:w-42.5" },
];

/** User-supplied copy for the FR-004 empty state. */
export const OPEN_ROLES_EMPTY_MESSAGE = "No openings available";

/** V1 accepts no applications (FR-004). Kept as data so the empty state is testable. */
export const OPEN_ROLES: readonly never[] = [];
