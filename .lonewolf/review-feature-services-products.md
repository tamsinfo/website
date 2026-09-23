---
artifact: review-feature-services-products
phase: 4
status: in-review
version: 1
updated: 2026-09-22
owner: code-reviewer
depends_on:
  - .lonewolf/stack-profile.md
  - .lonewolf/amendments.md
  - docs/03-design/api-contract.yaml
  - docs/03-design/design-system.md
  - docs/03-design/ui-specification.md
  - docs/03-design/paper-snapshot/desktop/services-s4hana-cloud-implementation.jsx
  - docs/03-design/paper-snapshot/desktop/services-s4hana-managed-services.jsx
  - docs/03-design/paper-snapshot/desktop/services-custom-application-build.jsx
  - docs/03-design/paper-snapshot/desktop/services-license-procurement.jsx
  - docs/03-design/paper-snapshot/desktop/products-gate-entry.jsx
  - docs/03-design/paper-snapshot/desktop/products-exim.jsx
  - docs/03-design/paper-snapshot/desktop/products-digisign.jsx
  - docs/03-design/paper-snapshot/desktop/products-production-process.jsx
  - docs/03-design/paper-snapshot/desktop/products-vendor-portal.jsx
  - docs/03-design/paper-snapshot/desktop/products-connected-factory.jsx
  - docs/03-design/paper-snapshot/desktop/products-digital-manufacturing-ai.jsx
  - docs/03-design/paper-snapshot/mobile/services-s4hana-cloud-implementation.jsx
  - docs/03-design/paper-snapshot/mobile/services-s4hana-managed-services.jsx
  - docs/03-design/paper-snapshot/mobile/services-custom-application-build.jsx
  - docs/03-design/paper-snapshot/mobile/services-license-procurement.jsx
  - docs/03-design/paper-snapshot/mobile/products-gate-entry.jsx
  - docs/03-design/paper-snapshot/mobile/products-exim.jsx
  - docs/03-design/paper-snapshot/mobile/products-digisign.jsx
  - docs/03-design/paper-snapshot/mobile/products-production-process.jsx
  - docs/03-design/paper-snapshot/mobile/products-vendor-portal.jsx
  - docs/03-design/paper-snapshot/mobile/products-connected-factory.jsx
  - docs/03-design/paper-snapshot/mobile/products-digital-manufacturing-ai.jsx
  - docs/02-requirements/functional-requirements.md
  - docs/04-development/implementation-plan.md
---

# Review: feature/services-products (TASK-006)

**Commit range:** `main..feature/services-products`. The merge base is 64ea0cb. The range has four commits: 82bf901, ace1b3b, 4237bd0, and 987876e.
I reviewed the branch in worktree `.claude/worktrees/agent-ac33268ec6e8ff46c` and did not change it. The build created only `dist/` and `.astro/`, which git ignores. The working tree stayed clean.

**Merge check:** `git merge-tree --write-tree main feature/services-products` exited 0 with tree 2f9f6de. It reported no conflicts, so the branch merges cleanly on top of the contact-page merge.

## Gates run (stack profile order, in the worktree)

| Gate | Result |
|---|---|
| `bunx astro sync` | exit 0 |
| `bunx oxfmt --check` | exit 0. All 52 matched files were formatted. |
| `bunx oxlint --deny-warnings` | exit 0 |
| `bunx astro check` | 152 files, with 0 errors, 0 warnings, and 0 hints |
| `bunx vitest run` | 18 files and 410 tests passed |
| `bunx astro build` | exit 0. It prerendered all 11 detail routes and `/404.html`. |
| `bun audit --audit-level=high` | No vulnerabilities found |
| `bun install --frozen-lockfile` | exit 0, with no changes |
| Built server (`PORT=4987 node server.ts`) | `/health` returned 200. All 11 FR-006 and FR-007 routes returned 200. `/services`, `/products`, `/services/unknown`, and `/products/foo` returned 404. `/services/` returned 301, per the trailing-slash rule. `/` returned 404 because this branch predates TASK-004 Home. |
| Section 8 check 10 (arbitrary-value grep) | no matches |
| Section 8 check 11 (`style=` grep in `.astro`) | no matches |
| Section 8 check 14 (prohibited files) | The diff adds none. `package.json`, `bun.lock`, `global.css`, layouts, shared components, `site-routes.ts`, and `page-meta.ts` are unchanged. |

**Not run:** check 9 (secret grep of `dist/client/`). This diff has only prerendered static content and reads no secrets.

## Verification performed by hand

- **Routes (FR-006, FR-007).** `getStaticPaths` derives routes from `SERVICE_ROUTES` and `PRODUCT_ROUTES` through `detailRoutes()`. No index page exists. Unknown slugs return 404 (verified on the built server).
- **Metadata (FR-043 to FR-045).** I checked five built pages: cloud implementation, license procurement, EXIM, vendor portal, and digital manufacturing AI. Each has the correct `<title>` (`<H1> | TAMS Infotech`) and a description equal to the hero paragraph. Each also has `og:title`, `og:description`, `og:type=website`, and `og:url=https://tamsinfotech.com<route>`. No page has `og:image`.
- **Links (FR-012).** Custom Application Build renders "See what we have built" as `href="#"`, through `PLACEHOLDER_ROUTES.allProducts`. The only other body links go to shipped Products routes, via `hrefForRouteId`. No body link points to Solutions or Industries. The shared header and footer keep Solutions and Industries at `#`.
- **Copy fidelity (all 11 screens, desktop and mobile).** I extracted every text node from each snapshot and searched the rendered `<main>`. All 22 captures had zero missing nodes. The only exception is the two known mobile Vendor Portal "In build" banner strings (BLOCKED with the user). The pages add no body text beyond the snapshots. The only additions are sr-only `<caption>` text on four tables, which is an accessibility addition, not scope creep.
- **Order fidelity.** I ran an ordered-subsequence check of every snapshot text node of 25 characters or more against the rendered `<main>`. No page had a body section out of order on desktop or mobile. The only hits were header-nav duplicates of the page title.
- **Style fidelity (sampled).** Cloud Implementation: rail, callout, and the "Which edition" comparison table match. The table has a 170px label column (`w-42.5`), `py-5 px-8`, a gap of 8 through `pl-8` cells, a `bg-bg-sunk` head, and `limestone-50` stripes. Connected Factory: the stat band matches on desktop (`py-16`, `p-10`, `text-132/none`, `max-w-190`) and on mobile (`py-10`, `p-6`, `text-56/none`). DigiSign mobile: the dark cards match (`p-6`, `gap-4`, `text-18/heading`). Digital Manufacturing AI: the italic `slate-500` note on `border-border-inverse`, the caption rule, and the FAQ row match.
- **Tokens.** Every class used in `src/components/detail/*.astro` and `src/lib/detail-classes.ts` exists in the built CSS. So does every one of `text-white`, `font-regular`, `even:bg-limestone-50`, `text-132`, and the `slate-*` colors, and each resolves to a `@theme` token. Multiplier utilities such as `w-42.5`, `size-1.25`, and `xl:max-w-190` rely on KD-003.
- **Template reuse for TASK-007.** `DetailPage.astro` takes only a `DetailRouteEntry`. `detailRoutes()` works on any `DetailFamily`. A Solutions or Industries page therefore needs only a content module and a route file. `detailRoutes` fails the build on missing content, orphan content, or duplicate section ids. The hero eyebrow and breadcrumb label are per-page data.
- **Logic in `.ts`.** The page model, class maps, route pairing, breadcrumb, and FAQ helpers live in `src/lib/`. The `.astro` files hold markup, props, and wiring only.
- **No `set:html`** exists in the diff. **No new dependencies** are added.

## Gate-blind `.astro` files checked by hand

I read all 17 changed `.astro` files: 15 in `src/components/detail/` and 2 route files. I checked indentation consistency, `style=` attributes, arbitrary values, `interface Props`, `any`, unused bindings, and accessibility. I found none of those defects. Indentation is consistent throughout, every component declares `interface Props`, decorative SVGs carry `aria-hidden` and `focusable="false"`, and every section has `aria-labelledby` pointing at its `<h2>` id. The one headingless stat band correctly carries no `aria-labelledby`. Cards and FAQ questions use `<h3>`. Tables use `<caption>` with `th[scope=col]` and `th[scope=row]`, plus explicit roles to survive display overrides. The only accessibility nit is finding 1.

## Findings

### [low] Visible step numbers inside `<ol>` are announced twice

**File:** src/components/detail/ProcessRail.astro:33, src/components/detail/StepGrid.astro:39, src/components/detail/NumberedDetails.astro:23
**Requirement:** ui-specification.md section 5 accessibility; stack profile section 4 (WCAG 2.1 AA)
**Problem:** Each step renders its number as visible text inside an `<ol>` list item. The list semantics already convey the position. `FaqList.astro` marks its index `aria-hidden="true"`, but these three components do not.
**Consequence:** Screen readers announce "1, 1 Prepare". This is redundant but not a WCAG failure.
**Fix:** Add `aria-hidden="true"` to the number span, as `FaqList` does.

### [low] Verbatim-copy tests check containment, not order or rendering

**File:** tests/unit/detail-pages.test.ts:136, :141, :149
**Requirement:** TASK-006 finish condition (match per screen); ui-specification.md section 5 item 3 ("in DOM order")
**Problem:** The tests check that each data string appears somewhere in the joined snapshot text, and the reverse. They do not check order. They also test the data module rather than the rendered page. A very short string, such as "SAP", passes trivially.
**Consequence:** A reordered section or a block the template drops would pass the suite. I verified order and rendered presence by hand for all 22 captures, and both are correct today. A later edit, for example in TASK-007, would not be caught.
**Fix (follow-up):** Assert that the body lines appear in order within the page copy, for example with an index-advancing search. Optionally, render and assert once through the Astro container API.

### [info] Hero eyebrow is singular ("Service", "Product"), where spec section 5 says the family name

**File:** src/lib/detail-content/services.ts, src/lib/detail-content/products.ts (the `eyebrow` of each page)
**Note:** Every snapshot captures "Service" and "Product". The implementation follows the frozen snapshots, which is correct. Ui-specification section 5 item 2 should be corrected in a later amendment. This is not a code defect.

### Known BLOCKED items (not scored)

- The mobile-only Vendor Portal "In build" banner is omitted. The omission is documented in the test's `MOBILE_ONLY_PENDING` set and is pending the user's decision.
- The implementer built more block kinds (checklist, chips, operations, architecture, FAQ, and others) than the section 5 list names, as captured in the snapshots. This is pending the user's decision.

## Counts

critical 0, high 0, medium 0, low 2, info 1.

## Verdict

APPROVED
