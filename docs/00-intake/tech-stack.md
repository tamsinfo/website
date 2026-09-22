---
artifact: tech-stack
phase: 0
status: approved
version: 1
updated: 2026-09-22
owner: orchestrator
depends_on:
  - docs/00-intake/project-brief.md
---

# Tech Stack

The resolved stack profile is `.lonewolf/stack-profile.md` (profile
`astro-node-tailwind`, custom). It holds every enforceable rule. This document records
the choices and the reasons for them.

## Choices

| Layer | Choice | Reason |
|---|---|---|
| Framework | Astro 7 | A landing site is mostly static content. Astro prerenders HTML and ships near-zero JavaScript, which serves SEO and first paint. |
| Rendering | Static by default, on-demand per route | Pages prerender at build time. Only the contact-form endpoint and a health route run per request. |
| Server | `@astrojs/node` standalone, Node 24 | The contact form needs a server endpoint that holds SMTP secrets. One Node container serves both pages and the endpoint. |
| Styling | Tailwind CSS 4 via `@tailwindcss/vite` | User choice. Tokens from the Paper design go into one `@theme` block. |
| Package manager | Bun 1.3.14 | User choice. Fast installs and a text lockfile. |
| Lint | Oxlint | User choice. Lints `.ts` and `.astro` frontmatter. |
| Format | Oxfmt | User choice. Formats `.ts`, `.css`, and JSON. |
| Type check | `astro check` with TypeScript 6 | User choice. The only tool that type-checks `.astro` files. |
| Unit tests | Vitest 5 | Tests `src/lib/` logic such as form validation. |
| E2E tests | Playwright (recommended) | Not verified at intake. Phase 5 decides and verifies. |
| Enquiry delivery | SMTP | User choice. The SMTP library is chosen by ADR in Phase 3. |
| Design source | Paper design file | User constraint. Supplied in Phase 3. |
| Deployment | Container image | User choice. Platform not yet chosen. |

## Driving constraints

- The contact form rules out a purely static build. A server endpoint keeps SMTP
  credentials and visitor data off third-party form services, which simplifies GDPR
  and DPDP processor obligations.
- One maintainer favors a single deployable over a separate API service.
- The existing Paper design removes design-system work from Phase 3.

## Toolchain verification (2026-09-22)

A scratch scaffold outside the repository ran each command once. Versions: Bun 1.3.14,
Node 24.21.0, Astro 7.3.4, @astrojs/node 11.1.6, Tailwind CSS 4.3.3, Oxlint 1.85.0,
Oxfmt 0.70.0, @astrojs/check 0.9.10, TypeScript 6.0.3, Vitest 5.0.1.

| Command | Result |
|---|---|
| `bun install` | pass |
| `bunx astro sync` | pass |
| `bunx oxfmt` (auto-fix) | pass |
| `bunx oxfmt --check` | pass |
| `bunx oxlint --deny-warnings` | pass, after config fix below |
| `bunx astro check` | pass, after TypeScript fallback below |
| `bunx vitest run --passWithNoTests` | pass (no tests exist yet) |
| `bunx astro build` | pass; emits `dist/client/` and `dist/server/entry.mjs` |
| `node dist/server/entry.mjs` | pass; `200` on `/` and on an on-demand health route |
| `bun audit --audit-level=high` | pass; no vulnerabilities |
| `bun install --frozen-lockfile` | pass |
| Arbitrary-value and inline-style greps | pass; match on probes, silent when clean |

### Failures and fallbacks

1. **`astro check` rejects TypeScript 7.** Bun installed TypeScript 7 by default and
   `astro check` exited 1. Fallback: pin `typescript@^6`. The profile records the pin.
2. **Oxlint flagged the global CSS import.** Rule `import/no-unassigned-import` fired on
   `import "../styles/global.css"`. Fix: allow `**/*.css` for that rule only.
3. **zsh globbing.** An unquoted `--include=*.astro` fails in zsh. The profile quotes it.

### Coverage gaps found

- Oxfmt does not format `.astro` files.
- Oxlint misses unused variables in `.astro` frontmatter; `astro check` catches them.
- No tool checks `.astro` template markup. Code review covers it.

The profile records these gaps and the rules that compensate for them.

### Notes for Phase 3

- `@astrojs/node` enables filesystem session storage by default. The architect MUST
  decide by ADR whether sessions are used.
