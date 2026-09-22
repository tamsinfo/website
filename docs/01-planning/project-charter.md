---
artifact: project-charter
phase: 1
status: approved
version: 1
updated: 2026-09-22
owner: product-strategist
depends_on:
  - docs/00-intake/project-brief.md
  - docs/00-intake/tech-stack.md
  - .lonewolf/stack-profile.md
---

# Project Charter: TAMS Infotech Website V1

## 1. Problem Statement

TAMS Infotech sells SAP implementation and ERP services through in-person sales visits.
After a visit, the prospect opens the company website from a brochure or business card.
The current website damages that sales conversation.

- It runs on an old WordPress installation that nobody has patched. It has known exploits.
- It follows no design system. Visitors cannot recognize it as a TAMS Infotech product.
- It does not look professional or premium.
- It loads slowly and shows bugs and layout defects that lose visitor engagement.
- Its hosting is faulty: expired SSL certificates, broken routing, and no caching.
- It omits current services and products, and has no blog, case studies, or job pages.

Every prospect who follows up on a sales visit sees this website. The damage therefore
occurs on every sales cycle.

## 2. Vision

A prospect finishes a meeting with a TAMS Infotech representative and opens the URL on
the brochure. The website loads quickly and looks premium and consistent. It presents
every service and product that TAMS Infotech offers. The prospect sends an enquiry
through the contact form, and the sales team receives it by email. The website
confirms the representative's pitch instead of undermining it.

## 3. Primary Persona

**Role.** A mid-level to senior decision-maker, such as a finance head, operations
director, or owner.

**Company.** Any size, from small to large, that can afford an SAP implementation. The
company runs on SAP already or is evaluating a switch.

**Region.** India and South Asia, in most cases.

**Technical comfort.** A business user. The persona is not an SAP specialist and does
not care about the technology behind the website.

**Workflow entry.** A TAMS Infotech representative visits on-site and discusses the
company's operations and pain points. The representative leaves a brochure or business
card with the URL. The persona opens the website to verify the company and learn about
its services and products. Other entry points are the TAMS Infotech profile on the SAP
partner website and LinkedIn posts by the TAMS Infotech social media team.

## 4. Goals

- **G-1. Replace the current website by the target date.** V1 MUST be deployable by
  2026-09-22 22:00 PDT. The latest acceptable date is midnight PDT at the end of
  2026-09-23.
- **G-2. Present every service and product.** V1 MUST include every services page and
  every products page in the Paper design, in that priority order.
- **G-3. Capture enquiries.** V1 MUST deliver each valid contact-form submission to the
  sales team mailbox by email.
- **G-4. Match Meridian Design exactly.** Every style value in V1 MUST map to a Meridian
  Design token or guideline. Code MUST NOT contain hardcoded style values.
- **G-5. Perform well on mobile.** Every V1 page MUST meet the Lighthouse thresholds in
  section 6.

## 5. Non-Goals

| Non-goal | Reason |
|---|---|
| User accounts, login, or a client portal | Permanently out of scope. The website serves prospects, not customers. |
| Live chat or chatbot widgets | Permanently out of scope. User decision. |
| CMS or database | Deferred. Speed of delivery takes priority. A later release adds one. |
| Blog and case study pages | Deferred to the maintenance phase with a CMS. V1 MUST NOT include these pages. Links to them point to `#`. |
| Real job content | Deferred. V1 Careers shows the designed empty-roles state. |
| Online job applications | Deferred. V1 shows an empty roles table with a "no openings" message. |
| Newsletter signup | Deferred. It MAY arrive with the blog release. |
| Internationalization and a language switcher | Deferred. V1 is English only. The design has no switcher yet. |
| Marketing or product analytics | Deferred. PostHog or Umami arrives in a later release. |
| Design or content decisions | Out of scope. The Paper file holds final design and content. |
| TLS certificates, DNS, and Cloudflare configuration | Owned by the user, outside this project. |

## 6. Success Metrics

The user deferred business metrics. V1 success is measured at launch.

| Metric | Target | Method |
|---|---|---|
| Lighthouse mobile performance | >= 90 on every page | Lighthouse mobile audit against the production build |
| Lighthouse mobile accessibility | >= 95 on every page | Same audit |
| Lighthouse mobile SEO | >= 95 on every page | Same audit |
| Enquiry delivery time | <= 60 seconds from submit to sales mailbox | One real submission against the deployed site with real SMTP |
| Non-token style values | 0 | Stack profile section 8 checks 10 and 11, plus code review |

## 7. Open Questions

- **OQ-1.** Business metrics: enquiries per month, traffic sources, and conversion rate.
  The user decides these after the analytics release.
- **OQ-2.** The fallback deadline "tomorrow midnight" is read as 2026-09-24 00:00 PDT.
  The user MUST confirm this reading at Gate G1.

## Assumptions

- **A-1.** V1 sets no marketing or analytics cookies. Only strictly necessary
  Cloudflare cookies are used. Therefore V1 needs no consent banner. Confirmed by the user.
- **A-2.** A privacy policy page is required, because the contact form collects personal
  data under GDPR and the DPDP Act. Confirmed by the user.
- **A-3.** Cloudflare sits in front of the container and supplies technical analytics.
  The user configures it.
