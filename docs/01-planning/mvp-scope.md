---
artifact: mvp-scope
phase: 1
status: approved
version: 1
updated: 2026-09-22
owner: scope-manager
depends_on:
  - docs/00-intake/project-brief.md
  - docs/00-intake/tech-stack.md
  - .lonewolf/stack-profile.md
  - docs/01-planning/project-charter.md
---

# MVP Scope: TAMS Infotech Website V1

## Design source

The Paper file "TAMS Infotech — Landing Website" is the single source of design and
content. URL: `https://app.paper.design/file/01M27T0EFKMJE9HYVF14XW481S/3-0`.

| Paper page | Contents |
|---|---|
| Design System | Meridian Design: tokens, foundations, components, page blocks, mobile blocks |
| Desktop | 31 screens, desktop layout |
| Mobile | 31 screens, mobile layout, 390 px artboards |

Agents MUST NOT make design or content decisions. Agents MUST build what the Paper file
shows. When the user updates a screen in Paper, agents rebuild it to match.

Each in-scope screen below MUST ship in both its Desktop and its Mobile layout.

## 1. In Scope (Must)

These items MUST ship in the release on 2026-09-22 by 22:00 PDT.

### scope-home

The Home screen.

### scope-about

The About screen.

### scope-careers

The Careers screen. The open-roles table MUST show a "no openings available" state
exactly as the Paper design shows it. V1 accepts no job applications.

### scope-contact

The Contact screen, including the "Thank You" design sections the user added to it.

### scope-contact-form

The contact form on the Contact screen.

- The server MUST email each valid submission to the sales team mailbox by SMTP.
- The form MUST use Cloudflare Turnstile for spam protection. The challenge MUST be
  non-interactive unless Turnstile decides interaction is absolutely needed.
- After a successful submission, the site MUST show the "Thank You" design from Paper.
- The server MUST NOT store submissions. The sales mailbox is the only copy.
- The server MUST NOT send any email to the visitor.
- The form is the only interaction on the site that sends visitor data.

### scope-services

Four Services screens:

1. S/4HANA Cloud Implementation
2. S/4HANA Managed Services
3. Custom Application Build
4. License Procurement

### scope-products

Seven Products screens:

1. Gate Entry Application
2. EXIM Application
3. TAMS DigiSign
4. TAMS Production Process
5. TAMS Vendor Portal
6. TAMS Connected Factory
7. TAMS Digital Manufacturing & AI

### scope-privacy-policy

The Privacy Policy screen. Its content is a draft. It MUST ship as designed. Legal
review is outside this project.

### scope-not-found

The 404 screen. The server MUST return it for every unknown path.

### scope-responsive-layout

Below the desktop breakpoint, every screen MUST render its Mobile layout. At and above
the desktop breakpoint, every screen MUST render its Desktop layout. Phase 3 takes the
breakpoint value from Meridian Design.

### scope-design-tokens

Every style value MUST map to a Meridian Design token or guideline. Code MUST NOT contain
hardcoded style values. Stack profile section 5 enforces this.

### scope-placeholder-links

Every link to a page that does not exist in the build MUST point to `#`. This applies to
Blog and Case Studies links, and to Solutions and Industries links until those screens ship.

## 2. Out of Scope (Won't)

| Item | Reason |
|---|---|
| User accounts, login, client portal | Permanently excluded by the user. |
| Live chat or chatbot | Permanently excluded by the user. |
| Blog screens | Deferred. The user will add them with a CMS. Agents MUST NOT create them. |
| Case Studies screens | Deferred. The user will add them with a CMS. Agents MUST NOT create them. |
| CMS or database | Deferred for delivery speed. |
| Online job applications | Deferred. Careers shows an empty roles table. |
| Confirmation email to the visitor | Deferred to a later release. |
| Newsletter signup | Deferred. It MAY arrive with the blog release. |
| Tablet-specific layouts | Deferred to the next version. |
| Internationalization and a language switcher | Deferred. V1 is English only. |
| Marketing analytics (PostHog or Umami) | Deferred. Cloudflare supplies technical analytics. |
| Offline mode | Not required. |
| TLS, DNS, and Cloudflare configuration | Owned by the user. |
| Design and content decisions | Owned by the user. |

## 3. Future Enhancements

### Should (V1, after the first deploy if needed)

These items belong to V1. They SHOULD ship tonight. Agents MUST build them after every
Must item. If they miss 22:00 PDT, they MUST ship before V1 closes, no later than
2026-09-24 00:00 PDT.

- **scope-solutions.** Eight Solutions screens: RISE with SAP, GROW with SAP, SAP BTP,
  SAP Business AI, Industry-specific SAP solutions, SAP Analytics and Reporting, SAP
  Integration Suite, SAP Automation and Workflow.
- **scope-industries.** Six Industries screens: Automotive, Metals & Steel, Mill
  Products, Pharmaceuticals, Engineering & Fabrication, Consumer durables.

### Could (later releases)

- CMS or database, with Blog, Case Studies, and real Careers content.
- Visitor confirmation email.
- Newsletter signup.
- Tablet layouts.
- Internationalization and a language or region switcher.
- Marketing analytics.
- Mobile design revisions supplied by the user.
- Business success metrics (charter OQ-1).

## 4. Assumptions

Each item needs user review at Gate G1.

- **S-1.** The site has one visitor type and no roles. Confirmed by the user.
- **S-2.** Enquiries exist only as emails in the sales mailbox. The sales team handles
  data deletion requests. Confirmed by the user.
- **S-3.** Screens between mobile and desktop widths render the Mobile layout until tablet
  layouts arrive. Confirmed by the user.
- **S-4.** The site needs no offline mode. Confirmed by the user.
- **S-5.** The "Thank You" sections on the Contact screen are complete for both Desktop
  and Mobile. Phase 1 did not re-read the Paper file after the user added them. Phase 3
  MUST verify this. Not yet confirmed.
- **S-6.** The artboard name "S/4HANA Managed Servies" is a typo in the artboard name.
  The page title follows the on-screen text in the design. Phase 3 MUST verify this. Not yet confirmed.
- **S-7.** The sales mailbox address, the SMTP relay, and the Turnstile keys are
  supplied by the user at deploy time as environment variables. Not yet confirmed.

## 5. Scope Risks

### RISK-001: Deadline against screen count

**Boundary.** 15 Must screens, in two layouts each (30 layouts), plus the contact form
ship by 22:00 PDT on the day of planning. The full Lonewolf process, from Phase 2 through Phase 5, runs
in that window.
**Mitigation.** Solutions and Industries are Should items, built last, with a fallback
deploy by 2026-09-24 00:00 PDT.

### RISK-002: Design changes during the build

**Boundary.** The user edits Paper while the build runs, as happened during this
interview. A screen built from an older version then drifts from the design.
**Mitigation.** Phase 3 records the Paper token hash. Phase 4 checks it before each wave.

### RISK-003: Paper tool budget

**Boundary.** The user allows 100 Paper tool calls. Phase 1 used 6. Reading 31 screens in
two layouts with exact values can exceed the remaining 94.
**Mitigation.** Phase 3 reads the shared Meridian blocks once and reuses them. It
prioritizes Must screens.

### RISK-004: SMTP deliverability

**Boundary.** No SMTP relay is chosen yet. Mail sent from an unauthenticated domain
can land in spam, and the 60-second delivery metric then fails.
**Mitigation.** The user supplies a relay with SPF and DKIM configured for the sending
domain before the deploy.
