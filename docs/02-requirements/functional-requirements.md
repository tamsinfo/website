---
artifact: functional-requirements
phase: 2
status: approved
version: 3
updated: 2026-09-22
owner: functional-requirements-analyst
depends_on:
  - docs/01-planning/project-charter.md
  - docs/01-planning/mvp-scope.md
  - docs/00-intake/tech-stack.md
  - .lonewolf/stack-profile.md
---

# Functional Requirements: TAMS Infotech Website V1

## Conventions

- **Interview record.** Every value in this document traces to
  `.lonewolf/interviews/02-functional.md` or `.lonewolf/interviews/02-non-functional.md`.
- **Design source.** "The Paper design" means the Paper file named in
  `docs/01-planning/mvp-scope.md#design-source`. "Screen" means one named artboard in it.
- **Layout.** Every screen exists as a Desktop artboard and a Mobile artboard with the
  same name. FR-010 defines which one renders.
- **Design match.** A page "matches its screen" when it shows every section, text string,
  link label, icon, and image of the screen, in the same order, using the tokens the
  screen uses. The user verifies design match by side-by-side review.
- **Production origin.** `https://tamsinfotech.com`.
- **Sales mailbox.** The recipient address configured at deploy time. Its value is not
  fixed in code (mvp-scope assumption S-7).
- **Trimmed value.** A field value with leading and trailing whitespace removed. A
  whitespace-only value trims to empty.
- **Character count.** Counted in Unicode code points after trimming.
- **Field rules on both sides.** The page MUST apply each field rule in FR-020 through
  FR-026 before it sends a request. The server MUST apply each rule again (FR-027).
- **Contact endpoint.** `POST /api/contact` with `Content-Type: application/json`.
- **Navigation shell.** The header and footer appear on every in-scope screen. FR-013,
  FR-014, and FR-015 cite `#design-source` because the shell belongs to every scope item.
- **Search requirements.** FR-043 through FR-045 cite the charter Lighthouse SEO metric.
  No scope item names SEO, and the metric cannot pass without them.

---

## Pages

### FR-001: Serve the Home page

**Status:** draft
**Priority:** must
**Source:** docs/01-planning/mvp-scope.md#scope-home
**Stories:** US-001

**Requirement.** The system MUST serve a page at `/` that matches the "Home" screen.

**Behaviour.** The system MUST respond with HTTP 200 and `Content-Type: text/html`.

**Edge cases.**
- Request with a query string, such as `/?utm_source=brochure`: the system MUST serve
  the Home page.

### FR-002: Serve the About page

**Status:** draft
**Priority:** must
**Source:** docs/01-planning/mvp-scope.md#scope-about
**Stories:** US-001

**Requirement.** The system MUST serve a page at `/about` that matches the "About" screen.

**Behaviour.** The system MUST respond with HTTP 200.

**Edge cases.**
- Trailing slash: FR-052 applies.

### FR-003: Serve the Careers page

**Status:** draft
**Priority:** must
**Source:** docs/01-planning/mvp-scope.md#scope-careers
**Stories:** US-001

**Requirement.** The system MUST serve a page at `/careers` that matches the "Careers" screen.

**Behaviour.** The system MUST respond with HTTP 200.

**Edge cases.**
- Trailing slash: FR-052 applies.

### FR-004: Show the empty open-roles state on Careers

**Status:** draft
**Priority:** must
**Source:** docs/01-planning/mvp-scope.md#scope-careers
**Stories:** US-001

**Requirement.** The Careers page MUST show the open-roles table in the "no openings
available" state that the Careers screen shows.

**Behaviour.** The page MUST NOT show any job listing. The page MUST NOT offer any
job application control.

**Edge cases.**
- None identified. Confirmed with the user in Phase 1: V1 accepts no applications.

### FR-005: Serve the Contact page

**Status:** draft
**Priority:** must
**Source:** docs/01-planning/mvp-scope.md#scope-contact
**Stories:** US-004

**Requirement.** The system MUST serve a page at `/contact` that matches the "Contact" screen.

**Behaviour.** The page MUST show the office name, office locality, phone number
`+91 80 4130 1039`, and email `sales@tamsinfotech.com` as the screen shows them.

**Edge cases.**
- Visitor with JavaScript disabled: the contact details MUST remain visible.

### FR-006: Serve the Services pages

**Status:** draft
**Priority:** must
**Source:** docs/01-planning/mvp-scope.md#scope-services
**Stories:** US-002

**Requirement.** The system MUST serve each Services page at its route, matching its screen.

| Route | Screen |
|---|---|
| `/services/s4hana-cloud-implementation` | Services — S/4HANA Cloud Implementation |
| `/services/s4hana-managed-services` | Services — S/4HANA Managed Servies |
| `/services/custom-application-build` | Services — Custom Application Build |
| `/services/license-procurement` | Services — License Procurement |

**Behaviour.** Each route MUST respond with HTTP 200.

**Edge cases.**
- Request for `/services`: the system MUST return the 404 page per FR-009.
- Request for an unlisted slug, such as `/services/unknown`: the system MUST return the
  404 page.

### FR-007: Serve the Products pages

**Status:** draft
**Priority:** must
**Source:** docs/01-planning/mvp-scope.md#scope-products
**Stories:** US-003

**Requirement.** The system MUST serve each Products page at its route, matching its screen.

| Route | Screen |
|---|---|
| `/products/gate-entry` | Products — Gate Entry Application |
| `/products/exim` | Products — EXIM Application |
| `/products/digisign` | Products — TAMS DigiSign |
| `/products/production-process` | Products — TAMS Production Process |
| `/products/vendor-portal` | Products — TAMS Vendor Portal |
| `/products/connected-factory` | Products — TAMS Connected Factory |
| `/products/digital-manufacturing-ai` | Products — TAMS Digital Manufacturing & AI |

**Behaviour.** Each route MUST respond with HTTP 200.

**Edge cases.**
- Request for `/products`: the system MUST return the 404 page per FR-009.
- Request for an unlisted slug: the system MUST return the 404 page.

### FR-008: Serve the Privacy Policy page

**Status:** draft
**Priority:** must
**Source:** docs/01-planning/mvp-scope.md#scope-privacy-policy
**Stories:** US-012

**Requirement.** The system MUST serve a page at `/privacy` that matches the "Privacy
Policy" screen.

**Behaviour.** The system MUST respond with HTTP 200. The page MUST show the draft text
exactly as the screen shows it.

**Edge cases.**
- None identified. Confirmed with the user in Phase 1: legal review is out of scope.

### FR-009: Return the 404 page for unknown paths

**Status:** draft
**Priority:** must
**Source:** docs/01-planning/mvp-scope.md#scope-not-found
**Stories:** US-012

**Requirement.** The system MUST respond to every path that no requirement defines with
HTTP 404 and a page that matches the "404" screen.

**Behaviour.** The response body MUST be the 404 page, not a server default page.

**Edge cases.**
- Old WordPress paths, such as `/wp-admin`: the system MUST return 404. The user
  confirmed no redirects.
- Path traversal, such as `/../etc/passwd`: the system MUST return 404 and MUST NOT
  expose any file.
- Path longer than 2048 characters: the system MUST return 404 or 414 and MUST keep
  serving other requests.

### FR-010: Render the layout that matches the viewport width

**Status:** draft
**Priority:** must
**Source:** docs/01-planning/mvp-scope.md#scope-responsive-layout
**Stories:** US-009

**Requirement.** Every page MUST render its Mobile screen layout when the viewport is
narrower than the desktop breakpoint, and its Desktop screen layout otherwise.

**Behaviour.** Phase 3 MUST record the desktop breakpoint as one `--breakpoint-*` token
from Meridian Design. Both layouts MUST come from one URL. The system MUST NOT
redirect by device.

**Edge cases.**
- Viewport exactly at the breakpoint: the page MUST render the Desktop layout.
- Viewport between 360 px and the breakpoint: the page MUST render the Mobile layout.
  Confirmed with the user in Phase 1.
- Window resized across the breakpoint: the layout MUST switch without a reload.

### FR-011: Use Meridian Design tokens for every style value

**Status:** draft
**Priority:** must
**Source:** docs/01-planning/mvp-scope.md#scope-design-tokens
**Stories:** US-009

**Requirement.** Every color, font family, font size, font weight, letter spacing, line
height, spacing, radius, container width, and breakpoint in the code MUST reference a
Meridian Design token.

**Behaviour.** Stack profile section 8 checks 10 and 11 MUST return no matches.

**Edge cases.**
- A screen uses a value with no matching token and no Meridian guideline covers it: the
  developer MUST report `BLOCKED:` and MUST NOT invent a token or hardcode the value.
- A layout value that a Meridian guideline defines rather than a token, such as a grid
  proportion: the developer MUST follow the guideline and cite it in a code comment.

### FR-012: Point links to unbuilt pages at "#"

**Status:** draft
**Priority:** must
**Source:** docs/01-planning/mvp-scope.md#scope-placeholder-links
**Stories:** US-008

**Requirement.** Every link whose destination page does not exist in the build MUST
have `href="#"`.

**Behaviour.** This applies to Blog, Case Studies, Terms, Cookies, and Sitemap links. It
applies to Solutions and Industries links until FR-046 and FR-047 ship. When a
destination page ships, its links MUST point to its route.

**Edge cases.**
- Activating a `#` link: the browser MUST stay on the current page.

### FR-052: Redirect trailing-slash paths

**Status:** draft
**Priority:** must
**Source:** docs/01-planning/mvp-scope.md#scope-not-found
**Stories:** US-001

**Requirement.** A request for a defined route with one added trailing slash MUST
receive HTTP 301 to the same route without the slash.

**Behaviour.** The redirect MUST keep the query string. `/` is exempt.

**Edge cases.**
- `/about/`: the system MUST redirect to `/about`.
- `/unknown/`: the system MUST return 404 per FR-009, with or without a redirect first.
- `/about/index.html`: the system MUST NOT return 200. Phase 3 MUST prove this and the
  301 on a test build of prerendered pages.

---

## Shell and navigation

### FR-013: Open desktop navigation menus on hover or click

**Status:** draft
**Priority:** must
**Source:** docs/01-planning/mvp-scope.md#design-source
**Stories:** US-008

**Requirement.** On the Desktop layout, each header item with a dropdown indicator
(Services, Solutions, Products, Industries) MUST open its menu when the pointer hovers
over it or when the visitor clicks it.

**Behaviour.** The menu MUST close when the visitor clicks outside it. At most one menu
MUST be open at a time.

**Edge cases.**
- Pointer leaves the item and its open menu: the menu MUST close.

### FR-014: Operate desktop navigation menus by keyboard

**Status:** draft
**Priority:** must
**Source:** docs/01-planning/mvp-scope.md#design-source
**Stories:** US-008

**Requirement.** A keyboard user MUST be able to reach each dropdown item with Tab,
open its menu with Enter or Space, and close it with Escape.

**Behaviour.** After Escape, focus MUST return to the dropdown item. Each menu link
MUST be reachable with Tab while the menu is open.

**Edge cases.**
- Tab moves focus past the last link of an open menu: the menu MUST close.

### FR-015: Provide the mobile navigation menu

**Status:** draft
**Priority:** must
**Source:** docs/01-planning/mvp-scope.md#design-source
**Stories:** US-009

**Requirement.** On the Mobile layout, the header MUST provide the navigation menu that
the Mobile screens and the "06 — Mobile Blocks" artboard show.

**Behaviour.** The menu MUST open and close with its menu control. Escape MUST close it.

**Edge cases.**
- Visitor follows a link inside the open menu: the menu MUST be closed on the new page.

### FR-051: Keep every header destination reachable without JavaScript

**Status:** draft
**Priority:** must
**Source:** docs/01-planning/mvp-scope.md#design-source
**Stories:** US-008

**Requirement.** With JavaScript disabled, a visitor MUST be able to reach every header
link destination, including every dropdown menu link, in both layouts.

**Behaviour.** Desktop dropdown menus MUST open on pointer hover and on keyboard focus
without JavaScript. The mobile menu MUST open and close with its menu control without
JavaScript. JavaScript MAY add the click, outside-click, and Escape behaviours in FR-013,
FR-014, and FR-015. Confirmed with the user in audit round 2.

**Edge cases.**
- Footer links: each MUST navigate without JavaScript.
- Solutions and Industries pages, once shipped: each MUST be reachable from the header
  without JavaScript.

### FR-016: Send "Book a discovery call" to the contact form

**Status:** draft
**Priority:** must
**Source:** docs/01-planning/mvp-scope.md#scope-contact
**Stories:** US-008

**Requirement.** Every "Book a discovery call" control MUST link to `/contact#contact-form`.

**Behaviour.** On the Contact page, activation MUST scroll to the contact form without
a page reload. On any other page, activation MUST open the Contact page scrolled to
the form.

**Edge cases.**
- JavaScript disabled: the link MUST still navigate to the form anchor.

### FR-017: Load the Google map only on request

**Status:** draft
**Priority:** must
**Source:** docs/01-planning/mvp-scope.md#scope-contact
**Stories:** US-007

**Requirement.** The Contact page MUST NOT request any Google resource until the
visitor activates the "Load map" control.

**Behaviour.** On activation, the page MUST replace the map placeholder with a Google
Maps embed frame. The page MUST NOT load any Google Maps script. The embed MUST need
no API key. Confirmed with the user.

**Edge cases.**
- Embed fails to load: the map container MUST keep the placeholder's dimensions, so the
  page layout MUST NOT shift.
- JavaScript disabled: the placeholder MUST remain. The page MUST NOT make any Google
  request.

### FR-018: Forget the map choice between page loads

**Status:** draft
**Priority:** must
**Source:** docs/01-planning/mvp-scope.md#scope-contact
**Stories:** US-007

**Requirement.** The system MUST NOT store the visitor's map choice in any cookie,
local storage, or session storage.

**Behaviour.** Every load of the Contact page MUST start with the map placeholder.

**Edge cases.**
- None identified. Confirmed with the user.

### FR-019: Point the map at the Bengaluru office

**Status:** draft
**Priority:** must
**Source:** docs/01-planning/mvp-scope.md#scope-contact
**Stories:** US-007

**Requirement.** The map embed MUST query this address: #67, 35th Main 100 Feet Road,
KAS Officers Colony, BTM 2nd Stage, Bengaluru, Karnataka 560068.

**Behaviour.** The embed URL MUST carry the address as its query.

**Edge cases.**
- None identified. Confirmed with the user.

---

## Contact form: fields

### FR-020: Validate the Name field

**Status:** draft
**Priority:** must
**Source:** docs/01-planning/mvp-scope.md#scope-contact-form
**Stories:** US-005

**Requirement.** The system MUST reject a submission whose trimmed Name has fewer than
1 or more than 100 characters.

**Behaviour.** The system MUST show the Name field error "Enter your name."

**Edge cases.**
- Whitespace-only: the system MUST reject it as empty.
- Exactly 100 characters: the system MUST accept it. 101 characters: the system MUST
  reject it.
- Control characters (U+0000–U+001F, U+007F): the system MUST reject them.

### FR-021: Validate the Company field

**Status:** draft
**Priority:** must
**Source:** docs/01-planning/mvp-scope.md#scope-contact-form
**Stories:** US-005

**Requirement.** The system MUST reject a submission whose trimmed Company has fewer
than 1 or more than 150 characters.

**Behaviour.** The system MUST show the Company field error "Enter your company name."

**Edge cases.**
- Whitespace-only: the system MUST reject it as empty.
- Exactly 150 characters: the system MUST accept it. 151: the system MUST reject it.
- Control characters: the system MUST reject them.

### FR-022: Validate the Work email field

**Status:** draft
**Priority:** must
**Source:** docs/01-planning/mvp-scope.md#scope-contact-form
**Stories:** US-005

**Requirement.** The system MUST reject a submission whose trimmed Work email is empty,
longer than 254 characters, or not a valid email address as defined by the WHATWG HTML
Standard for `input type="email"`.

**Behaviour.** The system MUST show the Work email field error "Enter a valid email
address." The system MUST accept personal email domains, such as `gmail.com`.

**Edge cases.**
- Missing `@`, such as `name.company.com`: the system MUST reject it.
- Contains a space, CR, or LF: the system MUST reject it.
- Exactly 254 characters and valid: the system MUST accept it. 255: the system MUST
  reject it.

### FR-023: Validate the Phone field

**Status:** draft
**Priority:** must
**Source:** docs/01-planning/mvp-scope.md#scope-contact-form
**Stories:** US-005

**Requirement.** The system MUST reject a non-empty trimmed Phone value that is longer
than 20 characters or contains a character other than digits, space, `+`, `-`, `(`, or `)`.

**Behaviour.** Phone is optional. The system MUST show the Phone field error "Enter a
valid phone number."

**Edge cases.**
- Empty or absent: the system MUST accept it. The email shows "Not provided" per FR-032.
- Value equal to a country calling code only, such as `+91`: the system MUST treat it
  as empty. "Country calling code" means a code in the FR-024 metadata.
- Exactly 20 valid characters: the system MUST accept it. 21: the system MUST reject it.
- Letters, such as `+91 98AB`: the system MUST reject them.

### FR-024: Pre-fill the Phone country code from the visitor's country

**Status:** draft
**Priority:** must
**Source:** docs/01-planning/mvp-scope.md#scope-contact-form
**Stories:** US-004

**Requirement.** The HTML response for `/contact` MUST contain a Phone field whose
initial value is the country calling code for the request's `CF-IPCountry` header,
followed by one space.

**Behaviour.** The calling code MUST be the one that the Google libphonenumber metadata
assigns to the ISO 3166-1 alpha-2 country. The system MUST use `+91` when the header is
absent, is `XX` or `T1`, or names a country absent from that metadata. The visitor MUST
be able to edit the value. Because the value varies per request, `/contact` MUST NOT be
prerendered and its response MUST carry `Cache-Control: private, no-store`.

**Edge cases.**
- Header `SG`: the field MUST start with `+65 `.
- Header `IN`: the field MUST start with `+91 `.
- Header `US` or `CA`: the field MUST start with `+1 `.
- Local development without Cloudflare: the field MUST start with `+91 `.

### FR-025: Validate the Interest field

**Status:** draft
**Priority:** must
**Source:** docs/01-planning/mvp-scope.md#scope-contact-form
**Stories:** US-005

**Requirement.** The system MUST reject a submission whose Interest is not exactly one
of `Services`, `Solutions`, `Products`, `Careers`, or `Other`.

**Behaviour.** Interest MUST start unselected. The system MUST show the Interest field
error "Choose an interest."

**Edge cases.**
- Unselected: the system MUST reject it.
- A value outside the list in a crafted request, such as `Admin`: the system MUST reject it.
- Different letter case, such as `services`: the system MUST reject it.

### FR-026: Validate the Message field

**Status:** draft
**Priority:** must
**Source:** docs/01-planning/mvp-scope.md#scope-contact-form
**Stories:** US-005

**Requirement.** The system MUST reject a submission whose trimmed Message has fewer
than 20 or more than 4000 characters.

**Behaviour.** Below 20 characters, the system MUST show "Message must be at least 20
characters." Above 4000, it MUST show "Message must be at most 4000 characters."

**Edge cases.**
- Whitespace-only: the system MUST reject it as fewer than 20.
- Exactly 20 and exactly 4000 characters: the system MUST accept them.
- 4000 characters of 4-byte Unicode: the system MUST accept it within NFR-007.
- Line breaks inside the message: the system MUST accept and preserve them.

---

## Contact form: submission

### FR-027: Validate every submission on the server

**Status:** draft
**Priority:** must
**Source:** docs/01-planning/mvp-scope.md#scope-contact-form
**Stories:** US-005

**Requirement.** The contact endpoint MUST apply FR-020 through FR-026 to every
request, regardless of client-side validation.

**Behaviour.** On any field failure, the server MUST respond with HTTP 400, error code
`VALIDATION_FAILED`, and one error entry per failing field. The server MUST NOT send email.

**Edge cases.**
- Body larger than NFR-007 allows: the server MUST respond 413 with `PAYLOAD_TOO_LARGE`.
- Content type other than `application/json`: the server MUST respond 415 with
  `UNSUPPORTED_MEDIA_TYPE`.
- Method other than POST: the server MUST respond 405 with `METHOD_NOT_ALLOWED`.
- Body that is not a JSON object: the server MUST respond 400 with `VALIDATION_FAILED`.
- A required field is absent: the server MUST treat it as empty. Phone absent MUST be
  accepted.
- Unknown extra fields: the server MUST ignore them.

### FR-028: Verify the Turnstile token on the server

**Status:** draft
**Priority:** must
**Source:** docs/01-planning/mvp-scope.md#scope-contact-form
**Stories:** US-006

**Requirement.** The server MUST verify the Turnstile token of every request with
Cloudflare's Siteverify API before it sends email.

**Behaviour.** On a failed or missing token, the server MUST respond 403 with
`SPAM_CHECK_FAILED` and MUST NOT send email.

**Edge cases.**
- Siteverify unreachable or slower than 3 seconds: the server MUST treat the token as
  failed.
- Token reused from an earlier submission: Siteverify rejects it. The server MUST treat
  it as failed.

### FR-048: Use the Managed Turnstile widget with interaction-only appearance

**Status:** draft
**Priority:** must
**Source:** docs/01-planning/mvp-scope.md#scope-contact-form
**Stories:** US-006

**Requirement.** The Turnstile widget MUST render with `appearance: interaction-only`,
so it shows no control unless Turnstile requires interaction.

**Behaviour.** A visitor whom Turnstile passes silently MUST see no Turnstile control.
The user MUST configure the site key as the "Managed" widget type in the Cloudflare
dashboard. The code cannot set the widget type.

**Edge cases.**
- Turnstile requires interaction: the widget MUST show its challenge in the form.

### FR-029: Refresh an expired Turnstile token

**Status:** draft
**Priority:** must
**Source:** docs/01-planning/mvp-scope.md#scope-contact-form
**Stories:** US-006

**Requirement.** When the Turnstile token expires before submission, the page MUST
obtain a new token without visitor action.

**Behaviour.** The page MUST NOT change any field value while it refreshes the token.

**Edge cases.**
- Refresh fails: the submission MUST proceed and fail per FR-028.

### FR-030: Email each valid submission to the sales mailbox

**Status:** draft
**Priority:** must
**Source:** docs/01-planning/mvp-scope.md#scope-contact-form
**Stories:** US-004, US-010

**Requirement.** After FR-027 and FR-028 pass, the server MUST send one email by SMTP
to the sales mailbox.

**Behaviour.** On SMTP acceptance, the server MUST respond with HTTP 200.

**Edge cases.**
- SMTP server unreachable, rejects the message, or exceeds 8 seconds: the server MUST
  respond 502 with `SEND_FAILED`.
- Two identical valid submissions: the server MUST send two emails. It MUST NOT
  deduplicate.

### FR-031: Set the enquiry email subject

**Status:** draft
**Priority:** must
**Source:** docs/01-planning/mvp-scope.md#scope-contact-form
**Stories:** US-010

**Requirement.** The email subject MUST be `Website enquiry <Reference>: <Interest> — <Company>`.
Amended by AMD-001.

**Behaviour.** `<Interest>` and `<Company>` MUST be the trimmed field values. A subject
with non-ASCII characters MUST be encoded per RFC 2047.

**Edge cases.**
- Company with CR or LF: FR-021 rejects control characters, so the subject MUST NOT
  carry a header injection.

### FR-032: Compose the enquiry email body

**Status:** draft
**Priority:** must
**Source:** docs/01-planning/mvp-scope.md#scope-contact-form
**Stories:** US-010

**Requirement.** The email body MUST be plain text listing, in order: Reference, Name,
Company, Work email, Phone, Interest, Message, and Submitted. Amended by AMD-001.

**Behaviour.** Submitted MUST be the server time in the `Asia/Kolkata` zone, formatted
`YYYY-MM-DD HH:mm IST`. An empty Phone MUST appear as `Not provided`.

**Edge cases.**
- Message contains HTML: the body MUST carry it as literal text.
- Message contains line breaks: the body MUST preserve them.

### FR-033: Set Reply-To to the visitor's email

**Status:** draft
**Priority:** must
**Source:** docs/01-planning/mvp-scope.md#scope-contact-form
**Stories:** US-010

**Requirement.** The email `Reply-To` header MUST be the visitor's trimmed Work email.

**Behaviour.** The `From` header MUST be the sender address configured at deploy time,
not the visitor's address.

**Edge cases.**
- Work email with CR or LF: FR-022 rejects it.

### FR-034: Store no submission data

**Status:** draft
**Priority:** must
**Source:** docs/01-planning/mvp-scope.md#scope-contact-form
**Stories:** US-010

**Requirement.** The system MUST NOT write any submitted field value to disk, a
database, a cache, or a log.

**Behaviour.** The sales mailbox MUST be the only copy of a submission.

**Edge cases.**
- SMTP failure: the server MUST discard the submission. It MUST NOT queue it.

### FR-035: Send no email to the visitor

**Status:** draft
**Priority:** must
**Source:** docs/01-planning/mvp-scope.md#scope-contact-form
**Stories:** US-004

**Requirement.** The system MUST NOT send any email to the visitor's address.

**Behaviour.** The only recipient of any email MUST be the sales mailbox.

**Edge cases.**
- None identified. Confirmed with the user: confirmation email is deferred.

### FR-036: Show the thank-you state after a successful submission

**Status:** draft
**Priority:** must
**Source:** docs/01-planning/mvp-scope.md#scope-contact
**Stories:** US-004

**Requirement.** After an HTTP 200 response, the page MUST replace the contact form
with the "Contact — Thank You" design, in place, without navigating.

**Behaviour.** The URL MUST NOT change. Focus MUST move to the thank-you heading. The
"Reference" row MUST show the reference from the response (FR-054). The "Sent to" row
MUST show the visitor's trimmed Work email. Amended by AMD-001.

**Edge cases.**
- Visitor reloads the page: the form MUST show in its initial state per FR-024 and FR-025.

### FR-037: Show field errors inline and keep entered values

**Status:** draft
**Priority:** must
**Source:** docs/01-planning/mvp-scope.md#scope-contact-form
**Stories:** US-005

**Requirement.** When the visitor selects "Send message" and a field fails its rule, the
page MUST show that field's error below the field.

**Behaviour.** The page MUST keep every entered value. Focus MUST move to the first
invalid field. Each error MUST be linked to its field with `aria-describedby`. A 400
response with field entries MUST render those errors in the same way.

**Edge cases.**
- Several fields invalid: the page MUST show every error at once.
- Visitor corrects a field and selects "Send message" again: the corrected field's error
  MUST clear.

### FR-038: Show the send-failure message

**Status:** draft
**Priority:** must
**Source:** docs/01-planning/mvp-scope.md#scope-contact-form
**Stories:** US-006

**Requirement.** On a `SPAM_CHECK_FAILED` or `SEND_FAILED` response, an unexpected
status, or a network failure, the page MUST show: "We couldn't send your message.
Please try again, or email sales@tamsinfotech.com."

**Behaviour.** The page MUST keep every entered value. The visitor MUST be able to
submit again.

**Edge cases.**
- Status 500: the page MUST show the same message.

### FR-039: Time out a submission after 15 seconds

**Status:** draft
**Priority:** must
**Source:** docs/01-planning/mvp-scope.md#scope-contact-form
**Stories:** US-006

**Requirement.** The page MUST abandon a submission request that has no response
after 15 seconds.

**Behaviour.** The page MUST then show the send-failure message from FR-038.

**Edge cases.**
- Server sends the email after the page timed out and the visitor resubmits: sales MAY
  receive two emails. Confirmed acceptable by the user.

### FR-040: Prevent duplicate submission while sending

**Status:** draft
**Priority:** must
**Source:** docs/01-planning/mvp-scope.md#scope-contact-form
**Stories:** US-004

**Requirement.** The page MUST disable the "Send message" control from submission until
the response or the timeout arrives.

**Behaviour.** A double click MUST produce exactly one request.

**Edge cases.**
- Enter pressed repeatedly in a field: the page MUST send exactly one request.

### FR-041: Send no form request without JavaScript

**Status:** draft
**Priority:** must
**Source:** docs/01-planning/mvp-scope.md#scope-contact-form
**Stories:** US-006

**Requirement.** With JavaScript disabled, the contact form MUST NOT send any request.

**Behaviour.** FR-005 keeps the contact details visible. FR-051 covers navigation.

**Edge cases.**
- None identified. Confirmed with the user.

### FR-042: Limit submissions per visitor IP address

**Status:** draft
**Priority:** must
**Source:** docs/01-planning/mvp-scope.md#scope-contact-form
**Stories:** US-006

**Requirement.** The server MUST reject the sixth and later requests from one IP address
within any 10-minute window with HTTP 429 and `RATE_LIMITED`.

**Behaviour.** Every POST to the contact endpoint MUST count, including rejected ones.

**Edge cases.**
- Visitors sharing one IP address: they MUST share one limit. Confirmed acceptable by
  the user.
- The store tracks more than 10,000 addresses: the server MUST evict the entries with
  the oldest last request.
- Server restart: the counters MAY reset.

### FR-049: Show the rate-limit message

**Status:** draft
**Priority:** must
**Source:** docs/01-planning/mvp-scope.md#scope-contact-form
**Stories:** US-006

**Requirement.** On a `RATE_LIMITED` response, the page MUST show "Too many messages.
Please try again in a few minutes."

**Behaviour.** The page MUST keep every entered value.

**Edge cases.**
- None identified.

### FR-050: Identify the client IP address

**Status:** draft
**Priority:** must
**Source:** docs/01-planning/mvp-scope.md#scope-contact-form
**Stories:** US-006

**Requirement.** The server MUST take the client IP address for FR-042 from the
`CF-Connecting-IP` header.

**Behaviour.** This is safe only because the origin accepts traffic from Cloudflare
alone. The user configures that restriction. Confirmed with the user.

**Edge cases.**
- Header absent: the server MUST use the socket peer address.

### FR-053: Apply contact endpoint checks in a fixed order

**Status:** draft
**Priority:** must
**Source:** docs/01-planning/mvp-scope.md#scope-contact-form
**Stories:** US-006

**Requirement.** The contact endpoint MUST evaluate its checks in this order and MUST
respond with the first failure: method (405), content type (415), body size (413),
rate limit (429), field validation (400), Turnstile (403), then SMTP (502).

**Behaviour.** The server MUST NOT call Siteverify for a request that fails an earlier
check. NFR-018 logs the outcome of the first failing check.

**Edge cases.**
- Oversized body with a bad method: the server MUST respond 405.
- Invalid fields from a rate-limited IP address: the server MUST respond 429.

### FR-054: Generate an enquiry reference

**Status:** draft
**Priority:** must
**Source:** docs/01-planning/mvp-scope.md#scope-contact
**Stories:** US-004, US-010

**Requirement.** For each submission that the server accepts for sending, the server
MUST generate one reference of the form `TAMS-<YYYY>-<XXXX>`.

**Behaviour.** `<YYYY>` MUST be the year in the `Asia/Kolkata` zone at submission.
`<XXXX>` MUST be 4 characters drawn with a cryptographically secure random source from
`23456789ABCDEFGHJKLMNPQRSTUVWXYZ`. The HTTP 200 body MUST carry the reference. The
server MUST NOT store references. Added by AMD-001.

**Edge cases.**
- Two submissions MAY receive the same reference. References are not unique
  identifiers.
- Submission rejected before sending: the server MUST NOT return a reference.
- SMTP failure after generation: the server MUST NOT return the reference.

### FR-055: Reset the form with "Send another message"

**Status:** draft
**Priority:** must
**Source:** docs/01-planning/mvp-scope.md#scope-contact
**Stories:** US-004

**Requirement.** Activating the "Send another message" control in the thank-you state
MUST return the contact form, in place, to its initial state per FR-024 and FR-025.

**Behaviour.** The URL MUST NOT change. Focus MUST move to the Name field. The page MUST
obtain a fresh Turnstile token before the next submission. Added by AMD-002.

**Edge cases.**
- JavaScript disabled: the thank-you state cannot occur (FR-041), so none applies.

---

## Search and sharing

### FR-043: Set the page title

**Status:** draft
**Priority:** must
**Source:** docs/01-planning/project-charter.md#6-success-metrics
**Stories:** US-011

**Requirement.** Every page MUST have a `<title>` of `<H1 text> | TAMS Infotech`.

**Behaviour.** `<H1 text>` MUST be the page's main heading from its screen.

**Edge cases.**
- 404 page: the title MUST use the heading from the "404" screen.

### FR-044: Set the page description

**Status:** draft
**Priority:** must
**Source:** docs/01-planning/project-charter.md#6-success-metrics
**Stories:** US-011

**Requirement.** Every page MUST have a `<meta name="description">` equal to its hero
introduction paragraph, at most 160 characters long including any `…`.

**Behaviour.** A shortened description MUST end at a word boundary followed by `…`.

**Edge cases.**
- Screen with no hero introduction paragraph: the description MUST use its first body
  paragraph.

### FR-045: Provide text-only link previews

**Status:** draft
**Priority:** must
**Source:** docs/01-planning/project-charter.md#6-success-metrics
**Stories:** US-011

**Requirement.** Every page MUST carry `og:title`, `og:description`, `og:type`, and
`og:url` tags.

**Behaviour.** The values MUST be the page title, the page description, `website`, and
`https://tamsinfotech.com` followed by the route. The page MUST NOT carry an `og:image`
tag in V1.

**Edge cases.**
- 404 page: it MUST NOT carry `og:url`.

---

## Should: V1 completion

### FR-046: Serve the Solutions pages

**Status:** draft
**Priority:** should
**Source:** docs/01-planning/mvp-scope.md#should-v1-after-the-first-deploy-if-needed
**Stories:** US-013

**Requirement.** The system MUST serve each Solutions page at its route, matching its screen.

| Route | Screen |
|---|---|
| `/solutions/rise-with-sap` | Solutions — RISE with SAP |
| `/solutions/grow-with-sap` | Solutions — GROW with SAP |
| `/solutions/sap-btp` | Solutions — SAP BTP |
| `/solutions/sap-business-ai` | Solutions — SAP Business AI |
| `/solutions/industry-specific-sap-solutions` | Solutions — Industry-specific SAP solutions |
| `/solutions/sap-analytics-and-reporting` | Solutions — SAP Analytics and Reporting |
| `/solutions/sap-integration-suite` | Solutions — SAP Integration Suite |
| `/solutions/sap-automation-and-workflow` | Solutions — SAP Automation and Workflow |

**Behaviour.** Each route MUST respond with HTTP 200. Developers MUST build these after
every must item.

**Edge cases.**
- Request for `/solutions`: the system MUST return 404.

### FR-047: Serve the Industries pages

**Status:** draft
**Priority:** should
**Source:** docs/01-planning/mvp-scope.md#should-v1-after-the-first-deploy-if-needed
**Stories:** US-013

**Requirement.** The system MUST serve each Industries page at its route, matching its screen.

| Route | Screen |
|---|---|
| `/industries/automotive` | Industries — Automotive |
| `/industries/metals-and-steel` | Industries — Metals & Steel |
| `/industries/mill-products` | Industries — Mill Products |
| `/industries/pharmaceuticals` | Industries — Pharmaceuticals |
| `/industries/engineering-and-fabrication` | Industries — Engineering & Fabrication |
| `/industries/consumer-durables` | Industries — Consumer durables |

**Behaviour.** Each route MUST respond with HTTP 200. Developers MUST build these after
every must item.

**Edge cases.**
- Request for `/industries`: the system MUST return 404.
