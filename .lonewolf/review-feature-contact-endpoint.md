---
artifact: review-feature-contact-endpoint
phase: 4
status: in-review
version: 1
updated: 2026-09-22
owner: code-reviewer
depends_on:
  - .lonewolf/stack-profile.md
  - docs/03-design/api-contract.yaml
  - docs/03-design/system-architecture.md
  - docs/03-design/data-model.md
  - docs/02-requirements/functional-requirements.md
  - docs/02-requirements/non-functional-requirements.md
  - docs/04-development/implementation-plan.md
---

# Review: feature/contact-endpoint (TASK-002)

**Commit range:** `main..feature/contact-endpoint` (06eaba1, c886f91, cbb626c, c7008df).
HEAD `c7008dfd6354e306325880b28c6cc186be179b74`, reviewed in worktree
`.claude/worktrees/agent-a5a614b8a28e63f12`.

**Counts:** critical 0, high 0, medium 1, low 2.

## Gates (run by the reviewer, in profile order)

| Command | Result |
|---|---|
| `bunx astro sync` | exit 0 |
| `bunx oxfmt --check` | exit 0 |
| `bunx oxlint --deny-warnings` | exit 0 |
| `bunx astro check` | exit 0; 102 files, 0 errors, 0 warnings, 0 hints |
| `bunx vitest run` | exit 0; 14 files, 273 tests passed |
| `bunx astro build` | exit 0 |
| `bun audit --audit-level=high` | exit 0; no vulnerabilities |
| `bun install --frozen-lockfile` | exit 0; no changes |
| Arbitrary-value grep, `style=` grep | no matches |
| Secrets grep of `dist/client/` | no matches |
| Prohibited config or lockfile | none present |

Live HTTP smoke test against the built server (`node server.ts`, port 4987, no mail
configuration): GET, HEAD, OPTIONS, PUT, DELETE, PATCH gave 405 with `Allow: POST`;
`text/plain` gave 415; 65,537 bytes gave 413 with `Content-Length` and with chunked
transfer; `[]` gave 400 with `fieldErrors: []`; a CR/LF name gave 400 in form order;
a valid body with no configuration gave 502 `SEND_FAILED`; six `text/plain` POSTs
from one IP gave 415 six times (415 precedes 429). Every request wrote exactly one
log line with no field value or IP; the configuration line carried
`detail: missing: <names>` only.

Not run: gate 7 "renders `/`" (awaits TASK-004, per the orchestrator). No real SMTP
relay or Siteverify call was made; both are faked in tests.

## Checks performed with no finding

* Contract: status codes, error codes, `Allow: POST`, `ContactAccepted` shape,
  `fieldErrors` present only for `VALIDATION_FAILED`, no reference on 502, no CORS
  headers (ADR-014).
* FR-053 order and ADR-005 hit recording after the method check; Siteverify skipped on
  earlier failure; configuration check before Siteverify (ADR-015).
* Header injection: C-10 rejects control characters; C-14 strips CR/LF again for every
  header value. RFC 2047 encoding tested against the real Nodemailer composer.
* Envelope: explicit `{from: MAIL_FROM, to: SALES_MAILBOX}`; Reply-To not in envelope
  (FR-035), tested.
* Logging: only C-16 writes; entry rebuilt from `time`, `outcome`, `detail`; errors not
  logged; marker test covers fields, IP, token, reference, SMTP error text, secrets.
* Body limit: `Content-Length` rejected unread; stream stopped at byte 65,537; read
  error maps to 413 (architecture 5.1).
* Rate limiter matches ADR-005 steps 1 to 4, capped at 10,000 keys, 5 times per key.
* Turnstile: token shape checked without network; `AbortSignal.timeout(3000)` covers
  fetch and body; every failure path returns `SPAM_CHECK_FAILED`.
* Reference: `crypto.randomInt(32)`, Asia/Kolkata year, tested at the year boundary.
* No dependency, config, or TASK-001-owned file changed. Commits are Conventional,
  reference TASK-002, and carry no AI trailer.
* Tests reset modules per test (fresh limiter and config cache) and do not depend on
  order.

## Gate-blind files

The diff contains no `.astro` or `.css` file. All changed files are `.ts`, which every
gate covers. I also grepped the added lines by hand for `any`, `console`,
`Math.random`, `debugger`, lint-disable comments, and `@ts-` directives: none.

## Findings

### [medium] SMTP deadline "close" does not stop an in-flight send

**File:** src/lib/smtp-sender.ts:101
**Requirement:** FR-030, FR-034; ADR-004
**Contract:** api-contract.yaml, submitContactEnquiry, "Side effects: No other status
sends email"
**Problem:** When the 8,000 ms timer wins, the code calls `transport.close()` as ADR-004
requires. In nodemailer 10.0.10, `SMTPTransport.close()`
(`dist/esm/smtp-transport/index.js:332`) only emits `close`. It does not destroy the
socket. The in-flight `sendMail` continues until its own socket timeout, and the relay
can still accept the message.
**Consequence:** A slow relay can deliver an email for a request that got 502. The
visitor retries and the sales mailbox gets a duplicate. The code follows ADR-004
literally; the ADR assumes `close()` aborts the send. SMTP cannot fully close this race
anyway (the relay can accept DATA after the client gives up).
**Fix:** Orchestrator decision. Either record it as a known limitation or route it to
`/lonewolf:amend` against ADR-004. Not blocking: the code matches the frozen design.

### [low] Cancel error suppressed in the body reader

**File:** src/lib/request-body.ts:51
**Requirement:** Stack profile section 3 (catch MUST map or rethrow)
**Problem:** `reader.cancel().catch(() => undefined)` discards the cancel error.
**Consequence:** None visible. The result is already the typed `PAYLOAD_TOO_LARGE`, and
the comment explains why. Listed only because the profile bans suppression.
**Fix:** Optional. Keep it with the comment, or map the error explicitly.

### [low] Redundant POST export

**File:** src/pages/api/contact.ts:32
**Requirement:** none (simplification)
**Problem:** `export const POST: APIRoute = ALL;` repeats a handler that `ALL` already
serves for POST.
**Consequence:** One more export to keep in sync. No behavior change.
**Fix:** Optional. Remove it, or add a comment saying why it exists.

## Verdict

APPROVED
