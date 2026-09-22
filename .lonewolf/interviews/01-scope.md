# Phase 1 Scope Interview

Started: 2026-09-22T21:20:00Z
Inputs read: docs/00-intake/project-brief.md, docs/01-planning/project-charter.md, .lonewolf/interviews/01-strategy.md

## Batch 1 — Page inventory, contact-form behavior, mobile layouts

**Q1.** May I read the Paper page overview to build the page inventory?
**Q2a.** Confirmation email to visitor?  **Q2b.** Spam protection: Turnstile + honeypot, or honeypot + rate limit?
**Q3.** Does Paper include mobile and tablet layouts?

**A (user):**
- Paper file: https://app.paper.design/file/01M27T0EFKMJE9HYVF14XW481S/3-0 . Pages: "Design System" (design system and guidelines), "Desktop" (all screens, desktop layout), "Mobile" (all screens, mobile layout).
- Mobile layout has items the user will change in future. Design is solely the user's job: user supplies updated designs, agents code them. Do not ask or reason about design further.
- Tablet layouts: next version.
- No confirmation email to the visitor in V1; show a thank-you page. Confirmation emails come in a later release.
- Use Cloudflare Turnstile for spam protection. Keep the challenge non-interactive unless absolutely needed.

**Paper read (4 tool calls: guide, basic info x3).** File "TAMS Infotech — Landing Website", token hash afb6ef06.
- Design System page, 7 artboards: 00 Cover, 01 Foundations, 02 Actions & Forms, 03 Data Display, 04 Navigation & Shell, 05 Page Blocks, 06 Mobile Blocks. Tokens are in Tailwind v4 namespaces (--color-*, --font-*, --text-*, --font-weight-*, --tracking-*, --leading-*, --breakpoint-*, --container-*, --spacing-*, --radius-*). Fonts: Archivo (display), Inter (sans), IBM Plex Mono (mono).
- Desktop page, 29 screens: Home, About, Careers, Contact; Services x4 (S/4HANA Cloud Implementation, S/4HANA Managed Services, Custom Application Build, License Procurement); Solutions x8 (RISE with SAP, GROW with SAP, SAP BTP, SAP Business AI, Industry-specific SAP solutions, SAP Analytics and Reporting, SAP Integration Suite, SAP Automation and Workflow); Products x7 (Gate Entry Application, EXIM Application, TAMS DigiSign, TAMS Production Process, TAMS Vendor Portal, TAMS Connected Factory, TAMS Digital Manufacturing & AI); Industries x6 (Automotive, Metals & Steel, Mill Products, Pharmaceuticals, Engineering & Fabrication, Consumer durables).
- Mobile page, 23 screens: same as Desktop minus all 6 Industries screens.
- No screen found in either page for: Blog, Case Studies, Privacy Policy, Contact thank-you, 404/error.

## Batch 2 — Undesigned pages, Solutions and Industries priority

**Q1.** For Blog, Case Studies, Privacy Policy, Contact thank-you, 404, and Industries-mobile: will the user design them, or are they out of V1?
**Q2.** Solutions (8): required tonight?  **Q3.** Industries (6): required tonight?

**A (user):**
- Blog and Case Studies: ignore for now. Do not create them.
- User added Privacy Policy and 404 screens to both Desktop and Mobile, and the 6 Industries screens to Mobile.
- Privacy Policy content is a draft. Build and publish it anyway. Legal detail is not a concern for this project.
- Solutions and Industries: ideally in tonight's release, but build them last. If not done by 10 PM, finish them tomorrow and redeploy before V1 officially closes.
- Contact thank-you page: not addressed in this answer.

**Paper re-read (2 tool calls; 6 used in total).** Desktop now 31 screens (adds 404, Privacy Policy). Mobile now 31 screens (adds 6 Industries, 404, Privacy Policy). Mobile artboards are 390 px wide. Still no thank-you screen.

## Closing sequence

**Heard:** Must tonight (desktop+mobile): Home, About, Careers (empty roles table), Contact, Services x4, Products x7, Privacy Policy (draft), 404, contact form (SMTP to sales mailbox, invisible Turnstile, thank-you). Should (tonight if time, else next day before V1 closes): Solutions x8, Industries x6, built last. Won't in V1: Blog, Case Studies, visitor confirmation email, tablet layouts, i18n. Never: accounts, live chat.

**Proposed assumptions:** S1 one visitor type, no stored data, enquiries live only in the sales mailbox, deletion requests handled by sales. S2 below the desktop breakpoint render Mobile layout, above it Desktop; tablet layouts next version. S3 no offline mode.

**Open:** thank-you page design; behavior of links to unbuilt pages.

**A (user):**
- Everything looks good (S1–S3 confirmed).
- User added "Thank You" design sections for the Contact screen in Paper. (Not re-read in Phase 1; Phase 3 reads it.)
- Links to pages that do not exist yet MUST point to "#".

