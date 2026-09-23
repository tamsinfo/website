---
artifact: user-stories
phase: 2
status: stale
version: 2
updated: 2026-09-22
owner: functional-requirements-analyst
depends_on:
  - docs/01-planning/project-charter.md
  - docs/01-planning/mvp-scope.md
  - docs/02-requirements/functional-requirements.md
---

# User Stories: TAMS Infotech Website V1

**Personas.**
- **Prospect.** The charter primary persona: a mid-to-senior decision-maker who opens
  the site after a TAMS Infotech sales visit.
- **Sales team member.** A TAMS Infotech employee who reads the sales mailbox.

---

### US-001: Verify the company after a sales visit

**As a** prospect
**I want** to read about TAMS Infotech, its team, and its hiring status
**So that** I can confirm the company is established before I commit time to it

**Covers:** FR-001, FR-002, FR-003, FR-004, FR-052

**AC-001.1** Given a prospect, when they open `/`, then the system returns HTTP 200 with
a page that matches the "Home" screen.

**AC-001.2** Given a prospect, when they open `/about`, then the system returns HTTP 200
with a page that matches the "About" screen.

**AC-001.3** Given a prospect, when they open `/careers`, then the page shows the
open-roles table in its "no openings available" state and no application control.

**AC-001.4** Given a prospect, when they open `/about/?ref=card`, then the system
redirects with HTTP 301 to `/about?ref=card`.

### US-002: Understand the services on offer

**As a** prospect
**I want** a dedicated page for each TAMS Infotech service
**So that** I can match a service to the problem the representative discussed

**Covers:** FR-006

**AC-002.1** Given a prospect, when they open each of the four Services routes, then each
returns HTTP 200 with a page that matches its screen.

**AC-002.2** Given a prospect, when they open `/services`, then the system returns HTTP
404 with the 404 page.

**AC-002.3** Given a prospect, when they open `/services/unknown`, then the system returns
HTTP 404 with the 404 page.

### US-003: Understand the products on offer

**As a** prospect
**I want** a dedicated page for each TAMS Infotech product
**So that** I can judge which product fits my plant or business

**Covers:** FR-007

**AC-003.1** Given a prospect, when they open each of the seven Products routes, then
each returns HTTP 200 with a page that matches its screen.

**AC-003.2** Given a prospect, when they open `/products`, then the system returns HTTP
404 with the 404 page.

### US-004: Send an enquiry to the sales team

**As a** prospect
**I want** to send a message from the Contact page
**So that** the sales team follows up with me

**Covers:** FR-005, FR-024, FR-030, FR-035, FR-036, FR-040

**AC-004.1** Given a prospect on `/contact` with every field valid and a passing
Turnstile token, when they select "Send message", then the server responds 200 and the
form area changes in place to the "Contact — Thank You" design without a URL change.

**AC-004.2** Given a request carrying `CF-IPCountry: SG`, when the Contact page renders
the form, then the Phone field starts with `+65 `.

**AC-004.3** Given a request with no `CF-IPCountry` header, when the Contact page renders
the form, then the Phone field starts with `+91 `.

**AC-004.4** Given a prospect, when they double-click "Send message" on a valid form,
then exactly one request reaches the server.

**AC-004.5** Given a successful submission, when the SMTP transcript is inspected, then
the only recipient is the sales mailbox and no email goes to the prospect's address.

**AC-004.6** Given a prospect in the thank-you state, when they reload the page, then the
form shows in its initial state: Phone pre-filled per FR-024 and Interest unselected.

**AC-004.7** Given a prospect, when they open `/contact`, then the page shows
`+91 80 4130 1039` and `sales@tamsinfotech.com`.

**AC-004.8** Given a successful submission, when the thank-you state shows, then keyboard
focus is on the thank-you heading.

### US-005: Correct invalid input

**As a** prospect
**I want** to see exactly which field is wrong without losing what I typed
**So that** I can fix it and send the message in one attempt

**Covers:** FR-020, FR-021, FR-022, FR-023, FR-025, FR-026, FR-027, FR-037

**AC-005.1** Given a form with an empty Name, when the prospect submits, then "Enter your
name." shows below Name, focus moves to Name, and every other value stays.

**AC-005.2** Given a Work email of `name.company.com`, when the prospect submits, then
"Enter a valid email address." shows below Work email.

**AC-005.3** Given a Phone field holding only `+91`, when the prospect submits an
otherwise valid form, then the submission succeeds and the email shows Phone as
`Not provided`.

**AC-005.4** Given a Message of 19 characters, when the prospect submits, then "Message
must be at least 20 characters." shows below Message.

**AC-005.5** Given an unselected Interest, when the prospect submits, then "Choose an
interest." shows below Interest.

**AC-005.6** Given a crafted POST that bypasses the page with Interest `Admin`, when it
reaches the server, then the server responds 400 with `VALIDATION_FAILED` and sends no email.

**AC-005.7** Given a crafted POST with a 65,537-byte body, when it reaches the server,
then the server responds 413 with `PAYLOAD_TOO_LARGE`.

**AC-005.8** Given a Company of exactly 150 characters, when the prospect submits an
otherwise valid form, then the submission succeeds.

**AC-005.9** Given a valid Work email of exactly 254 characters, when the prospect submits
an otherwise valid form, then the submission succeeds.

**AC-005.10** Given a Message of 4000 four-byte characters and every other field at its
maximum, when the prospect submits, then the server does not reject it for size.

### US-006: Recover from a failed send

**As a** prospect
**I want** a clear message and my text preserved when sending fails
**So that** I can retry or email sales directly

**Covers:** FR-028, FR-029, FR-038, FR-039, FR-041, FR-042, FR-048, FR-049, FR-050, FR-053

**AC-006.1** Given the SMTP server is unreachable, when the prospect submits a valid form,
then the page shows "We couldn't send your message. Please try again, or email
sales@tamsinfotech.com." and keeps every value.

**AC-006.2** Given a submission with a missing Turnstile token, when it reaches the
server, then the server responds 403 with `SPAM_CHECK_FAILED` and sends no email.

**AC-006.3** Given the server does not respond, when 15 seconds pass, then the page shows
the send-failure message and re-enables "Send message".

**AC-006.4** Given five requests carrying `CF-Connecting-IP: 203.0.113.7` within 10
minutes, when a sixth arrives with the same header, then the server responds 429 with
`RATE_LIMITED`.

**AC-006.5** Given a browser with JavaScript disabled, when the prospect opens
`/contact`, then the contact details are visible and the form sends no request.

**AC-006.6** Given a Turnstile token that expires while the prospect types, when the
token refreshes, then no field value changes.

**AC-006.7** Given a `RATE_LIMITED` response, when the page handles it, then it shows "Too
many messages. Please try again in a few minutes." and keeps every value.

**AC-006.8** Given Turnstile test keys that always pass, when the prospect opens
`/contact`, then no Turnstile challenge control is visible.

**AC-006.9** Given a PUT request with a 70 KB body, when it reaches the contact endpoint,
then the server responds 405 and does not call Siteverify.

### US-007: See where the office is

**As a** prospect
**I want** to load a map of the office when I choose to
**So that** I can plan a visit without being tracked by default

**Covers:** FR-017, FR-018, FR-019

**AC-007.1** Given a prospect opens `/contact`, when the page finishes loading, then the
browser has made no request to any Google Maps domain.

**AC-007.2** Given a prospect activates "Load map", when the embed frame appears, then
its URL queries #67, 35th Main 100 Feet Road, KAS Officers Colony, BTM 2nd Stage,
Bengaluru, Karnataka 560068, and the page loaded no Google script.

**AC-007.3** Given a prospect loaded the map, when they reload `/contact`, then the map
placeholder shows again and no Google Maps request occurs.

### US-008: Move around the site

**As a** prospect
**I want** working menus and calls to action on every page
**So that** I reach the service, product, or contact form I need

**Covers:** FR-012, FR-013, FR-014, FR-016, FR-051

**AC-008.1** Given a Desktop layout, when the prospect hovers over "Services", then its
menu opens, and when the pointer leaves the item and menu, then it closes.

**AC-008.2** Given a keyboard user focused on "Products", when they press Enter, then the
menu opens, and when they press Escape, then it closes and focus returns to "Products".

**AC-008.3** Given any page other than Contact, when the prospect activates "Book a
discovery call", then the browser opens `/contact` scrolled to the contact form.

**AC-008.4** Given a build without Solutions pages, when the prospect inspects a
Solutions menu link, then its `href` is `#`.

**AC-008.5** Given the footer, when the prospect inspects the Terms, Cookies, and Sitemap
links, then each `href` is `#`.

**AC-008.6** Given any Blog or Case Studies link in the header or footer, when the
prospect inspects it, then its `href` is `#`.

**AC-008.7** Given the prospect is on `/contact`, when they activate "Book a discovery
call", then the page scrolls to the form without a reload.

**AC-008.8** Given JavaScript is disabled, when the prospect follows each footer link to a
built page, then each opens with HTTP 200, and the footer holds a link to each of the
four Services and seven Products routes.

**AC-008.9** Given JavaScript is disabled on the Desktop layout, when a keyboard user
tabs to "Services", then its menu opens and each menu link is reachable with Tab.

**AC-008.10** Given JavaScript is disabled on the Mobile layout, when the prospect
activates the menu control, then the menu opens and each link navigates.

### US-009: Use the site on a phone

**As a** prospect
**I want** the site to fit my phone and match the brand everywhere
**So that** I get the same professional impression on any device

**Covers:** FR-010, FR-011, FR-015

**AC-009.1** Given a 390 px viewport, when the prospect opens any page, then it renders
the page's Mobile screen layout.

**AC-009.2** Given a viewport one pixel narrower than the desktop breakpoint, when the
prospect opens any page, then it renders the Mobile layout.

**AC-009.5** Given a viewport exactly at the desktop breakpoint, when the prospect opens
any page, then it renders the Desktop layout.

**AC-009.3** Given a Mobile layout, when the prospect opens the menu control and presses
Escape, then the menu closes.

**AC-009.4** Given the source tree, when the stack profile section 8 checks 10 and 11
run, then both return no matches.

### US-010: Act on an enquiry from the mailbox

**As a** sales team member
**I want** each enquiry as one clearly labeled email I can reply to directly
**So that** I respond to the prospect within one working day

**Covers:** FR-030, FR-031, FR-032, FR-033, FR-034

**AC-010.1** Given a valid submission from Acme Steel with Interest "Products", when the
email arrives, then its subject is `Website enquiry: Products — Acme Steel`.

**AC-010.2** Given a valid submission, when the email arrives, then the body lists Name,
Company, Work email, Phone, Interest, Message, and Submitted in that order, with
Submitted in `YYYY-MM-DD HH:mm IST`.

**AC-010.3** Given a valid submission, when the sales team member selects Reply, then the
reply is addressed to the prospect's Work email.

**AC-010.4** Given any submission, when the server's disk and logs are inspected, then no
submitted field value appears.

### US-011: Find and share the site

**As a** prospect
**I want** clear page titles and previews in search results and chat apps
**So that** I recognize TAMS Infotech pages and can share them with colleagues

**Covers:** FR-043, FR-044, FR-045

**AC-011.1** Given any page, when its HTML is read, then `<title>` equals the page's main
heading followed by ` | TAMS Infotech`.

**AC-011.2** Given any page, when its HTML is read, then the meta description has at most
160 characters and comes from the hero introduction.

**AC-011.3** Given any page, when its HTML is read, then it has `og:title`,
`og:description`, `og:type`, and `og:url`, and no `og:image`.

### US-012: Read the privacy policy and recover from a bad link

**As a** prospect
**I want** to read how my data is handled and to land on a branded page for bad links
**So that** I trust the site with my details

**Covers:** FR-008, FR-009

**AC-012.1** Given a prospect, when they open `/privacy`, then the system returns HTTP 200
with a page that matches the "Privacy Policy" screen.

**AC-012.2** Given a prospect, when they open `/wp-admin`, then the system returns HTTP
404 with the page that matches the "404" screen.

**AC-012.3** Given a request for `/../etc/passwd`, when it reaches the server, then the
system returns 404 and exposes no file.

**AC-012.4** Given a request whose path exceeds 2048 characters, when it reaches the
server, then the system returns 404 or 414 and a following request for `/` returns 200.

### US-013: Explore solutions and industries

**As a** prospect
**I want** pages on SAP solutions and on my industry
**So that** I see TAMS Infotech's depth in my sector

**Covers:** FR-046, FR-047

**AC-013.1** Given a build with Solutions pages, when the prospect opens each of the eight
Solutions routes, then each returns HTTP 200 with a page that matches its screen.

**AC-013.2** Given a build with Industries pages, when the prospect opens each of the six
Industries routes, then each returns HTTP 200 with a page that matches its screen.

**AC-013.3** Given a build with Solutions pages, when the prospect inspects a Solutions
menu link, then its `href` is the page's route, not `#`.
