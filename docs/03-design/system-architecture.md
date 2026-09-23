---
artifact: system-architecture
phase: 3
status: draft
version: 1
updated: 2026-09-22
owner: system-architect
depends_on:
  - docs/00-intake/project-brief.md
  - docs/00-intake/tech-stack.md
  - docs/01-planning/project-charter.md
  - docs/01-planning/mvp-scope.md
  - docs/02-requirements/functional-requirements.md
  - docs/02-requirements/non-functional-requirements.md
  - docs/02-requirements/user-stories.md
  - .lonewolf/stack-profile.md
---

# System Architecture: TAMS Infotech Website V1

This document designs within the approved profile `astro-node-tailwind`. The profile
defines no variants. It selects no new technology. Design input also comes from the
read-only snapshot `docs/03-design/paper-snapshot/` (ADR-011).

The system is one Node 24 container. It serves prerendered HTML and three on-demand
routes. It has no database, no user accounts, and no stored visitor data.

---

## 1. Context

```mermaid
flowchart LR
  visitor([Prospect browser])
  cf[Cloudflare proxy<br/>TLS, DNS, CF-IPCountry,<br/>CF-Connecting-IP]
  subgraph container[Container: Node 24, non-root]
    wrapper[Server entry<br/>server.ts]
    adapter[@astrojs/node<br/>standalone handler]
    static[(dist/client<br/>prerendered HTML, assets, fonts)]
    ssr[On-demand routes<br/>/contact, /api/contact, /health]
  end
  turnstile[Cloudflare Turnstile<br/>widget + Siteverify API]
  smtp[SMTP relay<br/>user-supplied]
  mailbox[(Sales mailbox)]
  gmaps[Google Maps embed<br/>www.google.com]
  monitor[Uptime monitor<br/>user-operated]

  visitor -->|HTTPS| cf -->|HTTP, origin locked to Cloudflare| wrapper
  wrapper --> adapter
  adapter --> static
  adapter --> ssr
  visitor -->|widget script, iframe| turnstile
  ssr -->|POST siteverify, 3 s timeout| turnstile
  ssr -->|SMTP, 8 s timeout| smtp --> mailbox
  visitor -.->|only after Load map click| gmaps
  monitor -->|GET /health every 5 min| cf
```

External dependencies:

| Dependency | Direction | Purpose | Requirement |
|---|---|---|---|
| Cloudflare proxy | inbound | TLS, `CF-IPCountry`, `CF-Connecting-IP`, origin shield | FR-024, FR-050 |
| Cloudflare Turnstile widget | browser | Spam challenge token | FR-028, FR-029, FR-048 |
| Cloudflare Turnstile Siteverify | outbound from server | Token verification | FR-028 |
| SMTP relay | outbound from server | Enquiry delivery | FR-030, NFR-028 |
| Google Maps embed | browser, on request | Office map | FR-017, FR-019 |
| Uptime monitor | inbound | `/health` probe | NFR-008 |
| Container registry and host | operations | Image by git SHA | NFR-009, NFR-024 |

---

## 2. Component breakdown

Each component has one responsibility. `src/lib/` modules hold all logic, per stack
profile section 1. `.astro` files hold markup, props, and wiring only.

### 2.1 Server tier

| ID | Component | Path | Single responsibility | Boundary |
|---|---|---|---|---|
| C-01 | Server entry | `server.ts` | Start the HTTP server, apply response headers, block direct `.html` paths, delegate to the adapter | Imports `dist/server/entry.mjs` handler and C-02. Holds no logic beyond wiring. |
| C-02 | HTTP hardening | `src/lib/http-hardening.ts` | Decide whether a request path names an `.html` file; load the fallback CSP from `dist/_headers.json` | Pure functions. Unit-tested. |
| C-03 | Adapter | `@astrojs/node` standalone (dependency) | Serve `dist/client`, apply per-route CSP from `_headers.json`, 301 trailing slashes, route to on-demand code | Configured in `astro.config.ts` only. |
| C-04 | Health endpoint | `src/pages/health.ts` | Answer `GET /health` with 200 | No dependency on SMTP or configuration. |
| C-05 | Contact endpoint | `src/pages/api/contact.ts` | Wire `POST /api/contact` and `ALL` to C-06; convert its result to a `Response` | No logic. |
| C-06 | Contact pipeline | `src/lib/contact-pipeline.ts` | Run the FR-053 check order and return one typed outcome | Calls C-07 to C-14 in order. |
| C-07 | Body reader | `src/lib/request-body.ts` | Check media type; read at most 65,536 bytes; parse JSON | Returns `Result<unknown, "UNSUPPORTED_MEDIA_TYPE" \| "PAYLOAD_TOO_LARGE" \| "VALIDATION_FAILED">`. |
| C-08 | Client IP resolver | `src/lib/client-ip.ts` | Return `CF-Connecting-IP`, else the socket peer address | FR-050. |
| C-09 | Rate limiter | `src/lib/rate-limiter.ts` | Record a hit and report whether the IP exceeds 5 per 10 minutes | In-memory, ADR-005. |
| C-10 | Field validator | `src/lib/contact-validation.ts` | Apply FR-020 to FR-026 to an unknown value; return a typed submission or field errors | Shared by server and browser. No Node imports. |
| C-11 | Calling codes | `src/lib/calling-codes.ts` | Map an ISO country to a calling code; list every calling code | Server-only. ADR-006. |
| C-12 | Runtime configuration | `src/lib/runtime-config.ts` | Read and check every environment variable at first use | ADR-015. |
| C-13 | Turnstile verifier | `src/lib/turnstile-verify.ts` | Call Siteverify with a 3 s timeout; return pass or fail | ADR-007. |
| C-14 | Enquiry email | `src/lib/enquiry-email.ts` | Compose subject, body, and headers from a valid submission | Pure. FR-031 to FR-033. |
| C-15 | SMTP sender | `src/lib/smtp-sender.ts` | Send one composed message with an 8 s deadline | The only module that imports Nodemailer. ADR-004. |
| C-16 | Outcome log | `src/lib/outcome-log.ts` | Write one JSON line to standard output per contact request | NFR-017, NFR-018. |

### 2.2 Page tier

| ID | Component | Path | Single responsibility |
|---|---|---|---|
| C-20 | Base layout | `src/layouts/BaseLayout.astro` | Document shell: `<head>` metadata, fonts, CSP `frame-src` directive, header, footer |
| C-21 | Page metadata | `src/lib/page-meta.ts` | Build title, description (160-char word-boundary cut), and Open Graph values |
| C-22 | Site routes | `src/lib/site-routes.ts` | Declare every route, its label, and whether it ships; return `#` for unshipped destinations |
| C-23 | Header and navigation | `src/components/SiteHeader.astro`, `DesktopNav.astro`, `MobileNav.astro` | Header markup with no-JS menus (ADR-012) |
| C-24 | Navigation enhancement | `src/lib/nav-menu-client.ts` | Click, outside-click, Escape, and single-open behavior |
| C-25 | Footer | `src/components/SiteFooter.astro` | Footer links |
| C-26 | Prerendered pages | `src/pages/**/*.astro` except `contact.astro` | One page per route in FR-001 to FR-009, FR-046, FR-047 |
| C-27 | Contact page | `src/pages/contact.astro` | On-demand render with dial-code prefill and Turnstile site key |
| C-28 | Contact form client | `src/lib/contact-form-client.ts` | Client validation, submit, 15 s timeout, state rendering |
| C-29 | Turnstile client | `src/lib/turnstile-client.ts` | Render the widget explicitly; expose the current token |
| C-30 | Map loader | `src/lib/map-loader-client.ts` | Replace the placeholder with the embed iframe on click |
| C-31 | Global styles | `src/styles/global.css` | Tailwind import, `@theme` tokens, font imports |

### 2.3 Route inventory

| Route | Rendering | Requirement |
|---|---|---|
| `/` | prerendered | FR-001 |
| `/about`, `/careers`, `/privacy` | prerendered | FR-002, FR-003, FR-008 |
| `/services/{4 slugs}` | prerendered | FR-006 |
| `/products/{7 slugs}` | prerendered | FR-007 |
| `/solutions/{8 slugs}` | prerendered, Should | FR-046 |
| `/industries/{6 slugs}` | prerendered, Should | FR-047 |
| 404 page (`src/pages/404.astro`) | prerendered | FR-009 |
| `/contact` | on-demand | FR-005, FR-024 |
| `/api/contact` | on-demand | FR-027 to FR-042, FR-048 to FR-050, FR-053 |
| `/health` | on-demand | NFR-010 |

Total: 16 prerendered Must pages, 14 prerendered Should pages, 3 on-demand routes.
No other route MAY export `prerender = false`.

---

## 3. Architecture decision records

### ADR-001: Prerender every page except `/contact`, and serve two on-demand endpoints

**Status:** accepted
**Drivers:** FR-001 to FR-009, FR-024, FR-027, FR-046, FR-047, NFR-001, NFR-006, NFR-010, NFR-025
**Decision.** `astro.config.ts` MUST set `output: "static"`. Exactly three routes MUST
export `prerender = false`: `src/pages/contact.astro`, `src/pages/api/contact.ts`, and
`src/pages/health.ts`. The build format MUST be `directory`. `trailingSlash` MUST be
`"never"`.
**Rationale.** Static files meet NFR-001 and NFR-025 with no render cost. FR-024 varies
the Contact HTML per request by `CF-IPCountry`, so `/contact` cannot be prerendered.
`/contact` MUST set `Cache-Control: private, no-store`. It reads the Turnstile site key
at request time, so NFR-015 holds.
**Consequences.** `/contact` renders per request. It MUST do only header reads and one
metadata lookup, so it meets the 500 ms p95 in NFR-025. `/contact` MUST NOT use runtime
image optimization (`/_image`); the Contact design contains no raster image.
**Rejected alternatives.** Prerender `/contact` and fill the dial code with client
JavaScript (FR-024 requires it in the HTML response). `output: "server"` for all pages
(adds render cost to 30 pages for no requirement).

### ADR-002: Deliver security headers through a thin server entry around the standalone handler

**Status:** accepted, proven on a test build (evidence below)
**Drivers:** NFR-011, NFR-012, NFR-013, NFR-026, FR-009, FR-052
**Decision.**
1. `astro.config.ts` MUST enable Astro CSP (`security.csp`) with `algorithm: "SHA-256"`,
   directives `default-src 'self'`, `frame-ancestors 'none'`, `base-uri 'self'`,
   `form-action 'self'`, `object-src 'none'`, and `scriptDirective.resources`
   `['self', 'https://challenges.cloudflare.com']`.
2. The adapter MUST run with `staticHeaders: true`. The build then writes each
   prerendered route's CSP to `dist/_headers.json`, and the adapter sets it as a
   response header on the static file.
3. `BaseLayout.astro` MUST call `Astro.csp.insertDirective("frame-src 'none'")` on every
   page except Contact. `contact.astro` MUST pass
   `frame-src https://challenges.cloudflare.com https://www.google.com` instead.
4. The container MUST start `server.ts`, not `dist/server/entry.mjs`. `server.ts` MUST
   set `ASTRO_NODE_AUTOSTART=disabled`, import `handler` from the built entry, and wrap it:
   * set `Referrer-Policy: strict-origin-when-cross-origin` on every response;
   * set the `/404` CSP from `_headers.json` as a default `Content-Security-Policy`
     on every response. The adapter overwrites it for prerendered routes. Astro
     overwrites it for `/contact`. It remains on the 404 page and endpoints;
   * rewrite any request whose percent-decoded path ends in `.html` or `.htm`
     (case-insensitive) to a path with no route, so the adapter renders the 404 page;
   * close the server on `SIGTERM`.
5. Every script MUST be an Astro-processed `<script>`. `is:inline` scripts are forbidden.
   The proof showed Astro does not hash `is:inline` scripts, so the CSP blocks them.
6. Every prerendered page MUST emit the same CSP. The adapter matches `_headers.json`
   entries by substring (`header.pathname.includes(path)`), so `/` matches the first
   entry. Identical policies make that defect harmless. A Phase 5 test MUST assert that
   every `_headers.json` value is identical.

**Rationale.** Astro middleware does not run for static files. The adapter's
`staticHeaders` sets only the CSP. `Referrer-Policy` and the `.html` block need a hook
before the static handler. A 40-line wrapper is the smallest such hook. It keeps the
adapter's static serving, 301 logic, and traversal protection unchanged.
**Consequences.** The run command becomes `node server.ts`. Node 24 strips the types
natively; the proof ran it with no flag. This deviates from the profile toolchain row
"Run the built server". The CI/CD architect MUST use `node server.ts` in the
Dockerfile. `package.json` MUST keep `"type": "module"`. The image MUST contain
`server.ts`, `src/lib/http-hardening.ts`, `dist/`, `package.json`, and production
`node_modules`. Cloudflare Rocket Loader, Email Address Obfuscation, and automatic Web
Analytics injection MUST be off. They inject scripts or rewrite HTML that this policy
does not allow. The user owns that Cloudflare setting.
**Rejected alternatives.** `<meta http-equiv>` CSP (NFR-012 forbids meta-only
`frame-ancestors`). Cloudflare Transform Rules for headers (moves a MUST requirement into
unversioned dashboard state). Adapter `middleware` mode with a custom server (more code
for the same result). `output: "server"` (loses static serving; ADR-001).

**Proof.** Test build at
`/private/tmp/claude-501/-Users-vrishinp-Projects-tamsinfo-website/5404c954-f582-46d8-b82f-1e5a9c6f1854/scratchpad/proof`,
Astro 7.3.4, @astrojs/node 11.1.6, Node 24.21.0, Bun 1.3.14, 2026-09-22.

Reference wrapper, as proven:

```ts
process.env["ASTRO_NODE_AUTOSTART"] = "disabled";
const entry = await import(new URL("./dist/server/entry.mjs", import.meta.url).href);
const fallbackCsp = readFallbackCsp(new URL("./dist/_headers.json", import.meta.url));
createServer((req, res) => {
  res.setHeader("Referrer-Policy", REFERRER_POLICY);
  res.setHeader("Content-Security-Policy", fallbackCsp);
  if (req.url && isDirectHtmlPath(req.url)) req.url = "/__not_a_route";
  entry.handler(req, res);
}).listen(Number(process.env["PORT"] ?? 4321), process.env["HOST"] ?? "0.0.0.0");
```

`isDirectHtmlPath` MUST test both the raw path and the `decodeURIComponent` path. The
first proof tested only the raw path, and `/about/index%2Ehtml` returned 200. A path that
fails to decode MUST count as blocked.

Commands:

```bash
bunx astro build
PORT=4988 HOST=127.0.0.1 node server.ts &
curl -s -D - -o /dev/null http://127.0.0.1:4988/about
curl -s -D - -o /dev/null -H 'CF-IPCountry: SG' http://127.0.0.1:4988/contact
curl -s -D - -o /dev/null http://127.0.0.1:4988/unknown
curl -s -D - -o /dev/null http://127.0.0.1:4988/_astro/Base.CFoiVujJ.css
```

Observed headers, `sha256` values elided except where stated:

```text
GET /about -> 200
Referrer-Policy: strict-origin-when-cross-origin
Content-Security-Policy: default-src 'self';frame-ancestors 'none';base-uri 'self';form-action 'self';object-src 'none';frame-src 'none'; script-src 'self' https://challenges.cloudflare.com 'sha256-oGci0hGcIzFTSIGHDzHMLFUch2TNTBM/TiP/gFJedpg=' ... ; style-src 'self' 'sha256-47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU=';
Cache-Control: public, max-age=0

GET /contact (on-demand) -> 200
Referrer-Policy: strict-origin-when-cross-origin
content-security-policy: default-src 'self';frame-ancestors 'none';base-uri 'self';form-action 'self';object-src 'none';frame-src https://challenges.cloudflare.com https://www.google.com; script-src 'self' https://challenges.cloudflare.com ... ; style-src 'self' ... ;
cache-control: private, no-store

GET /unknown -> 404 (body is the 404 page)
Referrer-Policy: strict-origin-when-cross-origin
Content-Security-Policy: ... frame-ancestors 'none' ... frame-src 'none'; script-src 'self' https://challenges.cloudflare.com ...

GET /_astro/Base.CFoiVujJ.css -> 200
Referrer-Policy: strict-origin-when-cross-origin
Cache-Control: public, max-age=31536000, immutable
```

No response contained `'unsafe-inline'` or `'unsafe-eval'`. No HTML contained a
`<meta http-equiv>` CSP. A script check computed the SHA-256 of each inline script in
`/`, `/about`, and `/contact`. Every Astro-processed script hash appeared in the header.
Both `is:inline` probe scripts were absent from the header (rule 5).

Baseline without the wrapper (`node dist/server/entry.mjs`): `/about` carried the CSP
but no `Referrer-Policy`, and `/about/index.html` and `/index.html` returned 200.

### ADR-003: Redirect trailing slashes with the adapter; block `.html` paths in the server entry

**Status:** accepted, proven on the ADR-002 test build
**Drivers:** FR-052, FR-009
**Decision.** `trailingSlash: "never"` MUST be set. The adapter answers a slash-suffixed
prerendered route with 301 and keeps the query string. Astro answers slash-suffixed
on-demand routes the same way. C-01 blocks `.html` paths (ADR-002 rule 4).
**Rationale.** The adapter and Astro already implement the redirect. Only the `.html`
exposure needs extra code.
**Consequences.** Unknown slash-suffixed paths redirect once, then return 404. FR-052
permits that. The `Location` header is relative for static routes (`/about`).

Proof, `curl -s --path-as-is -o /dev/null -w '%{http_code} loc=%{redirect_url}'`:

| Request | Status | Location |
|---|---|---|
| `/about` | 200 | — |
| `/about/` | 301 | `/about` |
| `/about/?utm=1&x=2` | 301 | `/about?utm=1&x=2` |
| `/about/index.html` | 404 | — |
| `/about/index%2Ehtml` | 404 | — |
| `/index.html`, `/404.html` | 404 | — |
| `/contact/?a=1` | 301 | `/contact?a=1` |
| `/health/` | 301 | `/health` |
| `/unknown/` | 301, then 404 | `/unknown` |
| `/services` | 404 | — |
| `/wp-admin` | 404 | — |
| `/../etc/passwd`, `/%2e%2e/etc/passwd` | 404 | — |
| 3,000-character path | 404; next request 200 | — |
| `/api/contact` (GET) | 405 | — |

### ADR-004: Send mail with Nodemailer, one transport per message, 8-second deadline

**Status:** accepted
**Drivers:** FR-030, FR-031, FR-033, FR-034, FR-035, NFR-005, NFR-017, NFR-028
**Decision.** C-15 MUST use `nodemailer@^10.0.10` as a runtime dependency. It MUST NOT
add `@types/nodemailer`; version 10 ships its own types. C-15 MUST create one transport
per message with `connectionTimeout: 8000`, `greetingTimeout: 8000`, `socketTimeout:
8000`, `disableFileAccess: true`, and `disableUrlAccess: true`. Port 465 MUST use
`secure: true`. Every other port MUST use `requireTLS: true`. C-15 MUST also race
`sendMail` against an 8,000 ms timer that starts before connect. When the timer wins,
C-15 MUST close the transport and return `SEND_FAILED`. Nodemailer encodes non-ASCII
subjects as RFC 2047 encoded words.
**Rationale.** Audit on 2026-09-22 with Bun 1.3.14: `nodemailer@10.0.10`, MIT-0, zero
dependencies, last release 2026-09-14; `bun audit --audit-level=high` reported no
vulnerabilities. A scratch send produced
`Subject: =?UTF-8?Q?Website_enquiry=3A_Services_=E2=80=94_Ca?=...` for a subject with
an em dash and accents. Every FR-031 subject contains an em dash, so every subject is
encoded. One transport per message avoids stale pooled connections at this volume.
**Consequences.** C-15 MUST NOT log the Nodemailer error object. It MUST map every
failure to `SEND_FAILED`. The envelope recipient MUST be the sales mailbox only (FR-035).
**Rejected alternatives.** A hand-written SMTP client (STARTTLS, AUTH, and dot-stuffing
are defect-prone). An HTTP mail API (the user chose SMTP; tech-stack.md).

### ADR-005: Rate-limit in process memory with a per-IP sliding log

**Status:** accepted
**Drivers:** FR-042, FR-050, FR-053, NFR-006, NFR-017
**Decision.** C-09 MUST hold a `Map<string, number[]>` keyed by client IP (C-08). Each
value holds at most the 5 most recent hit times, in epoch milliseconds. For each POST,
C-09 MUST:
1. drop times older than `now - 600_000`;
2. set `limited = remaining.length >= 5`;
3. append `now`, keep the last 5, then delete and re-insert the key so `Map` insertion
   order equals last-request order;
4. while `size > 10_000`, delete the first key.

The pipeline MUST record the hit as soon as the method check passes. It MUST report
`RATE_LIMITED` only at the FR-053 rate-limit step, so rejected POSTs still count.
**Rationale.** One container (NFR-006) needs no shared store. Keeping 5 times makes the
window exact. Re-insertion gives O(1) oldest-last-request eviction.
**Consequences.** Counters reset on restart (FR-042 allows it). A second replica would
split the limit; ADR-005 MUST be revisited before running more than one container.
Memory stays under about 2 MB at the cap. IP addresses never leave memory (NFR-017).
**Rejected alternatives.** Fixed window (allows 10 hits across a boundary). Redis (a new
service no requirement needs). Cloudflare rate limiting (user-owned; does not give the
FR-053 order).

### ADR-006: Take calling codes from `libphonenumber-js/min`, on the server only

**Status:** accepted
**Drivers:** FR-024, FR-023, NFR-004
**Decision.** C-11 MUST import only `getCountryCallingCode`, `isSupportedCountry`, and
`getCountries` from `libphonenumber-js/min` (`^1.13.13`). For a `CF-IPCountry` value,
C-11 returns `+<code>` when `isSupportedCountry(value)` is true, otherwise `+91`. The
Contact page renders `+<code> ` (one trailing space) as the Phone field value. It also
renders the sorted, distinct list of every calling code into a `data-calling-codes`
attribute on the form. The browser validator reads that list. Browser code MUST NOT
import `libphonenumber-js`.
**Rationale.** Audit on 2026-09-22: MIT, zero dependencies, no advisories. Scratch
checks: `SG` gave `+65`, `IN` `+91`, `US` and `CA` `+1`; `XX`, `T1`, and `ZZ` were
unsupported. The metadata lists 245 countries and 206 distinct codes. The attribute is
about 800 bytes, so the client needs no metadata bundle.
**Consequences.** Server and browser apply FR-023's "calling code only" rule from one
source. A header value is used only after `isSupportedCountry` accepts it, so it never
reaches HTML unchecked.
**Rejected alternatives.** Full `libphonenumber-js` or Google's `libphonenumber`
(larger, no FR needs parsing). A hand-copied table (drifts from the named metadata).

### ADR-007: Verify Turnstile with `fetch` and a 3-second abort; render the widget explicitly

**Status:** accepted
**Drivers:** FR-028, FR-029, FR-048, FR-053, NFR-004, NFR-011, NFR-026
**Decision.**
* Browser: the Contact page MUST load
  `https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit` with `async`
  and `defer`. C-29 MUST call `turnstile.render` on the widget container with the site
  key from its `data-sitekey` attribute, `appearance: "interaction-only"`,
  `"refresh-expired": "auto"`, and a callback that stores the token. C-28 sends the
  token as `turnstileToken`.
* Server: C-13 MUST POST `application/x-www-form-urlencoded` fields `secret` and
  `response` to `https://challenges.cloudflare.com/turnstile/v0/siteverify` with the
  global `fetch` and `AbortSignal.timeout(3000)`. Only a JSON body with `success === true`
  passes. A timeout, network error, non-2xx status, or parse failure MUST fail.
* A missing, non-string, empty, or over-2048-character token MUST fail at the Turnstile
  step without calling Siteverify. It is not a field error.
**Rationale.** `fetch` is built into Node 24, so no dependency is added. Explicit render
lets C-29 hand the token to the JSON request.
**Consequences.** The user MUST create the site key as a Managed widget (FR-048). Phase 5
MUST use Cloudflare's test keys (NFR-005, NFR-022).
**Rejected alternatives.** Implicit render with a hidden input (the form posts JSON, not
form data). A Turnstile SDK package (adds a dependency for one HTTP call).

### ADR-008: Self-host fonts from Fontsource packages bundled by Vite

**Status:** accepted
**Drivers:** NFR-016, NFR-002, NFR-003, NFR-004
**Decision.** `src/styles/global.css` MUST import `@fontsource-variable/archivo`,
`@fontsource-variable/inter`, and the `@fontsource/ibm-plex-mono` weights the design uses.
The snapshot uses weights 500 and 600 with `font-mono`; the developer MUST confirm the
set against the snapshot. Vite copies the `woff2` files into `/_astro/` with hashed
names. `BaseLayout.astro` MUST preload the Latin subset `woff2` of Archivo and Inter.
**Rationale.** Packages pin font versions in `bun.lock`. The files ship from the site
origin, so no request goes to a font host. External stylesheets need no CSP hash.
Fontsource uses `font-display: swap` and `unicode-range`, so browsers fetch only the
subsets a page needs.
**Consequences.** Each package MUST pass `bun audit`. Phase 5 MUST check that no request
leaves the origin for fonts, and that CLS stays at or below 0.1.
**Rejected alternatives.** Google Fonts CDN (NFR-016). Astro Fonts API (fetches at build
from a provider; not verified in this profile; injects inline styles).

### ADR-009: Disable Astro sessions

**Status:** accepted
**Drivers:** FR-018, FR-034, NFR-014
**Decision.** `astro.config.ts` MUST set `session: false`.
**Rationale.** No requirement needs server state per visitor. `@astrojs/node` 11.1.6
enables filesystem sessions under the cache directory unless `session` is `false`
(`index.js`, "Enabling sessions with filesystem storage"). The proof build set
`session: false`, built, and served every route.
**Consequences.** The container MUST NOT depend on a writable session directory. The root
filesystem MAY be read-only. No session cookie exists.
**Rejected alternatives.** Default filesystem sessions (unused state and a writable path).

### ADR-010: Load a keyless Google Maps embed iframe on click

**Status:** accepted
**Drivers:** FR-017, FR-018, FR-019, NFR-001, NFR-026
**Decision.** The Contact page MUST render the map placeholder and a "Load map" button.
C-30 MUST, on click, replace the placeholder content with
`<iframe src="https://www.google.com/maps?q=<encoded address>&output=embed"
title="Map of the TAMS Infotech Bengaluru office" loading="lazy"
referrerpolicy="strict-origin-when-cross-origin">` inside a container of fixed token
dimensions. The address MUST be the FR-019 string, encoded with `encodeURIComponent`.
C-30 MUST NOT write any storage.
**Rationale.** The `output=embed` URL needs no API key and loads no script into the
page. `frame-src https://www.google.com` on `/contact` only satisfies NFR-026.
**Consequences.** Without JavaScript the placeholder stays and no Google request occurs.
**Rejected alternatives.** Maps JavaScript API or Embed API (need a key). Loading the
iframe with the page (FR-017).

### ADR-011: Freeze the Paper export as the design input for Phase 4

**Status:** accepted
**Drivers:** FR-010, FR-011, FR-036, mvp-scope RISK-002 and RISK-003
**Decision.** `docs/03-design/paper-snapshot/` holds `tokens.css` and JSX exports of the
Desktop, Mobile, and design-system artboards. Phase 4 agents cannot reach Paper. They
MUST build from this directory and `ui-specification.md`. The directory MUST be frozen
at Gate G3. A later Paper change MUST enter through `/lonewolf:amend`.
**Rationale.** It records the design at a point in time and makes the token hash
checkable (RISK-002). It is outside the artifact contract layout, so this ADR records it.
**Consequences.** Snapshot class names such as `w-[420px]` are Paper output, not
target code. Developers MUST map them to tokens (FR-011).
**Rejected alternatives.** Live Paper reads in Phase 4 (no access; tool budget).

### ADR-012: Open menus with CSS and `<details>`; add JavaScript only as enhancement

**Status:** accepted
**Drivers:** FR-013, FR-014, FR-015, FR-051, NFR-022
**Decision.**
* Desktop: each dropdown item MUST be a `<li>` holding a `<button aria-expanded>` and a
  menu list. CSS MUST show the list on `li:hover` and `li:focus-within`. With no
  JavaScript, Tab into the item opens its menu and every link is reachable.
* Mobile: the menu MUST be a `<details>` with a `<summary>` control. It opens and closes
  without JavaScript.
* C-24 MUST add, when JavaScript runs: click toggling with `aria-expanded`, one open
  menu at a time, outside-click close, Escape close with focus return, and close when
  focus leaves the last link. It MUST close the mobile `<details>` on Escape.
**Rationale.** FR-051 needs every destination reachable with JavaScript off.
**Consequences.** `:focus-within` keeps a menu open while focus is inside it. C-24 MUST
add a class that suppresses the hover and focus rules after Escape, until the pointer
leaves or focus moves.
**Rejected alternatives.** JavaScript-only menus (FR-051). Checkbox hacks (poor
semantics for assistive technology).

### ADR-013: Use `--breakpoint-xl` (1280 px) as the desktop breakpoint

**Status:** proposed; the user MUST confirm at Gate G3
**Drivers:** FR-010, NFR-020, mvp-scope S-3
**Decision.** Desktop layout MUST apply at viewport width >= `--breakpoint-xl` (1280 px),
through Tailwind's `xl:` variant. Below it, the Mobile layout applies.
**Rationale.** The snapshot names no breakpoint. Evidence from it:
* Foundations: "A 1440 frame with an 80px gutter" and a "CONTENT — 1280" guide.
* Desktop artboards place fixed blocks from 1,080 px to 1,150 px wide.
* At `lg` (1024 px) the 80 px gutters leave 864 px. That is below `--container-narrow`
  (880 px) and far below the desktop blocks, so the desktop design cannot render.
* At `xl` (1280 px) the gutters leave 1,120 px, which equals `--container-content`.
* `2xl` (1440 px) would send common 1280 px and 1366 px laptops to the Mobile layout.
* S-3 routes widths between the two layouts to Mobile until tablet layouts arrive.
**Consequences.** Viewports from 360 px to 1279 px render the Mobile layout. The Mobile
layout MUST stretch without horizontal scroll across that range (NFR-020). Desktop
blocks wider than 1,120 px MUST become fluid with a `max-w-*` token.
**Rejected alternatives.** `lg` 1024 px (desktop blocks do not fit). `2xl` 1440 px
(laptops get Mobile). `md` 768 px (tablets get Desktop, against S-3).

### ADR-014: Disable Astro origin checking for the JSON endpoint

**Status:** accepted
**Drivers:** FR-053, FR-027
**Decision.** `astro.config.ts` MUST set `security.checkOrigin: false`.
**Rationale.** Astro's origin check returns 403 for cross-origin POSTs with form content
types, before the endpoint runs. That would answer 403 where FR-053 requires 415. The
endpoint accepts only `application/json`. A cross-origin browser request with that type
triggers a CORS preflight, and the endpoint sends no CORS headers, so browsers block it.
**Consequences.** The endpoint MUST NOT add `Access-Control-Allow-*` headers.
**Rejected alternatives.** Keep the check (breaks the FR-053 order).

### ADR-015: Read configuration from `process.env` at first use, never at build

**Status:** accepted
**Drivers:** NFR-015, NFR-010, NFR-018, FR-024, FR-030, FR-033
**Decision.** C-12 MUST read these variables with `process.env` inside on-demand code
only, and cache the result after the first complete read:

| Variable | Used by | Missing behavior |
|---|---|---|
| `SMTP_HOST` | C-15 | `SEND_FAILED` |
| `SMTP_PORT` | C-15; integer 1 to 65535 | `SEND_FAILED` |
| `SMTP_USER` | C-15 | `SEND_FAILED` |
| `SMTP_PASSWORD` | C-15 | `SEND_FAILED` |
| `MAIL_FROM` | C-14 `From` | `SEND_FAILED` |
| `SALES_MAILBOX` | C-14 `To` | `SEND_FAILED` |
| `TURNSTILE_SECRET_KEY` | C-13 | `SEND_FAILED` |
| `TURNSTILE_SITE_KEY` | C-27 | Page renders without the widget |
| `PORT`, `HOST` | C-01 | Defaults `4321`, `0.0.0.0` |

The pipeline MUST check configuration after field validation and before Siteverify. Any
missing or invalid variable returns 502 `SEND_FAILED`. The log `detail` names each
missing variable, comma-separated, with no values.
**Rationale.** `astro:env` fails startup on a missing required variable, which would
break `/health` (NFR-010). Public `astro:env` values are inlined at build (NFR-015).
**Consequences.** `.env.example` MUST list every variable with a placeholder. Nothing is
read with a `PUBLIC_` prefix. Secrets never appear in `dist/client/`.
**Rejected alternatives.** `astro:env` schema (above). Reading at module load (fails on
import in tests).

---

## 4. Sequence diagrams

### 4.1 Contact submission

```mermaid
sequenceDiagram
  autonumber
  participant B as Browser (C-28, C-29)
  participant E as Server entry (C-01)
  participant P as Contact pipeline (C-06)
  participant R as Rate limiter (C-09)
  participant T as Turnstile Siteverify
  participant S as SMTP relay
  participant L as Outcome log (C-16)

  B->>B: validate fields (C-10); on failure show errors, stop
  B->>B: disable Send; start 15 s abort timer
  B->>E: POST /api/contact (JSON + turnstileToken)
  E->>P: via adapter and C-05
  P->>P: 1. method is POST? else 405
  P->>R: record hit for CF-Connecting-IP
  R-->>P: limited flag
  P->>P: 2. media type application/json? else 415
  P->>P: 3. body <= 65,536 bytes? else 413
  P->>P: 4. limited? then 429
  P->>P: 5. JSON object and FR-020..026? else 400 + fieldErrors
  P->>P: 6a. configuration complete? else 502
  P->>T: 6b. siteverify (3 s)
  T-->>P: success true/false
  P->>P: fail or timeout -> 403
  P->>S: 7. send (8 s deadline)
  S-->>P: accepted / error
  P->>L: one JSON line {time, outcome[, detail]}
  P-->>B: 200 {status: sent} or error {code}
  B->>B: 200 -> thank-you state, focus heading; else message per code
```

### 4.2 Contact page render

```mermaid
sequenceDiagram
  participant B as Browser
  participant C as Cloudflare
  participant E as Server entry (C-01)
  participant P as contact.astro (C-27)
  participant K as Calling codes (C-11)
  B->>C: GET /contact
  C->>E: GET /contact + CF-IPCountry
  E->>P: default headers set; adapter routes on-demand
  P->>K: callingCodeFor(CF-IPCountry)
  K-->>P: "+65" or "+91" fallback
  P-->>B: HTML with phone value "+65 ", data-sitekey, data-calling-codes; Cache-Control: private, no-store; per-page CSP
```

### 4.3 Static page request

```mermaid
sequenceDiagram
  participant B as Browser
  participant E as Server entry (C-01)
  participant A as Adapter static handler (C-03)
  participant F as dist/client
  B->>E: GET /about/?q=1
  E->>E: set Referrer-Policy, default CSP; .html path? rewrite to no-route
  E->>A: handler(req, res)
  A->>A: route prerendered -> set CSP from _headers.json
  A-->>B: 301 Location /about?q=1
  B->>E: GET /about?q=1
  E->>A: handler
  A->>F: send about/index.html
  F-->>B: 200 HTML
```

There is no authentication flow. The system has no accounts (mvp-scope, Out of Scope).

---

## 5. Cross-cutting concerns

### 5.1 Error handling

* `src/lib/` functions MUST return `{ ok: true, value } | { ok: false, error }` with a
  typed code. The pipeline maps each failure to exactly one `ErrorCode` from the API
  contract.
* C-05 MUST catch any unexpected exception from C-06, return 502 `SEND_FAILED`, and log
  outcome `send_failed`. No exception MAY reach the adapter.
* Body read errors MUST map to 413 `PAYLOAD_TOO_LARGE`. The adapter's
  `bodySizeLimit` MUST be `65536` as a backstop. The proof showed an unhandled read error
  becomes a 500. With the C-07 reader, 65,536 bytes gave 200, and 65,537 bytes gave 413
  with and without `Content-Length`.
* Status codes follow `api-contract.yaml`. The page maps codes to messages (FR-037,
  FR-038, FR-049). Any unlisted status or network error shows the FR-038 message.

### 5.2 Logging

* Only C-16 writes logs for the contact endpoint: exactly one line per request,
  `{"time":"<ISO 8601>","outcome":"<outcome>"}` plus `"detail"` only for missing
  configuration. It MUST use `process.stdout.write` (Oxlint forbids `console`).
* No log line MAY contain a field value, IP address, token, SMTP response, or error
  object (NFR-017).
* Pages and `/health` write no application logs.

### 5.3 Authentication and authorization

There are no users, roles, sessions, or cookies (ADR-009). Every route is public. Abuse
controls on `/api/contact` are Turnstile (ADR-007), the rate limit (ADR-005), and the
body cap. The origin MUST accept traffic from Cloudflare only (user-configured). FR-050
depends on that.

### 5.4 Configuration and secrets

ADR-015 lists every variable. The runtime reads them from the container environment.
The CI/CD architect MUST pass them at `docker run` or through the host's secret store.
They MUST NOT enter the image or the repository. `.env.example` carries placeholders.

### 5.5 Browser build targets

The Astro/Vite build target MUST cover the previous major version of Chrome, Edge,
Firefox, Safari, and Safari on iOS 16 (NFR-019). The Vite default `baseline-widely-available`
target meets that. Developers MUST NOT lower it.

### 5.6 Deployment shape

One image, `node:24` slim base with full ICU (FR-032 needs `Asia/Kolkata` formatting),
user `node` (uid 1000), `CMD ["node", "server.ts"]`, tag = git SHA. The build stage uses
Bun. The runtime stage needs no Bun. No volume is needed.

---

## 6. NFR satisfaction table

| NFR | Mechanism | Verified by |
|---|---|---|
| NFR-001 | Prerendered HTML (ADR-001); processed scripts only; map deferred (ADR-010); preloaded fonts (ADR-008) | Lighthouse, Phase 5 |
| NFR-002 | Static HTML, font preload, no render-blocking third-party script | Lighthouse |
| NFR-003 | Fixed-size map and Turnstile containers; `font-display: swap` with preload | Lighthouse |
| NFR-004 | No UI framework; subset fonts; Turnstile only on Contact; calling codes as an 800-byte attribute (ADR-006) | Lighthouse byte weight |
| NFR-005 | Siteverify 3 s cap plus SMTP; no other I/O in the pipeline | Scripted load test |
| NFR-006 | Static serving from one Node process; no per-request work on 30 pages | 200-VU load test |
| NFR-025 | Static files; `/contact` does header read and one table lookup | Load test at origin |
| NFR-007 | C-07 reads at most 65,536 bytes; `Content-Length` pre-check; adapter backstop | Proven; Phase 5 test |
| NFR-008 | `/health` (C-04); user-run monitor | User monitor |
| NFR-009 | Stateless image; redeploy previous SHA tag | Timed drill |
| NFR-010 | C-04 returns 200 with no dependency on config or SMTP | curl |
| NFR-011 | Astro CSP with hashes, `staticHeaders`, server-entry fallback (ADR-002) | Proven |
| NFR-026 | Per-page `frame-src` directive (ADR-002 rule 3) | Proven |
| NFR-012 | `frame-ancestors 'none'` in the CSP header on every page | Proven |
| NFR-013 | C-01 sets `Referrer-Policy` on every response | Proven |
| NFR-014 | Image runs as uid 1000 | `docker run id -u` |
| NFR-015 | ADR-015; site key read per request | Grep of repo and `dist/` |
| NFR-016 | Fontsource files served from origin (ADR-008) | Network capture |
| NFR-017 | C-16 fixed schema; no error objects logged (ADR-004) | Marker grep |
| NFR-018 | C-16 one line per request, outcome enum in the API contract | Log inspection |
| NFR-019 | Vite target (5.5); no framework-specific APIs | E2E matrix |
| NFR-020 | Mobile layout fluid from 360 px to 1279 px (ADR-013) | scrollWidth check |
| NFR-021 | Semantic markup, labelled fields, `aria-describedby` errors; `BLOCKED:` on design contrast | axe-core |
| NFR-027 | Same as NFR-021 | Lighthouse |
| NFR-022 | Native buttons, links, `<details>`; menu keyboard rules (ADR-012) | Keyboard walkthrough |
| NFR-023 | C-21 title, description, Open Graph; 200 responses; no redirect chains | Lighthouse |
| NFR-024 | CI tags the image with the git SHA | CI config |
| NFR-028 | Direct SMTP send on request; user relay with SPF and DKIM (RISK-004) | Real submission |

Every NFR has a mechanism. NFR-028 also depends on the user's relay configuration.

---

## 7. FR to component map

| FR | Components | API operation |
|---|---|---|
| FR-001 to FR-004, FR-006 to FR-008 | C-26, C-20, C-21 | none: static pages |
| FR-005 | C-27 | none: page |
| FR-009 | C-26 (`404.astro`), C-03, C-01 | none |
| FR-010 | C-31, all pages (ADR-013) | none |
| FR-011 | C-31 | none |
| FR-012 | C-22 | none |
| FR-052 | C-03, C-01 (ADR-003) | none |
| FR-013, FR-014 | C-23, C-24 | none |
| FR-015 | C-23 (`MobileNav`), C-24 | none |
| FR-051 | C-23 (ADR-012) | none |
| FR-016 | C-22, C-23, C-27 (`id="contact-form"`) | none |
| FR-017 to FR-019 | C-27, C-30 (ADR-010) | none |
| FR-020 to FR-023, FR-025, FR-026 | C-10 (browser and server) | `submitContactEnquiry` |
| FR-024 | C-27, C-11 (ADR-006) | none: page render |
| FR-027 | C-06, C-07, C-10 | `submitContactEnquiry` |
| FR-028 | C-13 | `submitContactEnquiry` |
| FR-048, FR-029 | C-29 | none: browser widget |
| FR-030 | C-15 | `submitContactEnquiry` |
| FR-031 to FR-033 | C-14 | `submitContactEnquiry` |
| FR-034 | C-06 (no persistence), C-16 | `submitContactEnquiry` |
| FR-035 | C-14, C-15 | `submitContactEnquiry` |
| FR-036 to FR-041, FR-049 | C-28 | consumes `submitContactEnquiry` |
| FR-042 | C-09 | `submitContactEnquiry` |
| FR-050 | C-08 | `submitContactEnquiry` |
| FR-053 | C-06 | `submitContactEnquiry` |
| FR-043 to FR-045 | C-20, C-21 | none |
| FR-046, FR-047 | C-26, C-22 | none |

`getHealth` serves NFR-008 and NFR-010. Every FR from FR-001 to FR-053 appears above.

---

## 8. Open items for Gate G3

* **Thank-you design fields.** The "Contact — Thank You" design shows "Sent to"
  (`ops@northaid.example`), "Topic" (`Services`), "Reference" (`TAMS-2026-0412`), and a
  "Send another message" control. "Sent to" MUST show the visitor's trimmed Work email.
  "Topic" MUST show the chosen Interest. The browser already holds both, so the 200
  response does not carry them. No FR defines "Reference" or "Send another message".
  See the `BLOCKED:` questions in the Phase 3 report.
* **ADR-013** is proposed. The user MUST confirm 1280 px.
* **Cloudflare settings** (ADR-002): Rocket Loader, Email Address Obfuscation, and
  automatic Web Analytics injection MUST be off.
