---
artifact: implementation-plan
phase: 4
status: in-review
version: 1
updated: 2026-09-22
owner: orchestrator
depends_on:
  - docs/02-requirements/functional-requirements.md
  - docs/02-requirements/non-functional-requirements.md
  - docs/02-requirements/user-stories.md
  - docs/03-design/system-architecture.md
  - docs/03-design/data-model.md
  - docs/03-design/ui-specification.md
  - docs/03-design/design-system.md
  - docs/03-design/paper-snapshot/MANIFEST.md
  - .lonewolf/stack-profile.md
---

# Implementation Plan: TAMS Infotech Website V1

Components (`C-xx`) come from `docs/03-design/system-architecture.md` section 2. The API
contract is `docs/03-design/api-contract.yaml` (frozen at G3). Screens come from
`docs/03-design/ui-specification.md`. Every agent builds from the frozen Paper snapshot in
`docs/03-design/paper-snapshot/`. No agent may call Paper.

## Waves

| Wave | Tasks | Agents | Rule |
|---|---|---|---|
| 0 | TASK-001 | backend-developer | Foundation. Runs alone. |
| 1 | TASK-002, TASK-003 | backend-developer, frontend-developer | Parallel. Both depend on TASK-001 only. |
| 2 | TASK-004, TASK-005, TASK-006 | frontend-developer x3 | Parallel. Depend on TASK-001 and TASK-003. |
| 3 | TASK-007 | frontend-developer | Should items. Runs after every Must task merges. |

## Ownership rules for shared files

- `package.json` and `bun.lock`: TASK-001 adds every runtime and dev dependency the design
  names (astro, @astrojs/node, tailwindcss, @tailwindcss/vite, nodemailer,
  libphonenumber-js, Fontsource packages for Archivo, Inter, IBM Plex Mono, and the dev
  tools in the stack profile). Later tasks MUST NOT add dependencies. A task that needs
  one reports `BLOCKED:`.
- `astro.config.ts`, `tsconfig.json`, `.oxlintrc.json`, `server.ts`: TASK-001 only.
- `src/styles/global.css`, `src/layouts/**`, `src/components/**` shared components,
  `src/lib/site-routes.ts`, `src/lib/page-meta.ts`: TASK-003 only. TASK-007 alone MAY
  change the `ships` flags in `src/lib/site-routes.ts`.
- Page files under `src/pages/`: the task that owns the screen.
- Page-specific components: `src/components/<page-or-family>/`, owned by that page's task.

---

### TASK-001: Scaffold the project and build the server foundation

**Component:** backend
**Implements:** FR-009, FR-020, FR-021, FR-022, FR-023, FR-024, FR-025, FR-026, FR-052, NFR-006, NFR-008, NFR-009, NFR-010, NFR-011, NFR-012, NFR-013, NFR-014, NFR-015, NFR-024, NFR-025, NFR-026
**Operations:** getHealth
**Entities:** ENT-002, ENT-004
**Depends on:** none
**Parallel-safe with:** none (foundation wave runs alone)
**Branch:** feature/foundation

**Scope.** Write the minimal file set from stack profile section 2 by hand: `package.json`
(packageManager pin, scripts matching `.github/workflows/ci.yml`), `bun.lock`,
`astro.config.ts` (output static, `@astrojs/node` standalone, sessions off per ADR-009,
origin check off per ADR-014, trailing-slash behavior per ADR-003, per-route CSP per
ADR-002 including the AMD-003 Cloudflare Insights origins and the `/contact` frame-src),
`tsconfig.json`, `.oxlintrc.json`. Install every dependency listed in "Ownership rules".
Run `bun audit --audit-level=high` including the Fontsource packages. Implement C-01
`server.ts`, C-02 `src/lib/http-hardening.ts`, C-04 `src/pages/health.ts`, C-12
`src/lib/runtime-config.ts`, C-10 `src/lib/contact-validation.ts` (shared, no Node
imports; exact messages from FR-020 to FR-026), C-11 `src/lib/calling-codes.ts`, and one
shared module for the contract's error-code enum and result types derived from
`api-contract.yaml`. Add a placeholder `src/pages/404.astro` only if the build requires it;
TASK-003 owns its real content.

**Finish condition.** The full stack profile gate (section 8, checks 1 to 14) passes.
Vitest covers C-02 (including `/about/index%2Ehtml`), C-10 boundary cases from FR-020 to
FR-026, C-11 (`IN`→`+91`, `SG`→`+65`, `US`→`+1`, `XX`→`+91`), and C-12 missing-variable
behavior. The built server started with `node server.ts` answers `/health` with 200 and
shows the ADR-002 headers. `docker build -f deploy/Dockerfile .` succeeds.

**Out of scope.** The contact pipeline and `POST /api/contact` (TASK-002). All `.astro`
pages, layouts, components, and `global.css` (TASK-003 onward).

### TASK-002: Implement the contact endpoint pipeline

**Component:** backend
**Implements:** FR-027, FR-028, FR-030, FR-031, FR-032, FR-033, FR-034, FR-035, FR-042, FR-050, FR-053, FR-054, NFR-005, NFR-007, NFR-017, NFR-018, NFR-028
**Operations:** submitContactEnquiry
**Entities:** ENT-001, ENT-003, ENT-005, ENT-006, ENT-007
**Depends on:** TASK-001
**Parallel-safe with:** TASK-003
**Branch:** feature/contact-endpoint

**Scope.** Implement C-05 `src/pages/api/contact.ts`, C-06 contact pipeline, C-07 body
reader, C-08 client IP, C-09 rate limiter, C-13 Turnstile verifier, C-14 enquiry email,
C-15 SMTP sender, C-16 outcome log, and C-17 enquiry reference, exactly as the contract and
ADR-004, ADR-005, ADR-007, ADR-015 define them, in the FR-053 check order. Use C-10 and
C-12 from TASK-001 unchanged.

**Finish condition.** Stack profile gate passes. Vitest covers every contract status
code (200, 400, 403, 405, 413, 415, 429, 502), the FR-053 order (AC-006.9), the 64 KB
boundary, the rate-limit sixth request, RFC 2047 subject encoding, the reference pattern,
the email body order, and that no field value reaches the log (NFR-017). SMTP and
Siteverify are faked in tests.

**Out of scope.** Every browser-side file. `src/lib/contact-validation.ts` and
`src/lib/runtime-config.ts` (TASK-001; report `BLOCKED:` if they need a change).

### TASK-003: Build the site shell, design tokens, and shared components

**Component:** frontend
**Implements:** FR-009, FR-010, FR-011, FR-012, FR-013, FR-014, FR-015, FR-043, FR-044, FR-045, FR-051, NFR-001, NFR-002, NFR-003, NFR-004, NFR-016, NFR-019, NFR-020, NFR-021, NFR-022, NFR-023, NFR-027
**Operations:** none
**Entities:** none
**Depends on:** TASK-001
**Parallel-safe with:** TASK-002
**Branch:** feature/site-shell

**Scope.** C-31 `src/styles/global.css` (verbatim tokens from `paper-snapshot/tokens.css`,
the derived-token block from design-system section 4A, Fontsource imports), C-20 base
layout, C-21 page metadata, C-22 site routes (every route in the route inventory with its
label and `ships` flag; Solutions and Industries `ships: false`), C-23 header with no-JS
menus, C-24 navigation enhancement, C-25 footer, the 404 page (SCR-006), and every shared
component in the design-system component inventory that more than one screen uses
(buttons, breadcrumb, hero variants, closing CTA band, cards, table shell, chips,
section headings). Build from `paper-snapshot/design-system/*.jsx` and the header and
footer sections of the screen snapshots, in both layouts, switching at `--breakpoint-xl`.

**Finish condition.** Stack profile gate passes. `/404` renders the SCR-006 design in both
layouts. Header, footer, and dropdowns work with JavaScript disabled. Vitest covers C-21
(160-character cut with `…`) and C-22 (`#` for unshipped routes). A documented component
catalogue (props per component) exists as a comment block in each component file.

**Out of scope.** Every page except the 404 page. The contact form and map.

### TASK-004: Build the Home, About, Careers, and Privacy pages

**Component:** frontend
**Implements:** FR-001, FR-002, FR-003, FR-004, FR-008
**Operations:** none
**Entities:** none
**Depends on:** TASK-001, TASK-003
**Parallel-safe with:** TASK-005, TASK-006
**Branch:** feature/core-pages

**Scope.** SCR-001 Home, SCR-002 About, SCR-003 Careers (empty "No openings available"
table per the UI specification), SCR-005 Privacy Policy, from their Desktop and Mobile
snapshots. Read `desktop/home.jsx` to its last line. Page-specific components live in
`src/components/home/`, `about/`, `careers/`, `privacy/`.

**Finish condition.** Stack profile gate passes. Each route returns 200 from the built
server, carries the FR-043 to FR-045 metadata, and passes the section 8 grep checks. The
agent records a section-by-section match checklist against each snapshot in its report.

**Out of scope.** Shared components (TASK-003; report `BLOCKED:` if one is missing). The
contact page. Detail pages.

### TASK-005: Build the Contact page, form, and map

**Component:** frontend
**Implements:** FR-005, FR-016, FR-017, FR-018, FR-019, FR-024, FR-029, FR-036, FR-037, FR-038, FR-039, FR-040, FR-041, FR-048, FR-049, FR-055
**Operations:** submitContactEnquiry (caller)
**Entities:** ENT-001, ENT-002, ENT-007
**Depends on:** TASK-001, TASK-003
**Parallel-safe with:** TASK-004, TASK-006
**Branch:** feature/contact-page

**Scope.** SCR-004: C-27 `src/pages/contact.astro` (on-demand, dial-code prefill from C-11,
Turnstile site key from C-12, `Cache-Control: private, no-store`), C-28 form client, C-29
Turnstile client, C-30 map loader, and the thank-you state from
`contact-thank-you.jsx`. Interest is a native `<select>` with an empty first option. Use
C-10 for client validation. Branch on the contract's error codes per ui-specification
section 7.1. Page-specific components live in `src/components/contact/`.

**Finish condition.** Stack profile gate passes. Vitest covers the form client state
machine with a mocked `fetch`: every error code, the 15 s timeout, double-submit
prevention, the thank-you rows, and the FR-055 reset. `/contact` from the built server
returns the prefill for `CF-IPCountry: SG` and the `Cache-Control` header.

**Out of scope.** `POST /api/contact` server code (TASK-002). Shared components (TASK-003).

### TASK-006: Build the detail template and the Services and Products pages

**Component:** frontend
**Implements:** FR-006, FR-007
**Operations:** none
**Entities:** none
**Depends on:** TASK-001, TASK-003
**Parallel-safe with:** TASK-004, TASK-005
**Branch:** feature/services-products

**Scope.** The detail-page template from ui-specification section 5, and SCR-007 to
SCR-017 (4 Services, 7 Products) at the FR-006 and FR-007 routes, each transcribed from
its own Desktop and Mobile snapshot. Template and family components live in
`src/components/detail/`. The template MUST also serve TASK-007 unchanged.

**Finish condition.** Stack profile gate passes. All 11 routes return 200 from the built
server with FR-043 to FR-045 metadata; `/services` and `/products` return 404. The agent
records a match checklist per screen.

**Out of scope.** Solutions and Industries pages (TASK-007). Shared components (TASK-003).

### TASK-007: Build the Solutions and Industries pages

**Component:** frontend
**Implements:** FR-046, FR-047
**Operations:** none
**Entities:** none
**Depends on:** TASK-003, TASK-006
**Parallel-safe with:** none (runs after every Must task merges)
**Branch:** feature/solutions-industries

**Scope.** SCR-018 to SCR-031 (8 Solutions, 6 Industries) using the TASK-006 template,
each from its own snapshots. Flip `ships` to `true` for these routes in
`src/lib/site-routes.ts` so header and footer links point to them (FR-012).

**Finish condition.** Stack profile gate passes. All 14 routes return 200; `/solutions`
and `/industries` return 404; no Solutions or Industries link remains `#`.

**Out of scope.** Changes to the detail template (report `BLOCKED:` instead).

---

## Verification

| Check | Result |
|---|---|
| FRs covered / total | 55 / 55 (FR-001 to FR-055) |
| NFRs covered / total | 28 / 28 (NFR-001 to NFR-028) |
| Operations assigned / in contract | 2 / 2 (getHealth → TASK-001, submitContactEnquiry → TASK-002) |
| Screens assigned / in UI specification | 31 / 31 (SCR-006 → TASK-003; SCR-001, 002, 003, 005 → TASK-004; SCR-004 → TASK-005; SCR-007 to 017 → TASK-006; SCR-018 to 031 → TASK-007) |
| Tasks with no dependency | TASK-001 (foundation) |
| Dependency cycles | none |

Shared requirements appear in two tasks by design: FR-009 (server 404 path in TASK-001,
404 page in TASK-003), FR-024 (lookup in TASK-001, rendering in TASK-005).
