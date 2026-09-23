---
artifact: review-feature-foundation
phase: 4
status: in-review
version: 1
updated: 2026-09-22
owner: code-reviewer
depends_on:
  - .lonewolf/stack-profile.md
  - docs/03-design/system-architecture.md
  - docs/03-design/data-model.md
  - docs/02-requirements/functional-requirements.md
  - docs/02-requirements/non-functional-requirements.md
  - docs/04-development/implementation-plan.md
---

# Review: feature/foundation (TASK-001)

**Commit range:** `main..feature/foundation` (e60c569, 440398d, 2048ba5, 3cab725)
**Worktree:** `.claude/worktrees/agent-ad5cdeacddc292254`

## Verdict

APPROVED

Counts: critical 0, high 0, medium 1 (pending user decision, already escalated), low 3.

## Gates run by the reviewer (worktree, profile section 8 order)

| # | Command | Result |
|---|---|---|
| 13 | `bun install --frozen-lockfile` | exit 0, no changes |
| 1 | `bunx astro sync` | exit 0 |
| 2 | `bunx oxfmt --check` | exit 0, 18 files (depends on `.prettierignore`, see M-1) |
| 3 | `bunx oxlint --deny-warnings` | exit 0 |
| 4 | `bunx astro check` | 0 errors, 0 warnings, 0 hints |
| 5 | `bunx vitest run` | 5 files, 138 tests passed |
| 6 | `bunx astro build` | exit 0, emits `dist/client/`, `dist/server/entry.mjs`, `dist/_headers.json` |
| 7 | `PORT=4977 HOST=127.0.0.1 node server.ts` | `/health` 200 `ok`, `Cache-Control: no-store`, `text/plain; charset=utf-8`, Referrer-Policy and CSP present. `/` returns 404 (no index page until TASK-004; known, not a defect of this branch) |
| 8 | `bun audit --audit-level=high` | No vulnerabilities found |
| 9 | grep secrets in `dist/client/` | no matches |
| 10 | arbitrary-value grep | no matches |
| 11 | `style=` grep in `.astro` | no matches |
| 14 | prohibited config/lockfile check | none present (`.prettierignore` see M-1) |
| — | `docker build -f deploy/Dockerfile .` | success; container answered `/health` 200 with Referrer-Policy, stopped cleanly on SIGTERM |

Server probes (ADR-002, ADR-003): `/health/` 301 to `/health`; `/unknown`, `/404.html`,
`/about/index.html`, `/about/index%2Ehtml`, `/x.HTM`, `/%E0%A4%A` all 404 with the
fallback CSP and Referrer-Policy; `POST /health` 404; SIGTERM closed the process.
CSP carries every ADR-002 directive including AMD-003 `connect-src` and script origins,
and `frame-src 'none'` on the fallback.

## Contract and ADR adherence

* getHealth: 200, body `ok`, `Cache-Control: no-store`, `text/plain`. Matches.
* `api-types.ts`: ErrorCode enum and status mapping match `components.schemas.ErrorCode`
  exactly; ErrorBody enforces `fieldErrors` iff VALIDATION_FAILED; reference pattern
  matches `ContactAccepted.reference`; HealthStatus `ok`.
* `contact-validation.ts`: the seven messages match `FieldErrorMessage` byte for byte;
  field names match `FieldName`; form order preserved; non-object body yields empty
  `fieldErrors`; trim then code-point count; non-string present value fails; `interest`
  compared without trim; unknown properties ignored; turnstileToken not treated as a
  field. Boundaries 100/101, 150/151, 254/255, 20/21, 19/20/4000/4001 verified by tests.
* ADR-003 `trailingSlash: "never"`, ADR-009 `session: false`, ADR-014
  `checkOrigin: false`, 5.1 `bodySizeLimit: 65536`, section 2 `build.format: "directory"`.
* ADR-006: imports only the three named functions from `libphonenumber-js/min`.
  `IN`→+91, `SG`→+65, `US`/`CA`→+1, `XX`/`T1`/`ZZ`→+91 tested.
* ADR-015: all seven mail variables, SMTP_PORT 1..65535, first complete read cached,
  error names variables without values; TURNSTILE_SITE_KEY read per request.
* `http-hardening.ts` imports no project module, as the Dockerfile requires.

## Findings

### [medium] `.prettierignore` acts as an Oxfmt configuration file without an ADR

**File:** .prettierignore:1
**Requirement:** stack-profile section 1, "Oxfmt runs with defaults. Do NOT add an Oxfmt config file unless an ADR records why"; "Prohibited tooling" (Prettier artifacts)
**Problem:** The file changes Oxfmt's file set. No ADR records it, and its name belongs
to a prohibited tool family.
**Consequence:** Gate 2 passes only because of an unrecorded configuration. Already
escalated to the user as BLOCKED; not counted as blocking per orchestrator instruction.
**Fix:** Per the user's decision: record an ADR/profile amendment, or scope the gate.

### [low] Generic `Result` type is exported but unused

**File:** src/lib/api-types.ts:6
**Requirement:** skill step 9 (unused code); core DNA Rule of Three
**Problem:** `ValidationResult` (contact-validation.ts:40), `ConfigurationResult`
(runtime-config.ts:16), and `FallbackCspResult` (http-hardening.ts:19) each redeclare the
union instead of using it. Nothing imports `Result`.
**Consequence:** Two sources for one shape; TASK-002 may pick either.
**Fix:** Use it, or remove it.

### [low] SIGINT handler not required by ADR-002

**File:** server.ts:47
**Requirement:** ADR-002 rule 4 names SIGTERM only
**Problem:** Minor unrequested behavior.
**Consequence:** Negligible; recorded for traceability.
**Fix:** Keep with a one-line reason, or remove.

### [low] Two `build` commits omit a scope

**File:** commits e60c569, 440398d
**Requirement:** core DNA section 3, `<type>(<scope>): <short description>`
**Problem:** Subjects are `build: ...` without `(<scope>)`.
**Consequence:** Deviates from the DNA template; valid Conventional Commits 1.0.0.
**Fix:** Use a scope in future commits. No history rewrite needed.

## Gate-blind files checked by hand

`src/pages/404.astro` (only `.astro` file): consistent two-space indentation; no `style=`,
no raw style values, no arbitrary classes, no `set:html`, no `is:inline` script; `lang`
set, `<main>` landmark, one `<h1>`, descriptive link text. No `any`/`debugger` in
frontmatter. No defects.

## Other checks

* Dependencies pinned exactly (typescript `^6` as the profile mandates); every package
  in the Ownership rules present; no forbidden tooling or UI integration.
* No secrets in source; `.env.example` pre-exists on main with placeholders.
* No AI attribution trailers; subjects at most 68 characters, imperative, no period;
  each body cites TASK-001.
* No `console`, `debugger`, `any`, lint suppression, or empty catch in the diff; every
  catch maps to a typed code or boolean decision with a stated reason.
