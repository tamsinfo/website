---
artifact: review-feature-contact-page
phase: 4
status: in-review
version: 1
updated: 2026-09-22
owner: code-reviewer
depends_on:
  - .lonewolf/stack-profile.md
  - .lonewolf/amendments.md
  - docs/03-design/api-contract.yaml
  - docs/03-design/system-architecture.md
  - docs/03-design/design-system.md
  - docs/03-design/ui-specification.md
  - docs/03-design/paper-snapshot/desktop/contact.jsx
  - docs/03-design/paper-snapshot/desktop/contact-thank-you.jsx
  - docs/03-design/paper-snapshot/mobile/contact.jsx
  - docs/03-design/paper-snapshot/mobile/contact-thank-you.jsx
  - docs/02-requirements/functional-requirements.md
  - docs/04-development/implementation-plan.md
---

# Review: feature/contact-page (TASK-005)

**Commit range:** `main..feature/contact-page` (merge base 64ea0cb): 5861dd6, c145675.
I reviewed the branch in worktree `.claude/worktrees/agent-a82bf97e634c36a81` and did not modify it. The working tree was clean after the gates ran.

## Gates run (stack profile order, in the worktree)

| Gate | Result |
|---|---|
| `bun install --frozen-lockfile` | exit 0, no changes |
| `bunx astro sync` | exit 0 |
| `bunx oxfmt --check` | exit 0, 54 files formatted |
| `bunx oxlint --deny-warnings` | exit 0 |
| `bunx astro check` | 143 files, 0 errors, 0 warnings, 0 hints |
| `bunx vitest run` | 19 files, 366 tests passed |
| `bunx astro build` | exit 0 |
| `bun audit --audit-level=high` | No vulnerabilities found |
| `grep -rnE '\b[a-z-]+-\[[^]]+\]' src/` | no matches |
| `grep -rn 'style=' src/ --include='*.astro'` | no matches |
| Secret grep of `dist/client` (TURNSTILE_SECRET, SMTP_PASSWORD) | no matches |
| Prohibited config and lockfiles | none present |
| `git diff main...feature/contact-page -- package.json bun.lock` | empty. No new dependencies. |

**Built server** (`PORT=4997 node server.ts`, with a test `TURNSTILE_SITE_KEY`):
- `/health` returned 200.
- `/contact` with `CF-IPCountry: SG` returned 200, `cache-control: private, no-store`, and Phone `value="+65 "`.
- `/contact` with no header rendered Phone `value="+91 "`.
- The CSP header on `/contact` carried `frame-src https://challenges.cloudflare.com https://www.google.com`, and `script-src` included `https://challenges.cloudflare.com`. A non-contact response still carried `frame-src 'none'`.
- The rendered HTML contained no Google URL outside the bundled map-loader script. The thank-you `<dd>` values were rendered empty, so no snapshot demo values ship.
- `data-sitekey` was escaped as an attribute.

**Not verified:** in-browser behavior. Playwright is not in the gate before Phase 5, so I did not run a browser. That covers whether the Turnstile widget renders under the page's `style-src` hash policy, live-region announcements in a real screen reader, and visual match against the snapshot at pixel level. Copy strings were cross-checked against the snapshot with grep and all matched.

## Contract adherence (submitContactEnquiry, caller side)

- **Request:** `POST /api/contact`, `Content-Type: application/json`. The body is the validated `ContactSubmission` plus `turnstileToken`. An untouched calling-code prefill is sent as `phone: ""`. Matches the schema.
- **200:** requires `status === "sent"` and a `reference` that matches `REFERENCE_PATTERN`. Anything else maps to FR-038. Correct.
- **Errors:** branches only on `code`, through `isErrorCode` against the shared enum:
  - `VALIDATION_FAILED` renders inline errors, filtered to known `FieldName` and `FieldErrorMessage` values. An empty list falls back to FR-038.
  - `RATE_LIMITED` shows the FR-049 banner.
  - `SPAM_CHECK_FAILED`, `SEND_FAILED`, `PAYLOAD_TOO_LARGE`, `UNSUPPORTED_MEDIA_TYPE`, and `METHOD_NOT_ALLOWED` show the FR-038 banner.
  - An unknown code, a non-JSON body, a 500, a network error, or the timeout also shows FR-038.
  - Every row of ui-specification §7.1 matches.

## Focus areas checked

- **15 s AbortController:** `setTimeout` aborts the controller. The deadline also covers `response.json()`, and the timer is cleared in `finally`. Tested with fake timers: nothing settles at 14 999 ms, and the request times out at 15 000 ms.
- **Double submit (FR-040):** the guard `state.phase !== "editing"` runs before any await. The button gets `aria-disabled`, `aria-busy`, and `aria-disabled:opacity-40 pointer-events-none`. Tested: three calls produce one fetch.
- **Values preserved:** no state path writes to the fields except `reset()` (FR-055).
- **Focus:**
  - The first invalid field in field order gets focus, for client and server errors.
  - The thank-you `<h1 tabindex="-1">` gets focus on 200.
  - Name gets focus after "Send another message".
- **ARIA:**
  - `aria-invalid` and `aria-describedby="contact-<field>-error"` are set and cleared.
  - The polite summary region and the assertive banner region are in the DOM at load, so their updates are announced.
  - `[hidden]` is enforced by Tailwind preflight with `!important`, so `class="flex"` on the hidden panels does not unhide them.
- **FR-041:** the button renders `type="button"`. The form has four fields that block implicit submission, so pressing Enter without JavaScript sends nothing. The JavaScript upgrade to `type="submit"` is sound. **Accepted.**
- **Map (FR-017, FR-018):**
  - The iframe is created only inside a `{ once: true }` click handler.
  - There is no storage API anywhere in the diff.
  - The frame keeps `h-map-height`.
  - The iframe attributes match SCR-004.
- **XSS:** there is no `set:html`, `innerHTML`, or `insertAdjacentHTML` in `src/`. Thank-you rows and messages use `textContent`.
- **Tokens:**
  - Every utility used resolves against `@theme`. `--color-*: initial` is set, and each class was confirmed in the compiled CSS.
  - The derived tokens use the approved shorthand `border-(length:--border-width-thick)` and `size-(--size-icon-xl)`.
- **Tests:** each test builds a fresh harness, and `afterEach` restores real timers. They cover every error code, the timeout, double submit, the thank-you rows (including the trimmed email), and the FR-055 reset (prefill, empty Interest, token reset, focus on Name).

## Implementer-declared deviations

| Deviation | Judgment |
|---|---|
| Send is `type="button"`, and JavaScript upgrades it to submit | Accepted. This is the mechanism that satisfies FR-041. |
| Turnstile `api.js` is inserted by the client module | Accepted. The origin is in `script-src`, `render=explicit` is used, and it respects ADR-002 on processed scripts. |
| Token is reset after every failed submission | Accepted. Siteverify tokens are single-use, and FR-055 requires a fresh token. See L-1. |
| `tel:` and `mailto:` links | Accepted. FR-005 content is unchanged and still visible without JavaScript. The global focus-visible style applies. |
| "Select an interest", "N fields need attention." | Accepted. Both are verbatim from SCR-004. |
| Two `<h1>` elements in state D | Accepted. SCR-004 prescribes the hero H1 as constant and "That is with us." as an H1. |

## Gate-blind files checked by hand (.astro template markup)

Files: `contact.astro`, `ContactForm.astro`, `FormField.astro`, `MapCard.astro`, `OfficeDetails.astro`, `ThankYouPanel.astro`.

Results:
- **Indentation:** consistent two-space indentation.
- **Styles:** no `style=`, no arbitrary values, no hex or px in classes.
- **Props:** `interface Props` is declared where props exist.
- **Accessibility:**
  - Every control has a `<label for>`.
  - Decorative SVGs carry `aria-hidden` and `focusable="false"`.
  - The spinner is `aria-hidden`.
  - `dl`/`dt`/`dd` are used correctly, with `div` groups.
  - Every button has an accessible name.
- **SVG geometry:** raw SVG geometry attributes (`stroke-width`, `viewBox`, rect coordinates) in MapCard and ThankYouPanel are illustration geometry, not style values, and are consistent with prior accepted components.
- **Frontmatter:** no `any` or `debugger`.

## Findings

### [low] Immediate retry after a failure is sent with an empty Turnstile token

**File:** src/lib/contact-form-state.ts:289, src/lib/turnstile-client.ts:98-101
**Requirement:** FR-029, FR-038
**Problem:** After any non-accepted outcome, `resetToken()` clears the token synchronously, and the widget issues a new one asynchronously. The Send button re-enables at once. A visitor who clicks Send again inside that refresh window sends `turnstileToken: ""`, and the server answers 403 `SPAM_CHECK_FAILED`.
**Consequence:** The visitor sees the FR-038 banner a second time for no fault of their own. The loop recovers once the token arrives, and the FR-029 edge case allows a submission without a token to fail. This is a UX wart, not a requirement breach.
**Fix (optional):** In state C, wait briefly for a fresh token, bounded by the existing timeout, before posting.

## Counts

critical 0 · high 0 · medium 0 · low 1

APPROVED
