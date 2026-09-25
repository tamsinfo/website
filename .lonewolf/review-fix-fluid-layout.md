---
artifact: review-fix-fluid-layout
phase: 4
status: in-review
version: 1
updated: 2026-09-24
owner: code-reviewer
depends_on:
  - docs/03-design/system-architecture.md
  - docs/03-design/design-system.md
  - docs/04-development/implementation-plan.md
---

# Review: fix/fluid-layout (G4 revision request 2, site-wide fluid layout)

**Commit range:** `main..fix/fluid-layout`, 6 commits, `2d37056..081353d`:
`2d37056` token move, `d208a47` shared container, `befe29b` phone tables, `c9f38c6`
compact Turnstile, `799a976` process steps, `081353d` fixed-width guard.
**Diff:** 23 files, +490 / -141.

Everything was verified in a scratch export (`git archive fix/fluid-layout | tar -x`).
The worktree `agent-accb83f596beb1dd9`, its `dist/`, and port 4984 were not touched. No
server was started.

## Verdict

APPROVED

No critical or high findings. There are three medium findings and four low findings.
The mediums are "fix before merge unless the orchestrator records a reason". Under the
skill's severity model none of them blocks.

## Checks performed

1. **Compiled CSS.** The built `dist/client/_astro/*.css` contains `.w-full{width:100%}`,
   `.max-w-full{max-width:100%}`, and `.size-full{width:100%;height:100%}`.
   `--container-full:1440px` now appears only as a `:root` custom property. I scanned
   every `@theme` token for names that collide with built-in keywords:
   * `--container-prose` (680px) replaces Tailwind's `max-w-prose` (65ch). This is
     deliberate: HeadingRow's default `xl:max-w-prose` expects Meridian's 680px.
   * `--leading-none: 100%` and `--radius-full: 999px` are visually equivalent to the
     defaults.
   * `--spacing-0` is identical to the default.

   No other token changes a built-in utility the code relies on.
2. **Full-bleed bands.** Every band except the desktop header row uses `CONTAINER_CLASS`
   (`mx-auto w-full max-w-narrow xl:max-w-wide`) inside a full-width, gutter-padded
   element. That covers Section, Hero, HomeHero, PrivacyHero, ClosingCta, footer (x3),
   mobile header, MobileNav, 404, about focus band, contact, and the privacy notice. All
   other pages compose `<Section>`. No `innerClass` overrides `max-w`, `mx`, or `w-full`.
   The desktop header row (`SiteHeader.astro:37`) uses the equivalent xl-only literal
   (see LOW-1).
3. **Fixed widths.**
   * At the base breakpoint, no unprefixed width is larger than 280px apart from the four
     allowlisted decorative items: the three `size-95` hex watermarks and the `w-95` grid
     band. All are aria-hidden and clipped by an `overflow-clip` section.
   * Every xl fixed width of 400px or more was checked in context against a 1120px
     container:
     * HomeHero `xl:w-155` is now `min-w-0` and shrinks.
     * contact `xl:w-150` plus gap-20 leaves 440px for the `min-w-0 grow` OfficeDetails.
     * SplitIntro `xl:w-100`, the HeadingRow asides (`xl:w-115` and `xl:w-105`), and the
       watermarks `xl:size-155`/`xl:size-190` all fit or are clipped.
     * The about band `xl:w-320` equals `max-w-wide`, and the section clips it.
4. **Guard tests, with planted regressions in a scratch copy.**
   * `layout-tokens.test.ts` FAILS when `--container-full: 1440px` is put back in `@theme`
     (4 tests fail). It also fails for `--spacing-full` (3 fail) and `--container-screen`
     (1 fails).
   * `fixed-width-guard.test.ts` FAILS on `w-150`, `min-w-100`, `basis-80`,
     `max-xl:w-150`, `w-full size-80`, and a `class:list` ternary containing `w-150`.
   * It PASSES, so it misses the regression, on `w-[600px]`, `min-w-[400px]`, `w-narrow`,
     `w-(--container-wide)`, and `sm:w-200`. See MEDIUM-1 and MEDIUM-2.
5. **Fidelity at 390 and 1440.**
   * At xl the container equals the old `mx-auto w-full max-w-wide`. Buttons are still
     `xl:w-auto`, and the HomeHero and 404 button rows are still rows. At 1440 the HomeHero
     intro's 620px + 80px gap + buttons fits in 1280px, so `min-w-0` does not engage.
   * At 390, `max-w-narrow` (880px) and `sm:w-fit` (640px and up) have no effect. The
     ClosingCta `max-w-140` (560px) is wider than the 350px content box.
   * The ProcessRail `items-start` change matches `paper-snapshot/mobile/home.jsx:755`
     (`flex items-start flex-col`).
   * The about grid band keeps `left-20` from the section edge on Mobile and the content
     edge (80px at 1440) on Desktop.
   * The Home ChallengeTable is a snapshot flex row below xl and a real table at xl.

   The real-browser check at 320 to 2560 px is the orchestrator's.
6. **Accessibility and landmarks.**
   * No landmark was added, removed, or relabelled. MobileNav wraps its content in a
     `<div>` inside the same `<nav aria-label="Primary">`.
   * DataTable keeps `role="region"` and `aria-label`. `tabindex="0"` was removed along
     with the scroll container. That is correct, because a focusable region that does not
     scroll is a stray tab stop.
   * Both tables add explicit `table`, `rowgroup`, `row`, `columnheader`, `rowheader`, and
     `cell` roles to keep their semantics under `display: block/flex`.
   * The about SVG moved `aria-hidden` to its wrapper, which still hides it.
   * The mobile header's source order changed (see LOW-3).
7. **Gates.** All of them pass (see below).

## Findings

### [medium] MEDIUM-1: the fixed-width guard ignores arbitrary values and named container widths

**File:** `tests/unit/fixed-width-guard.test.ts:19` (`const FIXED_WIDTH = /^-?(w|min-w|size|basis)-(\d+(?:\.\d+)?)$/;`)
**Requirement:** NFR-020 (minimum viewport). G4 revision request 2 (guard against fixed widths).
**Problem:** The regex matches only numeric spacing multiples. I planted three tokens at
the base breakpoint, and the test passed each time:
* `w-narrow` (880px, because `--container-*` feeds `w-*` in Tailwind 4)
* `w-(--container-wide)` (1280px)
* `w-[600px]`

`w-wide` in place of `max-w-wide` is a one-token slip of exactly the kind this revision
fixes. Arbitrary values are banned in `.astro` by design-system.md section 0, but no gate
enforces that ban either.
**Consequence:** A future full-width regression through a named container or an arbitrary
value passes CI and reaches a phone.
**Fix:** Also flag, at the base breakpoint:
* `(w|min-w|basis|size)-(prose|narrow|content|wide|screen)`
* any `(w|min-w|basis|size)-[` or `-(` value

Add a named-container case and an arbitrary-value case to the tests.

### [medium] MEDIUM-2: the guard exempts `sm:`, `md:`, and `lg:` widths that can still overflow

**File:** `tests/unit/fixed-width-guard.test.ts:18` (`MIN_WIDTH_VARIANTS = new Set(["sm", "md", "lg", "xl", "2xl"])`)
**Requirement:** NFR-020. G4 revision request 2 ("no overflow").
**Problem:** Any width behind `sm:`, `md:`, or `lg:` is treated as safe. At `sm` (640px)
the content box is 600px, and below xl it is capped at 880px by `max-w-narrow`. My planted
`sm:w-200` (800px) passed. No such token exists in the code today, so this is a coverage
gap, not a live defect.
**Consequence:** Tablet widths (640 to 1279px), a range the new container introduces,
have no guard.
**Fix:** Give each variant its own budget: sm is 600px, md is 728px, lg is 880px, and xl
is 1120px. Flag widths above the budget for their variant.

### [medium] MEDIUM-3: `GUTTER_CLASS` is introduced but used only once, and 11 bands still hand-write the gutters

**File:** `src/lib/ui-classes.ts:43`. Hand-written copies are at:
* `ClosingCta.astro:17`
* `Hero.astro:57`
* `HomeHero.astro:18`
* `PrivacyHero.astro:17` (`px-5 ... xl:p-20`)
* `SiteFooter.astro:29,80,99,106`
* `SiteHeader.astro:52`
* `404.astro:62`
* `about.astro:60`
* `contact.astro:48`
* `privacy.astro:66`

**Requirement:** Core DNA (no duplicated logic). The commit's own claim of "one shared
fluid container" pattern.
**Problem:** The branch adds a single source for the band gutters, then uses it in
Section only.
**Consequence:** A future gutter change edits one place and leaves most bands on the old
value. This is the kind of drift the revision set out to remove.
**Fix:** Use `GUTTER_CLASS` in every full-bleed band, or delete the export and keep the
literals.

### [low] LOW-1: the desktop header row does not use `CONTAINER_CLASS`

**File:** `src/components/SiteHeader.astro:37`
**Requirement:** G4 revision request 2, one shared container.
**Problem:** The row still reads `mx-auto ... w-full max-w-wide`. It is xl-only, so the
behaviour is equivalent.
**Consequence:** It is the one band that a future container change would miss.
**Fix:** Use `CONTAINER_CLASS`.

### [low] LOW-2: Turnstile picks its size once, at render

**File:** `src/lib/turnstile-client.ts:89`
**Requirement:** NFR-020.
**Problem:** `turnstileSizeFor(target.clientWidth)` runs once. Rotating a phone or resizing
the window after render keeps the first size. The wrapper's `max-w-full` limits the damage.
**Consequence:** A form rendered at desktop width and then narrowed below about 340px can
still clip a normal 300px widget. This is an edge case, and `appearance: "interaction-only"`
usually hides the widget.
**Fix:** None required. Optionally, note this in the function's doc comment.

### [low] LOW-3: mobile header source order changed

**File:** `src/components/SiteHeader.astro:66-76`
**Requirement:** Accessibility (reading order).
**Problem:** `flex-row-reverse` keeps the visual order, but in the DOM the menu toggle now
comes before the search icon and the page badge. Tab order is unaffected, because the
summary is the only focusable item. Screen readers now announce the menu control before
the current-page badge.
**Consequence:** A minor change to reading order. The badge, when clipped below 360px, is
still announced, which is harmless because it repeats the page name.
**Fix:** None required. Record it in the component comment.

### [low] LOW-4: allowlist covers `size-95` in `HomeHero.astro` although the drawing there is `size-95` on an inline SVG

**File:** `tests/unit/fixed-width-guard.test.ts:26-31`
**Problem:** The allowlist is keyed by file and token, not by element. Any second `size-95`
element added to HomeHero, 404, HexWatermark, or `w-95` in about would pass silently.
**Consequence:** A small blind spot.
**Fix:** Optional. Add a marker attribute such as `data-decorative` and allow only tokens on
elements that carry it.

## Gate results (scratch export of fix/fluid-layout, profile order)

| Command | Result |
|---|---|
| `bun install --frozen-lockfile` | exit 0, 332 packages |
| `bunx astro sync` | exit 0 |
| `bunx oxfmt --check` | exit 0, all 71 files formatted |
| `bunx oxlint --deny-warnings` | exit 0 |
| `bunx astro check` | exit 0, 199 files, 0 errors / 0 warnings / 0 hints |
| `bunx vitest run` | exit 0, 23 files, 662 tests passed |
| `bunx astro build` | exit 0 |
| `bun audit --audit-level=high` | exit 0, no vulnerabilities |

`bunx oxfmt` (write) was not run: the reviewer does not modify code. The check mode
covers it.

**Not run:** a real-browser layout pass at 320 to 2560 px. The orchestrator is doing that
separately. No server was started.

## Gate-blind files checked by hand

Changed `.astro` files: 18. Oxfmt does not format them and Oxlint does not lint their
markup.

I grepped every added line for the following, and found none of them:
* inline `style=`
* arbitrary values (`-[`)
* raw hex colours
* `any`
* stray `tabindex`

Indentation is consistent. MobileNav was re-indented correctly one level under the new
wrapper. Long class strings match the existing repo style. The markup only uses
Meridian tokens, and the new numeric widths (`min-w-39.5`, `min-w-25`) are documented
with their derivation in ChallengeTable's header comment.

The changed `.css` (global.css) is formatted by Oxfmt and checked by the
layout-tokens test.

## Pre-existing (outside the diff)

The footer wordmark at `SiteFooter.astro:106-110` is `w-max` and `justify-center` in an
`overflow-clip` band. At 320px it clips on both sides. It is decorative and aria-hidden,
and the diff does not change it.
