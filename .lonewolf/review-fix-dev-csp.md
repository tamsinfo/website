---
artifact: review-fix-dev-csp
phase: 4
status: in-review
version: 1
updated: 2026-09-23
owner: code-reviewer
depends_on:
  - docs/03-design/system-architecture.md
  - docs/04-development/implementation-plan.md
---

# Review: fix/dev-csp (G4 revision request 1, TASK-001 astro.config.ts)

**Commit range:** `main..fix/dev-csp`, one commit: `9941a60 fix(config): skip the CSP under astro dev so dev styles load`.
**Diff:** `astro.config.ts` only (+27 / -18).

Everything was verified in scratch copies built with `git archive` from `main` and from
`fix/dev-csp`, so the worktree was not touched. Every server ran on port 4991 and was stopped
by PID. Port 4321 was not touched.

## Verdict

CHANGES REQUESTED — 1 blocking finding

## Findings

### HIGH-1: `astro build` can emit a production build with no CSP, exit 0, and print no warning

- **File:** `astro.config.ts:16` (`const IS_DEV_SERVER = process.env["NODE_ENV"] === "development" && process.argv.includes("dev");`), and the comment at `astro.config.ts:14-15`.
- **Violates:** NFR-011 ("Every HTML response MUST carry a Content-Security-Policy header"), NFR-012, and NFR-026. It also violates ADR-002 (system-architecture.md), which says the build writes each route's CSP to `dist/_headers.json`.
- **Evidence:** I added a debug print to a scratch copy and ran
  `NODE_ENV=development bunx astro build --mode dev`. The config saw
  `argv = [node, .bin/astro, "build", "--mode", "dev"]` and set `IS_DEV_SERVER = true`.
  The build exited 0 and wrote `dist/_headers.json` as `[]`, with zero
  `Content-Security-Policy` entries. Astro only sets `NODE_ENV` when it is unset
  (`ensureProcessNodeEnv` in `node_modules/astro/dist/core/util.js`), so an inherited
  `NODE_ENV=development` reaches the config unchanged. `process.argv.includes("dev")` matches
  any argv element that is exactly `dev`: a `--mode dev` value, a positional argument, or
  a wrapper script's argument. It does not check which Astro command is running.
- **Consequence:** A CSP-less production artifact is built with no error. `node server.ts`
  fails closed (verified: it throws `Cannot start: ... for dist/_headers.json` at
  `server.ts:27`), so the documented start path does not serve it. But that is a separate
  component catching a defect this diff introduced. Anything that runs `dist/server/entry.mjs`
  directly, or deploys `dist/client` statically, would serve with no CSP. The intent
  comment's claim that "`astro build` always emits the full policy" is false.
- **Fix required:** Decide based on the Astro command, not on scanning argv for a value.
  Options, from most to least explicit:
  1. A small inline integration whose `astro:config:setup` hook reads the `command`
     argument Astro provides (`"dev" | "build" | "preview" | "sync"`) and calls
     `updateConfig({ security: { csp: false } })` only when `command === "dev"`. Astro's
     `mergeConfigRecursively` replaces non-object values, so `false` should override. The
     implementer MUST confirm this with a build and a dev run, because I did not.
  2. At minimum, check the positional command rather than any element, for example the
     first non-flag argument after the `astro` bin equals `dev`. Keep the NODE_ENV condition
     as a second check.
  Then re-run `NODE_ENV=development bunx astro build --mode dev` and confirm that
  `dist/_headers.json` matches the normal build, and fix the comment to match.

No other findings.

## Verification performed

1. **Production policy unchanged.** `bunx astro build` on main and on the branch produced
   byte-identical `dist/_headers.json`. I served each with `node server.ts` on 4991 and
   compared `Content-Security-Policy` headers (nonces normalised) for `/` (200), `/about`
   (200), `/contact` (200), and `/nope` (404). They were identical between main and branch.
2. **Other production paths.** `NODE_ENV=development astro build` (no extra args) and
   `NODE_ENV=development astro build --mode development` both produced headers identical
   to the normal build. `NODE_ENV=development astro build --mode dev` produced no CSP
   (HIGH-1). A filesystem path containing "dev" as a substring does NOT trigger it, because
   `includes` compares whole elements. `node server.ts` does not evaluate `astro.config.ts`,
   and it refuses to start without a CSP in `_headers.json`. `astro preview` serves
   the built output, so its policy is whatever the build emitted.
3. **Dev behaviour.** Under `astro dev` on 4991, main sent a CSP header on `/` and the branch
   sent none. The fix does what it intends in dev.
4. **ADR-002 / NFR-011/012/013/026 in production.** With a normal build, the policy served
   is identical to main, which the orchestrator already verified. Referrer-Policy comes from
   `server.ts`, which this diff does not change.
5. **Intent comment.** Present at `astro.config.ts:11-15`. It is inaccurate about builds
   (see HIGH-1).
6. **Scope.** The diff touches only the CSP toggle. There is no scope creep.

## Gates (run on the branch copy, profile section 8 order)

| Gate | Result |
|---|---|
| `bunx astro sync` | exit 0 |
| `bunx oxfmt --check` | exit 0 |
| `bunx oxlint --deny-warnings` | exit 0 |
| `bunx astro check` | 0 errors, 0 warnings, 0 hints |
| `bunx vitest run` | 651 passed (651) |
| `bunx astro build` | exit 0; `dist/client/` and `dist/server/entry.mjs` present |
| `node server.ts` health / render | `/health` 200, `/` 200 |
| `bun audit --audit-level=high` | No vulnerabilities found |
| secret grep of `dist/client/` | no matches (no env values present in scratch copy) |
| arbitrary-value grep on `src/` | 0 matches |
| `style=` grep on `src/**/*.astro` | 0 matches |
| `bun install --frozen-lockfile` | exit 0 |
| prohibited config files | none present |

Gate-blind files: none. The only changed file, `astro.config.ts`, is covered by oxfmt,
oxlint, and astro check.
