---
artifact: non-functional-requirements
phase: 2
status: approved
version: 3
updated: 2026-09-22
owner: nfr-analyst
depends_on:
  - docs/01-planning/project-charter.md
  - docs/01-planning/mvp-scope.md
  - docs/00-intake/tech-stack.md
  - .lonewolf/stack-profile.md
---

# Non-Functional Requirements: TAMS Infotech Website V1

All thresholds come from `.lonewolf/interviews/02-non-functional.md` and the audit round 1
decisions in `.lonewolf/interviews/02-functional.md`. The user confirmed every value.

**Lighthouse run conditions.** "Lighthouse mobile" means the current Lighthouse release, mobile
form factor, default simulated throttling, run against the production build served by
`node dist/server/entry.mjs`. Each page's score is the median of 3 runs.

**Page set.** "Every page" means every route in FR-001 through FR-009, plus FR-046 and
FR-047 once shipped.

---

## Performance

### NFR-001: Lighthouse mobile performance score

**Status:** draft
**Priority:** must
**Source:** docs/01-planning/project-charter.md#6-success-metrics

**Requirement.** Every page MUST score at least 90 in the Lighthouse mobile performance
category.

**Measurement:** Lighthouse mobile performance score >= 90 per page, median of 3 runs,
under the run conditions above.

**Edge cases.**
- Contact page after "Load map": the measurement MUST exclude it. The map loads only
  on request.

### NFR-002: Largest Contentful Paint

**Status:** draft
**Priority:** must
**Source:** .lonewolf/interviews/02-non-functional.md

**Requirement.** Every page MUST reach Largest Contentful Paint within 2.5 seconds.

**Measurement:** Lighthouse mobile LCP <= 2.5 s per page, median of 3 runs.

**Edge cases.**
- Pages with a large hero image: the image MUST count toward LCP.

### NFR-003: Cumulative Layout Shift

**Status:** draft
**Priority:** must
**Source:** .lonewolf/interviews/02-non-functional.md

**Requirement.** Every page MUST keep Cumulative Layout Shift at or below 0.1.

**Measurement:** Lighthouse mobile CLS <= 0.1 per page, median of 3 runs.

**Edge cases.**
- Web font swap: it MUST count toward CLS.
- Contact form state change to thank-you: it follows user input. The measurement MUST
  NOT include it.

### NFR-004: Page weight

**Status:** draft
**Priority:** must
**Source:** docs/01-planning/project-charter.md#6-success-metrics

**Requirement.** The first load of every page MUST transfer at most 1 MB, including
HTML, CSS, JavaScript, fonts, and images.

**Measurement:** Lighthouse "total byte weight" <= 1,048,576 bytes per page, with an
empty cache.

**Edge cases.**
- Turnstile script on Contact: it MUST count toward the total.

### NFR-005: Contact endpoint response time

**Status:** draft
**Priority:** must
**Source:** docs/01-planning/mvp-scope.md#scope-contact-form

**Requirement.** The contact endpoint MUST respond to 95% of valid submissions within
5 seconds, SMTP time included.

**Measurement:** p95 server response time <= 5 s over 50 valid submissions against a
test SMTP server with 1 s acceptance delay, measured by a scripted client with
Turnstile test keys. The client MUST send each group of 5 requests with a distinct
`CF-Connecting-IP` value, so FR-042 does not reject them.

**Edge cases.**
- SMTP timeout path: FR-030 bounds it at 8 s. The p95 sample MUST exclude it.

---

## Scale

### NFR-006: Concurrent visitors

**Status:** draft
**Priority:** must
**Source:** docs/01-planning/project-charter.md#4-goals

**Requirement.** One container MUST serve 200 concurrent visitors without an error
response. This covers 50 at launch and 200 at 12 months.

**Measurement:** Load test with 200 virtual users requesting page routes for 5 minutes
against one container. Error rate 0%.

**Edge cases.**
- Contact endpoint under load: FR-042 applies per IP address. The load test MUST use
  page routes only.

### NFR-025: Page response time at the origin

**Status:** draft
**Priority:** must
**Source:** .lonewolf/interviews/02-functional.md

**Requirement.** The origin MUST answer page routes within 500 ms at the 95th
percentile under the NFR-006 load.

**Measurement:** p95 response time <= 500 ms in the NFR-006 load test, measured at the
origin, not through Cloudflare.

**Edge cases.**
- `/contact` renders per request (FR-024): it MUST meet the same threshold.

### NFR-007: Maximum submission size

**Status:** draft
**Priority:** must
**Source:** docs/01-planning/mvp-scope.md#scope-contact-form

**Requirement.** The contact endpoint MUST reject any request body larger than 64 KB
before it parses the body.

**Measurement:** POST with a 65,537-byte body returns 413. POST with a 65,536-byte valid
body is not rejected for size. Confirmed with the user in audit round 1.

**Edge cases.**
- Missing `Content-Length` with a streamed body: the server MUST stop reading at 64 KB
  and return 413.
- 4000-character message in 4-byte characters plus every other field at maximum: the
  body MUST fit within the limit.

---

## Availability

### NFR-008: Monthly uptime

**Status:** draft
**Priority:** must
**Source:** docs/01-planning/project-charter.md#4-goals

**Requirement.** The site MUST be available at least 99.5% of each calendar month.

**Measurement:** External uptime check of `/health` every 5 minutes. Monthly success
ratio >= 99.5%.

**Edge cases.**
- Planned redeploys MUST count as downtime.
- Owner: the user runs the uptime check with Cloudflare Health Checks or an equivalent
  monitor. Confirmed with the user.

### NFR-009: Recovery time

**Status:** draft
**Priority:** must
**Source:** docs/01-planning/project-charter.md#4-goals

**Requirement.** The maintainer MUST be able to restore service within 30 minutes of a
failure by redeploying a known good image.

**Measurement:** Timed drill: stop the container, redeploy the previous image tag,
`/health` returns 200. Elapsed time <= 30 minutes.

**Edge cases.**
- No data restore is needed. The system stores no data (FR-034).

### NFR-010: Health endpoint

**Status:** draft
**Priority:** must
**Source:** docs/01-planning/project-charter.md#4-goals

**Requirement.** The system MUST answer `GET /health` with HTTP 200 while the server
is running.

**Measurement:** `curl -s -o /dev/null -w '%{http_code}' <host>/health` prints `200`
within 1 second.

**Edge cases.**
- SMTP unavailable: `/health` MUST still return 200. It reports process health only.

---

## Security

### NFR-011: Content Security Policy

**Status:** draft
**Priority:** must
**Source:** docs/01-planning/mvp-scope.md#scope-contact-form

**Requirement.** Every HTML response MUST carry a `Content-Security-Policy` response
header whose `script-src` allows only the site origin, `https://challenges.cloudflare.com`,
and `https://static.cloudflareinsights.com`. Its `connect-src` MUST allow only the site
origin and `https://cloudflareinsights.com`. Amended by AMD-003.

**Measurement:** Header present on every page route, including prerendered pages. The
`script-src` directive lists no other origin and contains neither `'unsafe-eval'` nor
`'unsafe-inline'`.

**Edge cases.**
- Inline scripts that Astro emits: the policy MUST allow them by hash only.
- Cloudflare Web Analytics: the user keeps automatic injection on. Rocket Loader and
  Email Address Obfuscation MUST stay off, because they inject scripts the policy blocks.
  The user owns these Cloudflare settings.
- Prerendered pages: Phase 3 MUST record an ADR naming how response headers reach
  static files, and MUST prove it on a test build before Gate G3.

### NFR-026: Frame sources on the Contact page

**Status:** draft
**Priority:** must
**Source:** docs/01-planning/mvp-scope.md#scope-contact-form

**Requirement.** The CSP `frame-src` on `/contact` MUST allow only
`https://challenges.cloudflare.com` and `https://www.google.com`. On every other page it
MUST be `'none'`.

**Measurement:** `frame-src` on `/contact` lists exactly those two origins. `frame-src`
on every other page route equals `'none'`. Every page sets `default-src 'self'`.

**Edge cases.**
- The Google Maps embed uses no script and no API key (FR-017).

### NFR-012: Framing protection

**Status:** draft
**Priority:** must
**Source:** docs/01-planning/mvp-scope.md#scope-contact-form

**Requirement.** Every HTML response MUST forbid framing by other origins.

**Measurement:** The `Content-Security-Policy` response header carries
`frame-ancestors 'none'` on every page route. A `<meta>` tag MUST NOT be the only source.

**Edge cases.**
- None identified. The site embeds itself nowhere.

### NFR-013: Referrer policy

**Status:** draft
**Priority:** must
**Source:** docs/01-planning/mvp-scope.md#scope-contact-form

**Requirement.** Every response MUST carry `Referrer-Policy: strict-origin-when-cross-origin`.

**Measurement:** Header present with that exact value on every route. Confirmed with the
user in audit round 1.

**Edge cases.**
- None identified.

### NFR-014: Non-root container

**Status:** draft
**Priority:** must
**Source:** docs/00-intake/tech-stack.md

**Requirement.** The container MUST run the server as a non-root user.

**Measurement:** `docker run --rm <image> id -u` prints a value other than `0`.

**Edge cases.**
- None identified.

### NFR-015: Secrets from environment only

**Status:** draft
**Priority:** must
**Source:** docs/00-intake/tech-stack.md

**Requirement.** SMTP credentials, the Turnstile secret key, the Turnstile site key,
the sales mailbox address, and the sender address MUST come from environment variables
at runtime.

**Measurement:** Grep of the repository and of `dist/` for each configured value returns
no match. `.env.example` lists every variable with a placeholder.

**Edge cases.**
- A required variable is missing: the contact endpoint MUST return `SEND_FAILED`. Its
  single NFR-018 log line MUST name the missing variable, never a value.

### NFR-016: Self-hosted fonts

**Status:** draft
**Priority:** must
**Source:** docs/01-planning/project-charter.md#assumptions

**Requirement.** The site MUST serve Archivo, Inter, and IBM Plex Mono from its own origin.

**Measurement:** A full page load of every page makes no request to
`fonts.googleapis.com`, `fonts.gstatic.com`, or any other font host.

**Edge cases.**
- None identified.

### NFR-017: No personal data in logs

**Status:** draft
**Priority:** must
**Source:** docs/01-planning/mvp-scope.md#scope-contact-form

**Requirement.** The system MUST NOT write any submitted field value or visitor IP
address to any log.

**Measurement:** Submit a form with unique marker strings in every field. Grep the
container log output for each marker and the client IP address: zero matches.

**Edge cases.**
- Error stack traces from the SMTP client: the log MUST NOT include the message body.

---

## Observability

### NFR-018: Submission outcome logging

**Status:** draft
**Priority:** must
**Source:** docs/01-planning/mvp-scope.md#scope-contact-form

**Requirement.** The server MUST write exactly one JSON log line to standard output per
contact endpoint request.

**Measurement:** Each request produces one line with an ISO 8601 `time`, an optional
`detail` naming a missing configuration variable, and an `outcome` from: `sent`, `invalid`, `rate_limited`, `spam_check_failed`, `send_failed`,
`payload_too_large`, `unsupported_media_type`, `method_not_allowed`.

**Edge cases.**
- Log retention: the hosting platform owns it.
- Alerting: none in V1. Confirmed with the user.

---

## Compatibility and accessibility

### NFR-019: Supported browsers

**Status:** draft
**Priority:** must
**Source:** docs/01-planning/project-charter.md#3-primary-persona

**Requirement.** Every page and the contact form MUST work in the latest two major
versions of Chrome, Edge, Firefox, and Safari, in Safari on iOS 16 or later, and in
Chrome on Android.

**Measurement:** The Phase 5 end-to-end suite passes with 0 failures in Chromium,
branded Microsoft Edge, Firefox, WebKit, and the WebKit mobile emulation profile, each
at its current stable version. The build target list MUST cover the previous major
version of each browser. The user runs one manual form submission on a physical iPhone
and one on a physical Android phone. Confirmed with the user in audit round 2.

**Edge cases.**
- Older browsers: the system has no support obligation.

### NFR-020: Minimum viewport

**Status:** draft
**Priority:** must
**Source:** docs/01-planning/mvp-scope.md#scope-responsive-layout

**Requirement.** Every page MUST render without horizontal scrolling at 360 px width.

**Measurement:** At a 360 px viewport, `document.documentElement.scrollWidth` equals
`clientWidth` on every page.

**Edge cases.**
- Below 360 px: the system has no obligation.

### NFR-021: WCAG 2.1 AA conformance

**Status:** draft
**Priority:** must
**Source:** docs/01-planning/project-charter.md#6-success-metrics

**Requirement.** Every page MUST conform to WCAG 2.1 level AA.

**Measurement:** axe-core reports zero violations at the `wcag2a`, `wcag2aa`,
`wcag21a`, and `wcag21aa` tags on every page, in both layouts.

**Edge cases.**
- Contrast failures inherited from the design: the developer MUST report `BLOCKED:`.
  The user owns the fix.

### NFR-027: Lighthouse accessibility score

**Status:** draft
**Priority:** must
**Source:** docs/01-planning/project-charter.md#6-success-metrics

**Requirement.** Every page MUST score at least 95 in the Lighthouse mobile
accessibility category.

**Measurement:** Lighthouse mobile accessibility score >= 95 per page, median of 3 runs.

**Edge cases.**
- None identified.

### NFR-022: Keyboard-only operation

**Status:** draft
**Priority:** must
**Source:** .lonewolf/interviews/02-non-functional.md

**Requirement.** Every link, menu, form field, and button MUST be operable with the
keyboard alone, with a visible focus indicator.

**Measurement:** Keyboard-only walkthrough of every page reaches and activates every
interactive element. A full contact form submission completes without a pointer.

**Edge cases.**
- Turnstile interactive challenge: Cloudflare owns its accessibility. The walkthrough
  MUST use Turnstile test keys that pass silently.

### NFR-023: Lighthouse SEO score

**Status:** draft
**Priority:** must
**Source:** docs/01-planning/project-charter.md#6-success-metrics

**Requirement.** Every page MUST score at least 95 in the Lighthouse mobile SEO category.

**Measurement:** Lighthouse mobile SEO score >= 95 per page, median of 3 runs.

**Edge cases.**
- 404 page: the measurement MUST exclude it, because it returns HTTP 404 by design.

---

## Operations

### NFR-024: Rollback by image

**Status:** draft
**Priority:** must
**Source:** docs/01-planning/project-charter.md#4-goals

**Requirement.** Every deployed build MUST be an immutable container image tag, so the
maintainer can redeploy any previous tag.

**Measurement:** The CI workflow tags each image with the git commit SHA. Redeploying a
previous SHA tag serves that commit's pages.

**Edge cases.**
- No backups: the system stores no data. Confirmed with the user.

## Delivery

### NFR-028: Enquiry delivery time

**Status:** draft
**Priority:** must
**Source:** docs/01-planning/project-charter.md#6-success-metrics

**Requirement.** A valid enquiry MUST reach the sales mailbox within 60 seconds of
submission.

**Measurement:** One real submission against the deployed site with the production
SMTP relay. Time from "Send message" to arrival in the sales mailbox <= 60 s.

**Edge cases.**
- Message lands in spam: the measurement MUST count it as a failure (scope RISK-004).
