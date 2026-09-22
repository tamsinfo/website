---
profile: astro-node-tailwind
runtime: Node.js 24 (server output), Bun 1.3.14 (package manager and scripts)
framework: Astro 7 with @astrojs/node (standalone)
rendering: static by default, on-demand per route
styling: Tailwind CSS 4 via @tailwindcss/vite
package_manager: Bun
lint_format: Oxlint + Oxfmt, astro check for .astro type checking
verified: 2026-09-22
---

# STACK PROFILE: ASTRO + NODE ADAPTER + TAILWIND

These directives extend `core-dna.md`. They do not replace it. Where this profile and
the core DNA conflict, the core DNA prevails.

This profile defines no variants.

---

## 1. TOOLCHAIN

Every agent MUST use these commands. They are the only approved interface to the
JavaScript ecosystem in this profile.

| Task | Command | Backed by |
|---|---|---|
| Install dependencies | `bun install` | Bun |
| Add a dependency | `bun add <pkg>` / `bun add -d <pkg>` | Bun |
| Remove a dependency | `bun remove <pkg>` | Bun |
| Audit dependencies | `bun audit --audit-level=high` | Bun |
| Run a one-off binary | `bunx <pkg>` | Bun |
| Generate Astro types | `bunx astro sync` | Astro |
| Format (write) | `bunx oxfmt` | Oxfmt |
| Format (check) | `bunx oxfmt --check` | Oxfmt |
| Lint | `bunx oxlint --deny-warnings` | Oxlint |
| Type check | `bunx astro check` | @astrojs/check, TypeScript 6 |
| Unit and integration tests | `bunx vitest run` | Vitest |
| Development server | `bunx astro dev` | Astro, Vite |
| Production build | `bunx astro build` | Astro, Vite |
| Run the built server | `node dist/server/entry.mjs` | Node.js 24 |

### Verified at intake

Verified 2026-09-22 on a scratch scaffold with Bun 1.3.14, Node 24.21.0, Astro 7.3.4,
@astrojs/node 11.1.6, Tailwind CSS 4.3.3, Oxlint 1.85.0, Oxfmt 0.70.0,
@astrojs/check 0.9.10, TypeScript 6.0.3, and Vitest 5.0.1. Every command in section 8
exited zero, in this order:

```bash
bun install
bunx astro sync
bunx oxfmt                         # hand-written files are not Oxfmt-clean at first
bunx oxfmt --check
bunx oxlint --deny-warnings
bunx astro check
bunx vitest run --passWithNoTests  # intake only; no tests exist yet
bunx astro build
bun audit --audit-level=high
```

The built server started with `PORT=4999 HOST=127.0.0.1 node dist/server/entry.mjs`.
It answered `200` on `/` and on an on-demand `/api/health` route.

`vitest run` MUST carry `--passWithNoTests` only until Phase 4 produces tests. From
Phase 4 onward the bare command in section 8 applies.

### TypeScript version pin

`astro check` refuses TypeScript 7 and exits 1. `typescript` MUST be pinned to `^6` as
a dev dependency. Do NOT upgrade it to 7 until `astro check` supports it and this
profile is amended.

### Prohibited tooling

* **ESLint, Prettier, and Biome are forbidden.** Oxlint and Oxfmt replace them. Do NOT
  create `.eslintrc*`, `eslint.config.*`, `.prettierrc*`, `prettier.config.*`, or
  `biome.json*`. Do NOT add these packages or any plugin for them.
* **npm, pnpm, and Yarn are forbidden.** Bun is the only package manager. Do NOT create
  `package-lock.json`, `pnpm-lock.yaml`, or `yarn.lock`. Do NOT run `npm`, `npx`, `pnpm`,
  or `yarn` in any script, workflow, Dockerfile, or document. Use `bunx`, not `npx`.
* **Vite+ (`vp`) is not used.** Astro owns the Vite configuration. Do NOT create a
  `vite.config.ts`.
* **UI framework integrations are forbidden** unless an ADR justifies one. Do NOT add
  React, Vue, Svelte, Solid, or Preact integrations. Interactivity uses `<script>` tags
  in `.astro` components with TypeScript modules under `src/lib/`.
* The lockfile is `bun.lock`. It MUST be committed and reviewed like any source file.

### Configuration

| File | Purpose |
|---|---|
| `package.json` | Scripts, dependencies, and `"packageManager": "bun@1.3.14"` |
| `astro.config.ts` | Astro, adapter, and Vite plugin configuration |
| `tsconfig.json` | Extends `astro/tsconfigs/strictest` |
| `.oxlintrc.json` | Oxlint rules, as below |

Oxfmt runs with defaults. Do NOT add an Oxfmt config file unless an ADR records why.

The `.oxlintrc.json` verified at intake:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["typescript", "unicorn", "oxc", "import"],
  "categories": { "correctness": "error", "suspicious": "error" },
  "rules": {
    "typescript/no-explicit-any": "error",
    "no-console": "error",
    "import/no-unassigned-import": ["error", { "allow": ["**/*.css"] }]
  }
}
```

The CSS allowance exists because Astro pages import the global stylesheet as a side
effect. Do NOT widen the allowance to other file types.

### Tool coverage, and the gap it leaves

Measured 2026-09-22 with deliberate defects (`any`, an unused variable, bad indentation,
`debugger`) placed in a `.ts` module and in `.astro` frontmatter.

| File type | Oxfmt formats | Oxlint lints | `astro check` type-checks |
|---|---|---|---|
| `.ts` | yes | yes | yes |
| `.astro` frontmatter | **no** | yes (`any`, `debugger`) | yes (unused variables) |
| `.astro` template markup | **no** | **no** | expressions only |
| `.css` | yes | no | no |

Consequences. Both are REQUIRED rules.

* **Logic lives in `.ts`, not in components.** Put validation, data shaping, email
  composition, and client-side behavior in `.ts` modules under `src/lib/`. Keep `.astro`
  files to markup, props, and wiring. This is where every tool actually runs.
* **`.astro` formatting and markup quality are enforced by review.** The Code Reviewer
  Agent MUST read every changed `.astro` file for inconsistent indentation, raw style
  values, inline `style=` attributes, and accessibility defects. No gate catches them.

---

## 2. SCAFFOLDING DISCIPLINE

Write project files by hand. Generator output is forbidden.

**Prohibited commands:** `bun create`, `npm create`, `create-astro`, `astro add`, and
every other project generator or integration installer. `astro add` rewrites config
files unreviewed; install with `bun add` and edit the config by hand.

**A file exists only if a requirement or a toolchain gate demands it.** If an agent
cannot name what a file is for, the file does not get created.

### Minimal file set

The project lives at the repository root. It is a single deployable.

```
<repo-root>/
├── package.json          # scripts, deps, packageManager pin
├── bun.lock              # generated by bun install, committed
├── astro.config.ts       # output static, @astrojs/node standalone, tailwind plugin
├── tsconfig.json         # extends astro/tsconfigs/strictest
├── .oxlintrc.json        # per section 1
├── .env.example          # every server variable, placeholder values
├── public/               # static files served verbatim (favicon, robots.txt)
└── src/
    ├── styles/global.css # @import "tailwindcss" and the @theme tokens only
    ├── layouts/          # page shells
    ├── components/       # .astro presentation components
    ├── lib/              # all logic, as .ts modules
    └── pages/            # one file per route; api/ holds on-demand endpoints
```

`.astro/` and `dist/` are generated and MUST be git-ignored. Create a directory only
when a requirement needs a file inside it.

---

## 3. RENDERING AND SERVER RULES

* **Static by default.** `astro.config.ts` MUST set `output: "static"`. Every page is
  prerendered at build time.
* **On-demand routes are explicit.** A route that runs per request MUST export
  `export const prerender = false;`. Only form handling, health checks, and other
  routes an FR names MAY do so. State the reason in a comment.
* **Adapter.** `@astrojs/node` in `standalone` mode. The build emits `dist/client/`
  (static assets) and `dist/server/entry.mjs` (the Node server). The CI/CD architect
  MUST containerize a Node 24 runtime, set `HOST` and `PORT`, and expose a health route.
* **Sessions.** The adapter enables filesystem session storage by default. The
  architect MUST record in an ADR whether sessions are used. If they are unused, the
  container MUST NOT depend on a writable session directory.
* **Secrets stay on the server.** Server secrets (SMTP credentials, anti-spam keys) MUST
  be read at runtime through `process.env` or `astro:env/server` inside on-demand
  modules only. Do NOT expose any secret through a `PUBLIC_` variable. Do NOT read a
  secret in a prerendered page, because the value is baked into the static HTML.
* **Input at the boundary.** Every on-demand endpoint MUST validate method, content
  type, body size, and every field before use. Invalid input MUST return a typed error
  response, never a thrown exception reaching the adapter.
* **Error handling.** Fallible functions in `src/lib/` MUST return a discriminated
  union result (`{ ok: true, value } | { ok: false, error }`) with a typed error code.
  Empty `catch` blocks are forbidden. A `catch` MUST map the error to a typed code or
  rethrow.

---

## 4. TYPESCRIPT AND COMPONENT RULES

* **Strictest config.** `tsconfig.json` MUST extend `astro/tsconfigs/strictest`.
* **No `any`.** Enforced by Oxlint in `.ts` and `.astro` frontmatter. Use `unknown` and
  narrow it.
* **Typed props.** Every `.astro` component that takes props MUST declare
  `interface Props`.
* **Naming.** `camelCase` for variables and functions. `PascalCase` for types,
  interfaces, and `.astro` component files. `kebab-case` for route files and
  `src/lib/` module files. `SCREAMING_SNAKE_CASE` for module-level constants and
  environment variable names.
* **No `set:html` with untrusted input.** Do NOT pass any value derived from a request,
  query string, or form field to `set:html`.
* **Accessibility.** Markup MUST satisfy WCAG 2.1 AA. Use semantic landmarks, labelled
  form controls, visible focus states, and meaningful `alt` text.
* **Images.** Use Astro's `<Image />` or `<Picture />` from `astro:assets` for raster
  images in `src/`. Every image MUST carry explicit `alt`.

---

## 5. STYLING RULES (TAILWIND CSS 4)

* **Design source.** The Paper design file supplied by the user is the design system.
  Tokens MUST be transcribed from it. Agents MUST NOT invent colors, type scales, or
  spacing that the design does not contain.
* **Tokens live in one place.** `src/styles/global.css` holds `@import "tailwindcss"`
  and one `@theme` block with every design token. Do NOT create a
  `tailwind.config.*` file; Tailwind 4 reads the `@theme` block.
* **No arbitrary values.** Class names MUST NOT use Tailwind arbitrary values such as
  `bg-[#0a6ed1]`, `p-[13px]`, or `text-[17px]`. Add a token instead. Verify with:
  `grep -rnE '\b[a-z-]+-\[[^]]+\]' src/` returning no matches.
* **No inline styles.** Do NOT use `style=` attributes in `.astro` files. Verify with:
  `grep -rn 'style=' src/ --include='*.astro'` returning no matches.
* **No `@apply` sprawl.** `@apply` MAY appear only in `global.css`, and only for base
  element styles the design requires.

---

## 6. DATA AND EXTERNAL SERVICES

This profile has no database. Contact enquiries are delivered by SMTP.

* **One SMTP client module.** All mail sending lives in one `src/lib/` module. The SMTP
  library MUST be chosen in an ADR and audited per the core DNA dependency rules.
* **No header injection.** Values from the form MUST NOT be placed into mail headers
  (`To`, `From`, `Subject`, `Reply-To`) without stripping CR and LF characters.
* **No persistence of personal data** unless an FR requires it and an NFR sets its
  retention period.
* **Configuration at startup.** The server MUST validate every required environment
  variable at first use and fail with a typed configuration error if one is missing.

---

## 7. LINT GATE

Code MUST pass, in this order:

```bash
bunx astro sync
bunx oxfmt --check
bunx oxlint --deny-warnings
bunx astro check
```

`astro check` MUST report zero errors, zero warnings, and zero hints.

---

## 8. STACK DEFINITION OF DONE

Supplements section 8 of the core DNA. Every command MUST exit zero.

1. `bunx astro sync` succeeds.
2. `bunx oxfmt --check` passes.
3. `bunx oxlint --deny-warnings` passes.
4. `bunx astro check` reports 0 errors, 0 warnings, 0 hints.
5. `bunx vitest run` passes.
6. `bunx astro build` succeeds and emits `dist/client/` and `dist/server/entry.mjs`.
7. The built server starts, answers its health route with `200`, and renders `/`.
8. `bun audit --audit-level=high` reports zero advisories.
9. No secret value appears in `dist/client/`. Grep the built output to confirm.
10. `grep -rnE '\b[a-z-]+-\[[^]]+\]' src/` returns no matches.
11. `grep -rn 'style=' src/ --include='*.astro'` returns no matches.
12. Every changed `.astro` file has been reviewed for formatting, raw style values, and
    accessibility. No automated gate covers `.astro` markup; see section 1.
13. `bun.lock` is committed and current. `bun install --frozen-lockfile` succeeds.
14. No prohibited config file or lockfile exists: no ESLint, Prettier, Biome, npm,
    pnpm, Yarn, `vite.config.ts`, or `tailwind.config.*` artifact.

End-to-end browser tests are expected in Phase 5. Playwright is RECOMMENDED. It was not
verified at intake. Its command MUST NOT enter a gate until Phase 5 executes it once
and amends this section.
