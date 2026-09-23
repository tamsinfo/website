---
artifact: design-system
phase: 3
status: approved
version: 2
updated: 2026-09-22
owner: ui-ux-designer
depends_on:
  - docs/03-design/paper-snapshot/MANIFEST.md
  - docs/03-design/system-architecture.md
  - docs/02-requirements/non-functional-requirements.md
  - .lonewolf/stack-profile.md
---

# Design System: TAMS Infotech Website V1 (Meridian Design, as implemented)

This document transcribes Meridian Design **as captured** in
`docs/03-design/paper-snapshot/`. It is not a new design. Every value below traces to
`tokens.css` or to a `docs/03-design/paper-snapshot/design-system/*.jsx` block, or to the
canonical header/footer/contact-form pattern repeated across every TAMS screen file
(`about.jsx`, `careers.jsx`, `contact.jsx`, `privacy.jsx`, `not-found.jsx`, `home.jsx`).
Do NOT add a token, size, or component this document does not list. If a screen needs one,
report `BLOCKED:` rather than inventing it — per stack profile section 5, tokens live only
in `src/styles/global.css` `@theme`, transcribed from `tokens.css` verbatim.

Only Tailwind utility class names built from the token names below are permitted in
`.astro` files. No arbitrary values (`bg-[#...]`, `p-[13px]`, `text-[17px]`).

---

## 1. Colour tokens

Semantic tokens only. Components reference these names, never the ramp step.

| Token | Hex / value | Tailwind utility (bg / text / border) |
|---|---|---|
| `--color-bg` | `#F4F2ED` (limestone-100) | `bg-bg` |
| `--color-bg-sunk` | `#EBE8E1` (limestone-200) | `bg-bg-sunk` |
| `--color-surface` | `#FFFFFF` | `bg-surface` |
| `--color-surface-inverse` | `#141A18` (slate-900) | `bg-surface-inverse` |
| `--color-surface-inverse-raised` | `#232A28` (slate-800) | `bg-surface-inverse-raised` |
| `--color-border` | `#DDD9D0` (limestone-300) | `border-border` |
| `--color-border-strong` | `#A8AFAB` (slate-400) | `border-border-strong` |
| `--color-border-inverse` | `#2E3634` | `border-border-inverse` |
| `--color-border-inverse-strong` | `#3D4644` | `border-border-inverse-strong` |
| `--color-text` | `#141A18` (slate-900) | `text-text` |
| `--color-text-muted` | `#5C6663` (slate-600) | `text-text-muted` |
| `--color-text-subtle` | `#7C8480` (slate-500) | `text-text-subtle` |
| `--color-text-inverse` | `#F4F2ED` | `text-text-inverse` |
| `--color-text-inverse-muted` | `#9AA5A1` | `text-text-inverse-muted` |
| `--color-primary` | `#136F58` (copper-500) | `bg-primary` / `text-primary` |
| `--color-primary-hover` | `#0F5A47` (copper-600) | `hover:bg-primary-hover` |
| `--color-primary-active` | `#0B4536` (copper-700) | `active:bg-primary-active` |
| `--color-primary-soft` | `#E9F3EF` (copper-50) | `bg-primary-soft` |
| `--color-accent-inverse` | `#4FB89A` (copper-300) | `text-accent-inverse` (accent on dark sections) |
| `--color-success` / `-soft` / `-on` | `#3F7D4E` / `#E4EFE7` / `#2E6039` | success badge |
| `--color-warning` / `-soft` / `-on` | `#B08428` / `#F7EFD8` / `#7D5D17` | Privacy "to confirm" markers |
| `--color-danger` / `-soft` / `-on` / `-hover` | `#A64232` / `#F7E4E0` / `#7E3226` / `#8C3628` | form field errors |
| `--color-info` / `-soft` / `-on` | `#3D6B8C` / `#E2EAF1` / `#2E5069` | not used by any in-scope screen; do not add |
| `--color-wordmark` | `#1E2523` | oversized footer wordmark text |
| `--color-white` | `#FFFFFF` | icon strokes on primary/dark fills |
| `--color-slate-900` | `#141A18` | text on `--color-limestone-100` CTA pills |

### Contrast pairs used on in-scope screens (WCAG 2.1 AA)

| Foreground | Background | Ratio | Use | Pass |
|---|---|---|---|---|
| `--color-text` (#141A18) | `--color-bg` (#F4F2ED) | 16.1:1 | Body copy, light sections | AA body (4.5:1) |
| `--color-text-muted` (#5C6663) | `--color-bg` (#F4F2ED) | 5.4:1 | Muted body copy | AA body (4.5:1) |
| `--color-text-subtle` (#7C8480) | `--color-surface` (#FFFFFF) | 3.9:1 | Small mono labels ≥14px semibold only | AA large text (3:1); **known limitation below 14px regular** — see "Known limitation" note |
| `--color-text-inverse` (#F4F2ED) | `--color-surface-inverse` (#141A18) | 15.8:1 | Body copy on dark hero/footer | AA body (4.5:1) |
| `--color-text-inverse-muted` (#9AA5A1) | `--color-surface-inverse` (#141A18) | 5.6:1 | Muted copy on dark sections | AA body (4.5:1) |
| `--color-white` (#FFFFFF) | `--color-primary` (#136F58) | 4.6:1 | Primary button label | AA body (4.5:1) |
| `--color-slate-900` (#141A18) | `--color-limestone-100` (#F4F2ED) | 15.4:1 | Inverse-CTA pill label ("Book a discovery call" on dark hero) | AA body |
| `--color-primary` (#136F58) | `--color-bg` (#F4F2ED) | 5.9:1 | Links, "Explore" / "See what we have built" text links | AA body |
| `--color-text` (#141A18) | `--color-border` (#DDD9D0) boundary | 12.9:1 (text) / border itself is a graphical boundary, measured against `--color-surface` 1.3:1 | Hairline card border | **Below AA 3:1 for a required non-text boundary** — see "Known limitation" note |
| `--color-danger` (#A64232) | `--color-surface` (#FFFFFF) | 5.1:1 | Field error text, error border | AA body |
| `--color-warning-on` (#7D5D17) | `--color-warning-soft` (#F7EFD8) | 5.2:1 | Privacy "to confirm" badge text | AA body |

**Known limitation (user-accepted 2026-09-22).** Recorded in
`.lonewolf/interviews/02-functional.md`, "Phase 3 UI designer BLOCKED items" item 2. The
user accepted both contrast findings below as a known V1 limitation, to be waived at
gate G5 (NFR-021 edge case) and fixed in the next design pass, not in this build:

- `--color-border` (#DDD9D0) against `--color-surface` (#FFFFFF) measures 1.3:1, under
  the 3:1 AA boundary minimum for the hairline card borders used everywhere (About
  differentiator cards, Services/Products/Solutions/Industries feature cards, Careers
  table).
- `--color-text-subtle` (#7C8480) on `--color-surface` (#FFFFFF) is 3.9:1. It is used at
  `text-10`/`text-11`/`text-12`/`text-13` (mono labels, table meta, breadcrumbs) — below
  the 18px/14px-bold "large text" threshold — so it fails the 4.5:1 body-text minimum.
  Applies to: table column headers (Careers), stat captions, breadcrumb "Home / X"
  trail, footer legal line color `--color-slate-600` on `--color-surface-inverse`
  (measured separately: #5C6663 on #141A18 = 2.1:1, also fails).

**Developers MUST use these tokens exactly as specified above and MUST NOT substitute a
darker value to "fix" the contrast.** The fix is a design-owned token change for a later
pass, not a build-time workaround; substituting a value here would silently diverge from
the frozen Meridian tokens.

No other pairing on an in-scope screen falls below AA.

---

## 2. Typography

Families (self-hosted per ADR-008): `--font-display` = Archivo (headings), `--font-sans` =
Inter (interface/body), `--font-mono` = IBM Plex Mono (labels/data/eyebrows).

| Level | Token | Size | Family/weight | Line height token | Tracking | Observed use |
|---|---|---|---|---|---|---|
| Display XL | `text-72` | 72px | Archivo medium | `/display` (104%) | `tracking-tighter` | Home H1, Contact H1, About H1, Careers H1, Services/Products/Solutions/Industries H1 |
| Display L | `text-64` | 64px | Archivo medium | `/display` | `tracking-tighter` | Privacy H1; every detail-page closing CTA band H2 ("Tell us what is breaking") |
| Display M | `text-56` | 56px | Archivo medium | `/display` or `/heading` | `tracking-tighter` | Section H2s ("What are you facing?", "Four services, one lifecycle", "Why manufacturing only", 404 "Where you were probably heading") |
| Display S | `text-48` | 48px | Archivo medium | `/display` | `tracking-tight` | About/Careers sub-page eyebrow H2 ("Who we are", "What it is like here") |
| Heading L | `text-40` | 40px | Archivo medium | `/heading` | `tracking-tight` | Design-system foundation headers only; not used on TAMS content screens |
| Heading M | `text-34` | 34px | Archivo medium | `/heading` | `tracking-tighter` | Contact-Thank-You H1 ("That is with us.") desktop |
| Heading S | `text-32` | 32px | Archivo semibold | `/heading` | `tracking-tight` | "TAMS Infotech Pvt. Ltd." office name (Contact, Thank-You) |
| Heading XS | `text-26` | 26px | Archivo semibold | `/heading` | `tracking-snug` | "What happens next" sub-heads |
| Body XL | `text-20` / `text-19` | 20/19px | Inter regular / Archivo semibold (card titles) | `/body` `/snug` | `tracking-snug` | Hero intro paragraphs (some), card titles |
| Body L | `text-18` | 18px | Inter regular | `/body` | `tracking-snug` | Hero introduction paragraph (H1 subtext) — **this is the FR-044 meta-description source** |
| Body M | `text-16` / `text-15` | 16/15px | Inter regular | `/body` | `tracking-normal` | Section intros, card body copy, form field values |
| Body S | `text-14` / `text-13` | 14/13px | Inter regular | `/body` `/snug` | `tracking-normal` | Footer nav links, table meta, help text |
| Label | `text-11` | 11px | IBM Plex Mono medium | `/snug` (14px) | `tracking-wider` (eyebrows) or `tracking-label` (data) | Eyebrow kickers ("Office", "Contact", "Services"), table column headers |
| Micro | `text-10` | 10px | IBM Plex Mono medium | `/none` (12px) | `tracking-label` | Colour-swatch captions (design system only) |

Body text line-height MUST use `--leading-body` (160%); headings MUST use
`--leading-heading` (118%) or `--leading-display` (104%) exactly as the class pairing
shows (`text-56/display`, `text-32/heading`, etc.). Do not mix a size token with a
line-height token the snapshot did not pair it with.

---

## 3. Spacing scale

Base unit 4px (`--spacing-1`). Every margin/padding/gap in a screen spec MUST cite one of:

`0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128, 160` px
→ `spacing-0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32, 40`.

Section rhythm observed on every content screen:
- Page section vertical padding: `py-24` (96px) light/sunk sections, `py-32` (128px)
  dark full-bleed sections (About "Why manufacturing only"), `py-16`/`pt-16` hero top pad.
- Page horizontal gutter: `px-20` (80px) desktop, drops to `px-5` (20px) mobile
  (ADR-013, confirmed identical in `mobile/contact.jsx` vs `desktop/contact.jsx`).
- Card internal padding: `p-8` (32px) feature/service/product cards; `p-6` (24px) compact
  cards (About differentiators use `p-8`, 404 wayfinding cards use `p-6`).
- Gap between heading block and body: `gap-5` or `gap-6` (20–24px).
- Gap between cards in a row: `gap-6` (24px).
- Form field stack gap: `gap-2` (8px) label→field; `gap-4`/`gap-5` between fields.

---

## 4. Radius and line

| Token | Value | Use |
|---|---|---|
| `--radius-sm` | 4px | Form fields, chips-adjacent inputs (Contact uses `rounded-sm` fields) |
| `--radius-md` | 8px | Cards, icon tiles, map placeholder container |
| `--radius-lg` | 12px | Larger content cards, table containers |
| `--radius-full` | 999px | Every button, chip, badge, avatar |

Separation is by 1px `--color-border` hairline on light surfaces, or by background-tone
step on dark surfaces (`--color-surface-inverse` → `--color-surface-inverse-raised`).
Do not add a box-shadow to any in-scope component; the only shadow in the whole snapshot
is the "Header · scrolled" state (`04-navigation-and-shell.jsx`), which V1 does not use
(no sticky/scrolled header behaviour is specified by any FR).

---

## 4A. Derived tokens (not in Meridian)

Resolved (user decision, 2026-09-22 ~18:45 PDT — `.lonewolf/interviews/02-functional.md`
"Phase 3 UI designer BLOCKED items" item 4). These values appear in the frozen Paper
snapshot as literal Tailwind arbitrary values with no matching token in `tokens.css`.
Rather than use an arbitrary value in `.astro` files (forbidden, §0), each is named as a
"derived" token — sourced from the snapshot, not invented — and added to
`src/styles/global.css` inside a block clearly headed **"Derived from Paper, not in
Meridian."** Any screen spec needing one of these values cites the token name, never the
raw px number (see ui-specification.md).

| Token (Tailwind v4 `@theme` namespace) | Value | Source snapshot (file : line) | Use |
|---|---|---|---|
| `--spacing-map-height` | `220px` | `desktop/contact.jsx:166` (`h-[220px]`, map placeholder/embed container, also `desktop/contact-thank-you.jsx:52`, `mobile/contact.jsx:125`, `mobile/contact-thank-you.jsx:52`) | Fixed height of the office map card, placeholder and loaded iframe states (§7.16), so there is no layout shift (NFR-003) |
| `--size-icon-xl` | `56px` | `desktop/contact-thank-you.jsx:85` (`w-[56px] h-[56px]`, also `mobile/contact-thank-you.jsx:85`) | Thank-you panel's circular check icon (§7.17) |
| `--border-width-thick` | `2px` | `design-system/02-actions-and-forms.jsx:201,211` (`border-2`, text-field focus and error states) | Form field error border (§7.2); focus ring width (§6, assumption) |
| `--spacing-focus-ring-offset` | `2px` | No snapshot capture (Paper does not record `:focus`); constructed value, not transcribed — see §6 | Focus ring offset on every interactive element (§6, assumption) |

`--text-132` and `--text-56` (footer wordmark band, desktop/mobile) already exist as
Meridian typography tokens in `tokens.css` and are **not** derived tokens — reference
them directly (see § "Shared shell" in ui-specification.md).

Every other pixel value used by an in-scope screen traces to an existing Meridian token
(§1–§5 above) or a Tailwind default spacing/sizing step already covered by §3. If a
frontend developer finds another value with no covering token while building, that is a
`BLOCKED:` finding to raise, not a value to invent here.

---

## 5. Breakpoints

Per ADR-013 (accepted): `--breakpoint-xl` (1280px) is the desktop breakpoint.

| Range | Layout | Notes |
|---|---|---|
| `< 1280px` (down to 360px, NFR-020) | Mobile screen file (`mobile/*.jsx`) | Single column, full-width buttons stack vertically, gutter `px-5` (20px), display type steps down one rung (72→34, 64→32/30, 56→30, 48→30/26) |
| `>= 1280px` | Desktop screen file (`desktop/*.jsx`) | Multi-column grids as captured, gutter `px-20` (80px), `max-w` container `--container-content` (1120px) for centred content blocks |

Implement with Tailwind's `xl:` variant exactly (`xl:flex-row` etc. is the desktop
override; unprefixed classes are the mobile default), per ADR-013 and stack profile
section 5.

---

## 6. Focus and motion

- **Focus indicator.** No focus style is drawn in any snapshot file (Paper does not
  capture `:focus`). No Meridian token defines one. This is a **gap**, not a `BLOCKED:`
  contrast finding — NFR-022 and the stack profile (`accessibility: visible focus
  states`) require one to exist. Use a visible outline in `--color-primary` at
  `--border-width-thick` width with `--spacing-focus-ring-offset` offset (derived
  tokens, §4A: `outline: var(--border-width-thick) solid var(--color-primary);
  outline-offset: var(--spacing-focus-ring-offset);`) as the uniform focus ring on every
  interactive element (links, buttons, form fields, chips,
  header dropdown triggers, footer links, `<details>` summary). This value is a
  construction from existing tokens (`--color-primary`), not a new token, and matches the
  one accent colour the design system names ("Copper appears once per viewport" — the
  focus ring is the one functional exception, matching common Meridian-adjacent
  practice of using the single accent for the one interactive signal). Confirm with the
  user before Phase 4 freezes it; treat as an assumption, not a captured value.
- **Reduced motion.** No animation exists in the snapshot beyond the header dropdown
  open/close and the mobile `<details>` menu (ADR-012, CSS-only). Both MUST respect
  `prefers-reduced-motion: reduce` by removing any transition on `max-height`/`opacity`
  and toggling instantly instead.

---

## 7. Component inventory

Only components the 31 screens actually use.

### 7.1 Button
Variants (from `02-actions-and-forms.jsx` "Actions", confirmed on TAMS screens):

| Variant | Background | Text | Border | Used for |
|---|---|---|---|---|
| Primary (dark bg) | `--color-limestone-100` | `--color-slate-900` | none | "Book a discovery call" in header/hero on dark sections; "Send another message" is the **secondary-outline** variant, not this one |
| Primary (light bg) | `--color-primary` | `--color-white` | none | "Send message" (Contact form submit) |
| Secondary / outline | `--color-surface` or transparent | `--color-text` | 1px `--color-border-strong` | "See our case studies"-style secondary CTA, "Send another message", "All services" / "All solutions" pills |
| Danger | `--color-danger` | `--color-white` | none | not used by any in-scope screen; do not add |
| Text link + icon | transparent | `--color-primary` (or `--color-accent-inverse` on dark) | none | "Explore", "Read the case study"-style inline links, "Contact us" 404 link |

Sizes: Small `h-10 px-5 text-14`, Medium `h-12 px-6 text-15` (default), Large
`h-[52px]`/`h-[56px] px-8 text-16`. Radius always `rounded-full`.

States (from the snapshot "States" row):
- Default: token colour above.
- Hover: primary → `--color-primary-hover`; outline/secondary → add `--color-bg-sunk`
  background wash (no token for this exact wash was captured on TAMS screens; use
  `--color-bg-sunk` as the nearest existing surface token rather than inventing one).
- Active/pressed: primary → `--color-primary-active`.
- Disabled: `opacity-40` (from the snapshot "Disabled" state), pointer-events none,
  `aria-disabled="true"`. Used for "Send message" while a submission is in flight
  (FR-040).
- Working/submitting: icon replaced by no icon; button text stays ("Send message")
  with `aria-busy="true"` and `aria-disabled="true"`; the snapshot's "Working" state
  shows a plain circular dot placeholder with no captured spinner animation — implement
  a simple non-animated (or `prefers-reduced-motion`-safe) spinner, since no keyframe
  value exists to transcribe.
- Keyboard: `Enter`/`Space` activates; visible focus ring per section 6; no
  `tabindex` override.

### 7.2 Input (text)
`h-12` (48px), `rounded-sm` (Contact) or `rounded-md` (design-system sample — Contact's
`rounded-sm` is what TAMS screens actually use; prefer the TAMS capture over the generic
sample), `px-4`, 1px `--color-border`, background `--color-surface`, label `text-14
font-semibold` above (not a floating label), placeholder `text-15 text-text-subtle`.

States: default (border `--color-border`), focus (border 2px `--color-primary`, from the
generic sample — no TAMS screen captures a focused text input; carried over from
`02-actions-and-forms.jsx` as the nearest documented value), error (border 2px
`--color-danger`, helper text below at `text-12 text-danger`, `aria-describedby` pointing
to that helper's `id`, `aria-invalid="true"`), disabled (not used in-scope).

### 7.3 Select
Same box chrome as Input, trailing chevron icon (`--color-text-subtle` or
`--color-text-muted` stroke), value text `text-15 text-text` (not subtle, once a value is
chosen) or `text-15 text-text-subtle` (placeholder). Used for the Contact "Interest"
control: a native `<select>` styled to this CLOSED-state chrome. The open option-list
rendering captured in the snapshot is this same control's open state, not a separate
component — **see SCR-004 State A** for the resolved control pattern (user decision,
2026-09-22).

### 7.4 Textarea
Same chrome as Input, `h-[104px]`–`h-[140px]`, content top-aligned (`items-start`),
placeholder wraps at `text-15/body`.

### 7.5 Checkbox / Radio / Toggle
Captured only in the generic design-system file; no TAMS screen uses a checkbox, radio,
or toggle (Contact "Interest" is a native `<select>`, §7.3, resolved 2026-09-22). Do not
add checkbox/radio/toggle components; no in-scope screen needs them.

### 7.6 Chip
`h-[30px] px-3 rounded-full`, unselected: 1px `--color-border-strong`, text
`--color-text-muted`; selected: `--color-primary-soft` background, `--color-copper-100`
border, text `--color-primary`. Used for static, non-input chips only: Careers'
module-track chips (ABAP, FICO, PP/QM/PM, SD, MM, Basis — display-only, not selectable)
and Privacy's "to confirm" / "Draft" warning chips. **Not used for Contact "Interest"** —
that control is a native `<select>` (§7.3), resolved 2026-09-22; the pill/radio-fieldset
pattern this section previously described for Interest is not built.

### 7.7 Card
`rounded-lg` (or `rounded-md` for compact), `p-6`–`p-8`, `--color-surface` background,
1px `--color-border` (light sections) or `--color-surface-inverse-raised` fill with no
border (dark sections — "cards lift by tone" per foundations). Used for: service tiles,
product tiles, solution tiles, industry tiles, About differentiator tiles, 404 wayfinding
tiles, Careers role rows (as a table, not discrete cards).

### 7.8 Table
Used once: Home "What are you facing?" comparison table, and the Careers open-roles
table. Header row `h-12 bg-bg-sunk` (Home) or `bg-limestone-100` (Careers), `text-11`
mono uppercase column labels, body rows alternate `bg-surface`/`bg-limestone-50`,
1px `--color-border` row dividers. Semantic element: `<table>` with `<thead>`/`<tbody>`,
not a div grid — no in-scope screen requires column sorting or filtering.

### 7.9 Breadcrumb
`Home / <Page>` trail, `text-14`, current page `font-semibold text-text-inverse` (on
dark hero), separator is the 24×24 chevron-right SVG. Present on every screen except
Home and 404. Semantic element: `<nav aria-label="Breadcrumb"><ol>…</ol></nav>`.

### 7.10 Hero
Two variants, both `--color-surface-inverse` background with the faceted-hexagon SVG
watermark (decorative, `aria-hidden="true"`):
- **Standard hero** (About/Careers/Contact/Services/Products/Solutions/Industries):
  eyebrow (dot + mono label) → H1 (`text-72/display`) → intro paragraph
  (`text-18/body`, `text-text-inverse-muted`) → primary CTA pill, optionally with a
  stat rail below (Home only) or nothing.
- **404 hero**: adds the oversized `186px` "404" numeral above the H1
  (`text-56/display` — smaller than the standard 72px, because the numeral is the real
  display element) and two CTAs side by side.

### 7.11 Closing CTA band
Every Services/Products/Solutions/Industries detail page and About end with a centred
dark band: eyebrow → H2 `text-64/display` "Tell us what is breaking" → intro
(`text-17/body`) → primary CTA pill "Book a discovery call". This is a single reusable
`ClosingCta.astro` component parameterised by nothing (copy is identical across all 25
detail pages, confirmed by grep across every `services-*`, `products-*`, `solutions-*`,
`industries-*` desktop file).

### 7.12 Header (desktop)
`h-20` (80px), `--color-surface-inverse` background on every screen (not just hero
pages — confirmed identical across about/careers/contact/privacy/not-found/home). Logo +
wordmark "TAMS Infotech" left; nav list: Home, Services▾, Solutions▾, Products▾,
Industries▾, About Us, Careers, Contact Us (current page shown in `--color-accent-inverse`
semibold, others `--color-text-inverse` medium); right cluster: search icon (decorative
only — no in-scope screen has a search results page; render as a non-functional icon or
omit and report `BLOCKED:` if the user wants it functional), "Book a discovery call" pill
(→ `/contact#contact-form`, FR-016).

### 7.13 Header dropdown panel (desktop)
**Gap.** No TAMS screen capture shows an opened dropdown panel; only the generic
Meridian mega-menu (`04-navigation-and-shell.jsx`) shows the rich 3-column +
featured-card pattern, which is placeholder content for a fictitious company and MUST
NOT be copied verbatim (FR-011, no invented copy). Specify the minimum defensible
pattern from confirmed data only: a single-column link list per dropdown, one link per
child route, label = that page's captured H1 text, route = the FR-006/007/046/047 table.
Background `--color-white`, `border-t border-border`, each link row `py-3 px-6`,
`text-15 font-medium`. Opens per ADR-012 (`:hover`/`:focus-within`, JS enhancement for
click/outside-click/Escape). **Assumption**, flagged in the final report — confirm with
the user before Phase 4 builds it; if the user wants the richer mega-menu, that is a
new Paper capture and an amendment, not a Phase 3 invention.

### 7.14 Mobile menu
Full-screen `<details>` panel (ADR-012) opening from the hamburger control, dark
(`--color-surface-inverse`) background, each item a large `text-24` row with a trailing
`+`/expand icon for the four dropdown items (Services/Solutions/Products/Industries — no
TAMS mobile capture shows the expanded sub-list either; same gap and same resolution as
7.13, one link per child route), plain rows for Case studies/Insights-equivalent
(TAMS has no Case Studies or Insights pages — omit those two rows; TAMS mobile menu items
are exactly the 8 header items), "Contact us" pill CTA at the bottom, language row is
**not applicable** — no in-scope requirement adds a language switcher; omit it (the
generic sample's "EN / DE / PT" row is not TAMS content).

### 7.15 Footer
`--color-surface-inverse` background, confirmed byte-identical structure across
about/careers/contact/privacy/not-found (home footer not fully captured within tool
budget — treat as the same component; if `home.jsx`'s footer differs, that is a
`BLOCKED:` finding for the frontend developer to raise, not a guess to make here).
Four columns: brand blurb + address/phone/email (with icons), Services (4 links, labels =
FR-006 screen names), Products (7 links, labels = FR-007 screen names), Company (About
Us / Careers / Contact Us). Legal row: `© 2026 TAMS Infotech Pvt. Ltd.` +
Privacy (→ `/privacy`) / Terms (→ `#`, FR-012) / Cookies (→ `#`) / Sitemap (→ `#`).
Trademark disclaimer paragraph. Oversized `132px` (desktop) / `56px` (mobile) wordmark
"TAMS INFOTECH" as a decorative bottom band (`aria-hidden="true"`, it duplicates the
visible header wordmark).

### 7.16 Map placeholder / embed
`h-[--spacing-map-height] rounded-lg` (derived token, §4A; inside the office card),
sketched-map SVG background (decorative), centred pin icon + "Load map" pill button
(dark, `--color-slate-900`). On activation, replaced by the ADR-010 iframe at the same
fixed `--spacing-map-height` (NFR-003 — no layout shift). Helper line below: "The map
loads only when you choose to, so no third-party cookies are set before then."

### 7.17 Thank-you panel
`rounded-lg border p-10` card: `--size-icon-xl` (derived token, §4A) circular check icon
(`--color-primary` fill, white check), eyebrow "Message sent", H1 "That is with us.",
body copy, then a definition-list
style row group (`Sent to` / `Topic` / `Reference`, `text-11` mono label + `text-15`
value), then "Send another message" (secondary button) + helper line. See SCR-004 for
field bindings.
