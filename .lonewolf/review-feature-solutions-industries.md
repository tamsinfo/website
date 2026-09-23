---
artifact: review-feature-solutions-industries
phase: 4
status: in-review
version: 2
updated: 2026-09-23
owner: code-reviewer
depends_on:
  - .lonewolf/stack-profile.md
  - docs/03-design/design-system.md
  - docs/03-design/ui-specification.md
  - docs/04-development/implementation-plan.md
  - docs/02-requirements/functional-requirements.md
  - docs/03-design/paper-snapshot/MANIFEST.md
---

# Review: feature/solutions-industries (TASK-007)

**Range:** main...feature/solutions-industries (ea808c9..84cf12f, 5 commits; round 2 adds 84cf12f)
**Requirements:** FR-046, FR-047, FR-012 (link flip), FR-043 to FR-045 (metadata)
**Verdict:** APPROVED

## Scope checked

- Files changed: `src/lib/detail-content/{solutions,industries}.ts` (new), `src/pages/{solutions,industries}/[slug].astro` (new), `src/lib/site-routes.ts`, three unit test files.
- Contract: no API operation touched; api-contract.yaml not affected.
- Ownership: `src/lib/site-routes.ts` diff is only the 14 `ships: false -> true` flips plus two doc-comment updates ("Unshipped until" -> "Shipped by"). No change to `src/components/**`, `src/layouts/**`, `src/styles/**`, `src/lib/detail-page.ts`, `src/lib/page-meta.ts`, `package.json`, or `bun.lock`. TASK-006 template untouched.
- Routes (built server, port 4972): all 8 Solutions and 6 Industries routes 200; `/solutions`, `/industries`, `/solutions/nope`, `/industries/nope` 404; `/solutions/` and `/industries/` 301 (ADR-003 trailing-slash redirect, then 404).
- Links: rendered `/`, `/solutions/sap-btp`, `/industries/mill-products`, `/solutions/industry-specific-sap-solutions` carry every Solutions/Industries route in header, footer, Home tiles and in-page cross-links. Remaining `#`: Home "All services", "All solutions" (no index page; FR-012 + FR-046/047 edge cases), and Terms, Cookies, Sitemap. Correct.
- Metadata: title `<H1> | TAMS Infotech`, description = hero paragraph, og:url absolute, verified in rendered HTML and asserted per page in tests.
- Verbatim copy: the test suite checks every built string against its own Desktop AND Mobile snapshot, and every snapshot body line against the built copy (both directions), for all 14 pages. Spot-checked hero eyebrows (`Solution`, `Industry`) and breadcrumbs in `desktop/solutions-sap-btp.jsx` and `mobile/industries-pharmaceuticals.jsx`.
- Tests: the `#` assertions were rewritten to assert real routes; family-index pills still asserted `#`; the `hrefForRouteId` unshipped case now uses a synthetic unshipped route so the `#` path stays covered.
- Commits: conventional format, `Refs: TASK-007`, no AI attribution trailers.

## Gates (run by reviewer in the worktree)

| Gate | Result |
|---|---|
| bun install --frozen-lockfile | exit 0, no changes |
| bunx astro sync | exit 0 |
| bunx oxfmt --check | exit 0, 69 files formatted |
| bunx oxlint --deny-warnings | exit 0 |
| bunx astro check | 0 errors, 0 warnings, 0 hints (197 files) |
| bunx vitest run | 21 files, 647 tests passed |
| bunx astro build | exit 0; dist/client and dist/server/entry.mjs present; 14 new pages prerendered |
| server start + /health + / | `PORT=4972 node server.ts`: /health 200, / 200 |
| bun audit --audit-level=high | no vulnerabilities |
| secret grep dist/client | no SMTP_PASSWORD / TURNSTILE_SECRET references |
| arbitrary-value grep (src/) | no matches |
| style= grep (.astro) | no matches |

## Gate-blind files checked by hand

`src/pages/solutions/[slug].astro`, `src/pages/industries/[slug].astro`: two-space indentation consistent, frontmatter only wiring (logic in `.ts`), `interface Props` declared, no inline `style=`, no raw style values, no `set:html`, markup is a single `<DetailPage {entry} />`. No defects.

## Findings

### [low] SAP BTP attribute-table label column rendered at 280px, captured at 300px, not reported

**File:** src/lib/detail-content/solutions.ts:256
**Requirement:** FR-046 ("matching its screen"), SCR-020
**Problem:** The comment records the captured label column is 300px and the template's widest option (`labelWidth: "lg"`) is 280px. Unlike the pill-link (line 537) and intro-placement / 2-card row (lines 606, 630) deviations, this one is not marked as reported BLOCKED and is absent from amendments.md.
**Consequence:** A 20px Desktop fidelity deviation on SCR-020 ships unrecorded; the Phase 5 design-match check will find it with no decision behind it.
**Fix:** Report it with the open SCR-022/SCR-023 questions so the user can accept it as a known deviation or schedule a TASK-006 template option. No template change on this branch.

## Counts

critical 0, high 0, medium 0, low 1

Not failed on (per orchestrator): SCR-022 pill links rendered as text links; SCR-023 intro placement and 2-card row. Both are pending user decisions.

APPROVED

## Round 2: delta re-review of 84cf12f

**Commit:** 84cf12f fix(solutions): remove the four KD-010 design-note captions (conventional format, `Refs: TASK-007`, no AI attribution trailer).
**Files:** `src/lib/detail-content/solutions.ts`, `tests/unit/detail-pages.test.ts` only. Template, site-routes, deps untouched.

- KD-010: the four caption blocks (Business AI x2, Integration Suite, Automation and Workflow) are removed. Each string is added to `INTENTIONAL_EXCLUSIONS` so the check that no snapshot body text is missing still passes. A new `KD-010 caption removal` test confirms each caption's opening words exist in both desktop and mobile snapshots, are absent from the page copy, and that no caption block remains on those pages. The rendered HTML from the built server contains none of the four captions (0 matches on each page).
- KD-008, KD-009, KD-011: comment-only changes naming the recorded deviations. KD-011 now also covers the second BTP attribute table (line 292), which had the same 300px/280px gap. Round-1 low finding (solutions.ts:256) is **resolved**: it is recorded as KD-011 in amendments.md, awaiting user review at G4.
- Regressions: none. The build no longer ships `caption` text on those pages; no other content changed.

### Round-2 gates (reviewer, worktree)

| Gate | Result |
|---|---|
| bun install --frozen-lockfile | exit 0 |
| bunx astro sync | exit 0 |
| bunx oxfmt --check | exit 0 |
| bunx oxlint --deny-warnings | exit 0 |
| bunx astro check | 0 errors, 0 warnings, 0 hints |
| bunx vitest run | 651 passed (was 647; +4 KD-010 tests) |
| bunx astro build | exit 0 |
| server (`PORT=4972 node server.ts`, own PID killed) | /health 200, / 200, /solutions 404, /industries 404, affected pages 200 |
| bun audit --audit-level=high | no vulnerabilities |
| arbitrary-value grep, style= grep | 0 matches each |

No `.astro` file changed in this commit.

**Round-2 counts:** critical 0, high 0, medium 0, low 0 open (1 resolved).

APPROVED
