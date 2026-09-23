---
artifact: review-feature-site-shell
phase: 4
status: in-review
version: 1
updated: 2026-09-22
owner: code-reviewer
depends_on:
  - .lonewolf/stack-profile.md
  - docs/03-design/api-contract.yaml
  - docs/03-design/system-architecture.md
  - docs/03-design/design-system.md
  - docs/03-design/ui-specification.md
  - docs/03-design/paper-snapshot/tokens.css
  - docs/03-design/paper-snapshot/desktop/home.jsx
  - docs/03-design/paper-snapshot/desktop/not-found.jsx
  - docs/02-requirements/functional-requirements.md
  - docs/02-requirements/non-functional-requirements.md
  - docs/04-development/implementation-plan.md
---

# Review: feature/site-shell (TASK-003)

**Commit range:** `main..feature/site-shell`: 8a61014, df216c9, bfc8f82, 67575cb.
I reviewed the branch in worktree `.claude/worktrees/agent-a9f6ad8dd313db8f2` and did not modify it.

## Gates run (in stack profile order, in the worktree)

| Gate | Result |
|---|---|
| `bun install --frozen-lockfile` | exit 0, no changes |
| `bunx astro sync` | exit 0 |
| `bunx oxfmt --check` | exit 0 |
| `bunx oxlint --deny-warnings` | exit 0 |
| `bunx astro check` | 0 errors, 0 warnings, 0 hints |
| `bunx vitest run` | 7 files, 174 tests passed |
| `bunx astro build` | exit 0; prerendered /404.html; `dist/_headers.json` shows `frame-src 'none'` in the CSP |
| `bun audit --audit-level=high` | no vulnerabilities |
| Check 10: arbitrary-value grep | no matches |
| Check 11: `style=` grep in .astro | no matches |

**Not run:** check 7 (starting the built server and hitting `/health`). The build output
and the CSP headers file were inspected instead. I also ran no browser, keyboard, or no-JS
walkthroughs. I judged the menu behaviour by reading the code and the compiled CSS.

## Findings

### [high] Off-scale pixel values bypass FR-011 through Tailwind's default `--spacing` multiplier

**File:** src/styles/global.css:19-21 (the `--spacing` multiplier kept on purpose), used in
src/components/SiteHeader.astro:35,36,50,56; DesktopNav.astro:24,56,67; MobileNav.astro:26;
SiteFooter.astro:30,34,47,58; Card.astro:66,76; HexWatermark.astro:16; src/pages/404.astro:63,73,77,111;
plus other shared components (for example `h-13`, `max-w-190`, `max-w-250`, `max-w-140`)
**Requirement:** FR-011 (and its edge case: "MUST report `BLOCKED:` and MUST NOT ... hardcode the value"); design-system.md §2 (line heights MUST use `--leading-body/heading/display`), §3 (the spacing scale is the 15 named steps), §4A last paragraph (any other value is a `BLOCKED:` finding); stack profile §5 ("Agents MUST NOT invent ... spacing")
**Problem:** The `@theme` block does not reset `--spacing`, so Tailwind's default
`--spacing: .25rem` stays in place. That variable is not a Meridian token. `tokens.css`
has no `--spacing:` entry. The components then use numeric steps outside the §3 scale.
The compiled CSS confirms these resolve to `calc(var(--spacing) * N)`, which makes them
hardcoded pixel values:
`leading-3.5/4/4.5/5/5.5/6/7.5` (14 to 30px line heights instead of the `--leading-*` tokens),
`size-1.25/1.5/3.25/3.5/3.75/4.5/5.5/6.5/95/155`, `h-7.5/h-13/h-14`, `w-30`, `xl:w-85` (340px),
`max-w-140/160/190/215/225/250` (560 to 1000px, where the `--container-*` tokens exist for this purpose),
`top-13.75`, `top-22.5`, `right-35/38.5/45`. These are transcriptions of the snapshot's
arbitrary values (`leading-[18px]`, `w-[340px]`, and so on). They are faithful to
Paper, but they are not tokens. Check 10 cannot see them.
**Consequence:** FR-011 is not met, and check 10 of the Definition of Done passes only because the syntax changed. TASK-004 to TASK-007 copy these shared components and patterns, so the bypass will spread into every page. The "no invented values" guarantee will then be unverifiable by grep.
**Fix:** The implementer cannot resolve this alone. Report `BLOCKED:` with the full list of off-scale values and their snapshot sources, and let the user choose one option per value class:
(a) add them to design-system §4A as derived tokens through `/lonewolf:amend`;
(b) map them to existing tokens, meaning `--leading-*` for line heights, `--container-*` for max widths, and named spacing steps; or
(c) amend FR-011 and §3 to accept the 4px multiplier explicitly as a Meridian binding.
Then reset `--spacing-*`/`--spacing` accordingly, or record the accepted binding in
the global.css comment.

### [high] A click-opened desktop menu stays open after the pointer leaves (Chrome, Edge)

**File:** src/lib/nav-menu-client.ts:67-71
**Requirement:** FR-013, edge case: "Pointer leaves the item and its open menu: the menu MUST close."
**Problem:** `mouseleave` closes an open (`data-open`) menu only when `doc.activeElement`
is outside the item. Chromium browsers focus a `<button>` on mouse click. After a
pointer user clicks "Services", the focused trigger is inside the item, so moving
the pointer away leaves the panel open. It closes only on an outside click. No test covers
`nav-menu-client.ts`.
**Consequence:** The most common desktop browser fails a stated FR edge case. The open panel
(`z-50`, white) stays over page content after the pointer has left it.
**Fix:** Tell keyboard opening apart from pointer opening. One option: record whether the open came from
a pointer click (`event.detail > 0`, or `pointerType` from a `pointerdown`) and always close on
`mouseleave` in that case. Another: close on `mouseleave` unless `:focus-visible` matches inside the item.
Add a Vitest (happy-dom/jsdom is not in deps, so extract the decision into a pure function)
or record the manual check.

### [medium] Desktop header gutter and gaps differ from the design between 1280 and 1439 px

**File:** src/components/SiteHeader.astro:31-33,40; DesktopNav.astro:28
**Requirement:** design-system.md §5 (">= 1280px ... gutter `px-20`"); ui-specification §1 / snapshot `desktop/home.jsx:5-6,15,62`
(`px-20 gap-10`, nav `gap-6`, right cluster `gap-5`)
**Problem:** At `xl` the header uses `px-10`, `gap-8`, nav `gap-5`, and right cluster `gap-4`. It switches
to the snapshot values only at `2xl`. The deviation is probably necessary: the captured row is about
1,300px wide and does not fit 1,280 - 160px. But no spec defines it, and no comment, commit message, or
`BLOCKED:` records it.
**Consequence:** An undocumented layout decision. It is an assumption that nobody has confirmed, on the one component every page shares.
**Fix:** Record it as an assumption in the component comment and surface it to the orchestrator for user confirmation, or raise `BLOCKED:`.

### [low] 404 hex watermark loses its desktop right offset

**File:** src/pages/404.astro:63
**Requirement:** SCR-006 fidelity to `desktop/not-found.jsx`
**Problem:** The override class replaces HexWatermark's default and omits `xl:-right-45`, so desktop keeps `-right-35`.
**Consequence:** The decorative watermark sits 40px off its captured position on desktop.
**Fix:** Include the desktop right offset in the override, or rely on the default.

### [low] Token hex values are lowercased, not byte-verbatim

**File:** src/styles/global.css:33-100
**Problem:** Oxfmt lowercased the hex literals, for example `#FFFFFF` became `#ffffff`. Every name and value otherwise matches
`tokens.css`. I checked every line. The font-family "Implementation binding" block redeclares `--font-*` with
the Fontsource face names plus generic fallbacks. Per ADR-008 that is a binding, not a new design value, and I accept it.
**Consequence:** None at runtime. A byte-level token-hash check (RISK-002) would report a false drift.
**Fix:** None required. Note it for anyone who implements the hash check.

## Checks that passed

- **Tokens:** all 150+ `tokens.css` declarations are present in `@theme` with identical names and values (case aside). The §4A derived block is present and exact. The default namespaces are reset.
- **Arbitrary values and `style=`:** none.
- **ADR-012 without JS:** the compiled CSS contains `[data-menu]:not([data-js]):hover` and `:focus-within` rules that show the panel. Mobile uses native `<details>`, with nested `<details>` per family. Every link is a plain `<a>`.
- **C-24 keyboard handling:** Enter or Space toggles through the button click. Escape closes, suppresses hover, and returns focus to the trigger. Focus leaving the item closes it. Only one menu is open at a time. Outside click closes. Mobile Escape closes the menu and refocuses the summary. The page restored from bfcache resets. Apart from the high finding above, this matches FR-013 to FR-015.
- **Landmarks and ARIA:** skip link to `main#main`. The two "Primary" navs are never displayed at the same time. Footer column navs are labelled by their h2. The legal nav is labelled. Decorative SVGs and the wordmark band carry `aria-hidden`. The 404 numeral is `aria-hidden` and outside the h1. `aria-current` is never set on `#` links.
- **Breakpoint:** the `hidden xl:block` / `xl:hidden` switch is at `--breakpoint-xl` (ADR-013).
- **site-routes:** `hrefFor` returns `#` for every `ships: false` route. Solutions and Industries are `ships: false`, and the family index placeholders are too. Tests cover all of this.
- **page-meta:** at most 160 characters including `…`, cut at a word boundary. The on-space case keeps the 159-character budget. Tests cover the boundaries. The 404 page has no og:url and no og:image.
- **404:** copy, CTA hrefs (`/`, `/contact#contact-form`), six cards (four `#`), and section order match SCR-006 and the snapshot text.
- **BaseLayout:** `Astro.csp?.insertDirective("frame-src 'none'")` appears in the built CSP. Latin woff2 preloads for Archivo and Inter resolve to the emitted hashed files (ADR-008).
- **No new dependencies:** `package.json` and `bun.lock` are untouched. No prohibited config files.
- **Commits:** Conventional format, `Refs: TASK-003`, no AI attribution trailers.
- **Gate-blind `.astro` files, checked by hand:** all 19 changed `.astro` files. I grepped for arbitrary values, `style=`, `set:html`, `any`, and `console`, and found none. `interface Props` is present where props exist. Each component has its props catalogue comment. Indentation is consistent. The raw-value findings are reported above.

## Verdict

CHANGES REQUESTED — 2 blocking findings
