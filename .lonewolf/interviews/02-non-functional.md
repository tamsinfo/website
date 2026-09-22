# Phase 2 Non-Functional Interview

Started: 2026-09-22T22:17:31Z
Inputs read: docs/01-planning/project-charter.md, docs/01-planning/mvp-scope.md, docs/00-intake/tech-stack.md, .lonewolf/stack-profile.md

## Functional closing summary (presented before NFR batch)

Heard: 15 Must screens x2 layouts at agreed URLs, "#" for missing pages, 404 for unknown paths, no redirects; 6 form fields with agreed limits, Interest unselected; country code from Cloudflare country, fallback +91, code-only = empty; invisible Turnstile, email to sales with Reply-To visitor, in-place thank-you, inline field errors with values kept, 15 s timeout, JS required; Google Maps on click, not remembered, BTM 2nd Stage address; discovery-call CTA -> contact form; hover/click/keyboard menus, mobile menu per design; titles "<H1> | TAMS Infotech", description from hero intro, text-only previews, share image next version; WCAG 2.1 AA. User raised no correction.

## Batch 1 — NFR proposal table

**Proposed:**
- Lighthouse mobile perf >= 90, a11y >= 95, SEO >= 95; LCP <= 2.5 s; CLS <= 0.1 (Lighthouse simulated mobile throttling).
- Page weight: first load <= 1 MB transferred incl. fonts and images.
- Form endpoint p95 <= 5 s including SMTP.
- Scale: 50 concurrent visitors at launch, 200 at 12 months. Max form payload 16 KB.
- Rate limit: 5 submissions per IP per 10 minutes; message "Too many messages. Please try again in a few minutes."
- Uptime 99.5% monthly; RTO 30 min via redeploy of same image; no RPO (no data).
- Security headers: CSP limiting scripts to self, Turnstile, Google Maps; frame blocking; referrer policy. Non-root container. Secrets only from env. Self-hosted fonts (no Google Fonts).
- Logging: one line per submission with outcome only (sent, invalid, rate-limited, spam-check-failed, send-failed); no name/email/phone/message; stdout; retention per platform.
- Alerting: none in V1; /health endpoint for external checks.
- Browsers: latest 2 of Chrome, Edge, Firefox, Safari; iOS Safari 16+; Android Chrome. Min viewport 360 px.
- Keyboard-only operation for every link, menu, field, button.
- Backups: none; rollback = redeploy previous image.

**A (user):** All OK.

