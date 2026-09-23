---
artifact: review-feature-core-pages
phase: 4
status: in-review
version: 1
updated: 2026-09-22
owner: code-reviewer
depends_on:
  - .lonewolf/stack-profile.md
  - .lonewolf/amendments.md
  - docs/04-development/implementation-plan.md
  - docs/02-requirements/functional-requirements.md
  - docs/03-design/ui-specification.md
  - docs/03-design/design-system.md
  - docs/03-design/paper-snapshot/desktop/home.jsx
  - docs/03-design/paper-snapshot/mobile/home.jsx
  - docs/03-design/paper-snapshot/desktop/about.jsx
  - docs/03-design/paper-snapshot/mobile/about.jsx
  - docs/03-design/paper-snapshot/desktop/careers.jsx
  - docs/03-design/paper-snapshot/mobile/careers.jsx
  - docs/03-design/paper-snapshot/desktop/privacy.jsx
  - docs/03-design/paper-snapshot/mobile/privacy.jsx
---

# Review: feature/core-pages (TASK-004)

**Commit range:** `main..feature/core-pages`: 9c3077b, ef1bf2e, 25ad07a, 7419503 (4 commits, 28 files, +2580).
**Worktree:** `.claude/worktrees/agent-ab04aa4377721cc1f` (feature/core-pages checked out; not modified).
**Requirements:** FR-001, FR-002, FR-003, FR-004, FR-008, FR-012, FR-043, FR-044, FR-045.
**Contract:** TASK-004 names no operation. The diff adds no endpoint and touches no API code, so contract adherence does not apply.

## Gate results (run by the reviewer, in profile order)

| # | Command | Result |
|---|---|---|
| 13 | `bun install --frozen-lockfile` | exit 0, no changes |
| 1 | `bunx astro sync` | exit 0 |
| 2 | `bunx oxfmt --check` | exit 0, 55 files clean |
| 3 | `bunx oxlint --deny-warnings` | exit 0 |
| 4 | `bunx astro check` | 158 files, 0 errors, 0 warnings, 0 hints |
| 5 | `bunx vitest run` | 18 files, 342 tests passed |
| 6 | `bunx astro build` | exit 0; prerendered `/`, `/about`, `/careers`, `/privacy`, `/404`; emits `dist/client/` and `dist/server/entry.mjs` |
| 7 | `node server.ts` (PORT=4997) | `/health` 200; `/` 200 text/html; `/?utm_source=brochure` 200 (FR-001 edge case); `/about`, `/careers`, `/privacy` 200; `/about/` 301 |
| 8 | `bun audit --audit-level=high` | No vulnerabilities found |
| 9 | grep `dist/client` for SMTP_PASSWORD / TURNSTILE_SECRET | no match |
| 10 | arbitrary-value grep over `src/` | no match |
| 11 | `style=` grep over `src/**/*.astro` | no match |
| 14 | prohibited config/lockfiles | none (only the KD-001 `.prettierignore`) |

The build logs a Shiki/CSP `[WARN]`. It is pre-existing and not part of this diff.

## Metadata (FR-043 to FR-045), checked in the built HTML

| Route | `<title>` | description length | og:type / og:url | og:image |
|---|---|---|---|---|
| `/` | "Stop Managing Problems. Start Driving Profits with SAP. \| TAMS Infotech" | 157, ends "so you…" at a word boundary | website / `https://tamsinfotech.com/` | absent |
| `/about` | "About TAMS Infotech \| TAMS Infotech" | 73 | website / `/about` | absent |
| `/careers` | "Careers at TAMS \| TAMS Infotech" | 72 | website / `/careers` | absent |
| `/privacy` | "Privacy policy \| TAMS Infotech" | 154, truncated with … | website / `/privacy` | absent |

## Link targets (FR-012, SCR-001), from the built `<main>` of `/`

- Hero: `/contact#contact-form`, `#products-section` (the target id exists once).
- "All services", "All solutions": `#`.
- 4 service tiles: `/services/*`. 7 product tiles: `/products/*`. Explore links: `/products/connected-factory`, `/products/digital-manufacturing-ai`.
- 8 solution tiles and 6 industry tiles: `#`.
- About and Careers: breadcrumb `/` plus the discovery-call CTA only. Privacy `<main>` has no links. This matches the snapshot.

## Copy fidelity

I extracted every text node from all 8 snapshot files and compared it with the built HTML. Home, About, and Privacy (desktop and mobile) have **zero missing strings**. The only strings missing from Careers are "6 roles open", the role rows, and "Apply". FR-004 and the user decision removed exactly those. "No openings available" renders in a `<td colspan="4">` under a sr-only `<caption>Open roles</caption>`.

## Structure and accessibility

Each page has one `<main>`, one `<header>`, and one `<footer>`. There is one `<h1>` per page, equal to the title heading. Each section has an `<h2>`, and every card, step, and track title is an `<h3>`. Sections are labelled with `aria-labelledby`. The data-flow diagram is `aria-hidden`. Its label and `<figcaption>` stay exposed. Glyphs and Icons are `aria-hidden`. The ChallengeTable uses `<th scope="row">` and a sr-only caption. The Privacy tables are `<ul>` / `<dl>`: the visual header is `aria-hidden`, and the `<dt>` labels are sr-only on desktop.

## Gate-blind `.astro` checks (performed by hand on all 20 changed .astro files)

I grepped all 20 files for: hex colours, `px` literals, `rgb(`, `: any` / `as any`, `debugger`, `console.`, `<img>` / `<Image>` without alt, `target=`, tab characters, and odd indentation outside JSDoc. The only hits were `px` values inside explanatory comments. There are no `set:html`, `is:inline`, or `<style>` blocks. Frontmatter logic is limited to imports, prop destructuring, and class constants. Data shaping lives in `src/lib/*.ts`. `package.json` and `bun.lock` are untouched. No shared file (`global.css`, layouts, root `src/components/*`, `site-routes.ts`, `page-meta.ts`) is modified. Commit messages are conventional and have no AI trailers.

## Findings

### [medium] Mobile Home layouts deviate from the mobile snapshot without a token or a11y reason

**File:** src/components/home/HomeHero.astro:71; src/components/home/ProcessRail.astro:18; src/components/home/ConnectedManufacturing.astro:33, 91-99
**Requirement:** FR-001 ("matches the Home screen"), ui-specification SCR-001, mobile/home.jsx
**Problem:** The code departs from the snapshot in three places:
(a) The mobile stat rail uses `gap-5` with no indentation. The snapshot (mobile/home.jsx:72-117) stacks the stats with no gap: stat 1 has `pr-8`, stats 2-4 have `px-8`, stat 5 has `pl-8`.
(b) The mobile process rail uses `gap-6` between steps. The snapshot stacks them with no gap in an `items-start` column (mobile/home.jsx `flex items-start flex-col`), so each hairline spans only its step's content width.
(c) On mobile, the data-flow arrow cells are `h-8`, centred, and rotated 90°. The snapshot has `w-8`, 16 px tall, start-aligned, right-pointing arrows (mobile/home.jsx:505-547).
The snapshot's mobile layouts look like mechanical conversions of the desktop rows, and the implementer's versions arguably read better. Neither reason is a token constraint or an accessibility requirement, and the user owns the design.
**Consequence:** Mobile Home does not reproduce the approved mobile screen. A reviewer comparing against Paper sees different rhythm and arrow orientation.
**Fix:** Build the snapshot layout, or have the orchestrator record the user's acceptance of these three deviations (for example as a KD entry).

### [low] Challenge-table arrows render at 2 px stroke; the snapshot uses 1.6

**File:** src/components/home/ChallengeTable.astro:43
**Requirement:** FR-001; desktop/home.jsx:188 (`strokeWidth="1.6"`)
**Problem:** The shared `Icon name="arrow-right"` uses the 2 px stroke from the pill and button arrows. The five table arrows in the snapshot are 1.6 px.
**Consequence:** The five 24 px arrows look slightly heavier than designed. There is no functional effect.
**Fix:** Use a 1.6 px glyph (for example, add an arrow entry to `feature-glyphs.ts`), or record the deviation.

### [low] Mobile hero primary CTA keeps desktop padding (px-8; the snapshot has px-5)

**File:** src/components/home/HomeHero.astro:56
**Requirement:** FR-001; mobile/home.jsx:56 (`h-[56px] w-[100%] justify-center px-5`)
**Problem:** The shared Button `xl` size applies `px-8` at every width. The mobile snapshot uses `px-5`.
**Consequence:** At 390 px, "Accelerate Your Digital Transformation" plus the arrow has about 24 px less room and may wrap to two lines inside the 56 px pill. I could not measure this without a browser.
**Fix:** Verify at 390 px. If the label wraps, pass a mobile padding override.

### [low] Careers column widths apply to the padded cell, not the content box

**File:** src/lib/careers-content.ts:48-53
**Requirement:** FR-003/FR-004; desktop/careers.jsx (`w-[120px]`, `w-[150px]`, `w-[170px]`, `gap-8`, `px-8`)
**Problem:** `xl:w-30/w-37.5/w-42.5` sit on `<th>` elements that also carry `px-8`. The snapshot's widths are content widths separated by a 32 px gap. On mobile, the shared DataTable scrolls horizontally instead of stacking. The snapshot's mobile header is a broken `flex-col h-12`, so scrolling is a reasonable call there.
**Consequence:** The column label x-positions drift by a few pixels from the design. Only the header row is visible, so the effect is cosmetic.
**Fix:** Optional. Account for padding in the widths.

### [low] Cross-page components live under a single page's folder

**File:** src/components/home/HeadingRow.astro (used by about, careers, privacy); src/components/about/HighlightCallout.astro (used by privacy); src/components/about/SplitIntro.astro (used by careers)
**Requirement:** implementation-plan "Ownership rules" (page-specific components under `src/components/<page-or-family>/`)
**Problem:** HeadingRow is used by 4 pages but lives in `home/`. TASK-004 could not put it at the shared root, which TASK-003 owns, so the placement is forced. The folder name is still misleading.
**Consequence:** A future task editing `home/HeadingRow.astro` for Home may not realize it changes About, Careers, and Privacy.
**Fix:** Move these into a TASK-004-owned family folder (for example `src/components/content/`), or promote them in a TASK-003 follow-up.

## Implementer judgment calls, evaluated

| Call | Verdict |
|---|---|
| Home service cards link to `/services/*` | Acceptable. SCR-001 item 4 does not mention tile links. Every sibling tile section links to its detail route, the four service routes are `ships: true` (TASK-006), and FR-012 is satisfied. Not scope creep of substance. |
| Products CTA card → `#products-section` | Acceptable. It reuses the SCR-001 item 2 target for the identical label. No `/products` index exists (FR-007 edge case). |
| Mobile stat rail / process rail gaps | Deviation → medium finding above. |
| Mobile data-flow arrows rotated | Deviation → medium finding above. |
| 2 px icon stroke vs 1.6 | Deviation on the challenge arrows → low finding. The other 2 px arrows (pills, CTA, Explore links, flow arrows) match the snapshot's `strokeWidth="2"`. |
| Shared Hero clamps (title 1000 vs 900, intro 760 vs 680) on About/Careers | Acceptable, and outside the diff (the shared Hero is TASK-003's). "About TAMS Infotech" and "Careers at TAMS" at 72 px, and both intros at 18 px, fit on one line under either clamp, so nothing renders differently. |
| Privacy markers padding-sized (`py-1.5` + `leading-3` = 24 px) | Acceptable. Identical to `h-6` on one line, and lets long markers wrap on mobile instead of overflowing. |
| Mobile Careers table horizontal scroll | Acceptable. The snapshot's mobile table header is a broken flex-col. The shared DataTable region is focusable and labelled. |
| Page-local FeatureCard / ChallengeTable / OutlinePill | Acceptable. I verified each deviation from the shared component: Card fixes 19 px title and 14 px body, while the snapshot uses 20/19/22 px titles and 15 px body. Button `outline` is `border-border-strong bg-surface`, while the snapshot uses a `slate-900` hairline with no fill. DataTable has no coloured second header and no arrow gutter. FeatureCard has 5 variants and 45 call sites, so the Rule of Three is satisfied. |
| bun.lock @types/node spec mismatch | Out of scope confirmed. This branch does not touch `package.json` or `bun.lock`, and `bun install --frozen-lockfile` exits 0. |

## Test adequacy

`tests/unit/core-pages-content.test.ts` covers:
- FR-004: empty role list, exact copy, four columns, no Apply.
- FR-012: shipped versus `#` hrefs, and fail-fast on an unknown route id.
- Stat accent and row counts.
- The privacy markers.
- FR-043/044 metadata.

The tests assert content data, not rendered markup. I closed that gap by checking the built HTML myself (sections above). That is adequate for static pages until the Phase 5 E2E tests.

## Not verified

- Pixel rendering. No browser was used, so the widths and wrapping in the low findings are inferred from the class names.
- Colour contrast. The user accepted the contrast limitation.
- The KD-004 header. It is outside the diff.

## Verdict

Counts: critical 0, high 0, medium 1, low 4.

APPROVED
