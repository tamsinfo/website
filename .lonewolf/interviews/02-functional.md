# Phase 2 Functional Interview

Started: 2026-09-22T22:03:39Z
Inputs read: docs/01-planning/project-charter.md, docs/01-planning/mvp-scope.md, docs/00-intake/tech-stack.md, .lonewolf/stack-profile.md

## Paper read — Contact (Desktop), 1 tool call (7 used in total)

Artboard children: Header, Contact Hero, Contact Details & Form, Footer. No "Thank You" section found in the Desktop Contact artboard tree.

- Header nav: Home; Services, Solutions, Products, Industries (each with a chevron icon, implying a dropdown); About Us; Careers; Contact Us; CTA "Book a discovery call".
- Hero: breadcrumb Home > Contact Us; CTA "Book a discovery call".
- Details: office "TAMS Infotech Pvt. Ltd.", Bengaluru, Karnataka, India; phone +91 80 4130 1039; email sales@tamsinfotech.com; "What happens next" copy (reply within one working day).
- Map block: placeholder with "Load map" button; note text says the map loads only on visitor choice so no third-party cookies are set before that.
- Form fields: Name ("Your full name"), Company ("Company name"), Work email ("name@company.com"), Phone ("+91"), Interest (select; options Services, Solutions, Products, Careers, Other; shows "Services"), Message (textarea, 140 px). Submit "Send message". Helper text "Routed straight to the right team. Reply within one working day".
- Footer: Services, Products, Company columns; legal links Privacy, Terms, Cookies, Sitemap; SAP trademark notice; "SAP Gold Partner" in description.

## Batch 1 — Contact form

**Proposed:** Name req 1–100 (trimmed); Company req 1–150; Work email req, valid, <=254, personal domains accepted; Phone optional <=20, digits/space/+/-/(); Interest req, one of Services|Solutions|Products|Careers|Other; Message req 20–4000. Email subject "Website enquiry: <Interest> — <Company>", body = all fields + IST timestamp, Reply-To = visitor email. Field errors inline, values preserved. Send failure message: "We couldn't send your message. Please try again, or email sales@tamsinfotech.com." Values preserved. Submit disabled while sending.

**A (user):**
- Wording OK. Field requirements OK (personal email domains accepted).
- Interest starts unselected.
- "+91" is the country code. If the visitor's rough location can be identified, pre-fill the matching country code. Otherwise default to +91.
- The thank-you design is a separate frame titled "Contact — Thank You", not a section within the Contact screen.

## Batch 2 — Country code, thank-you, map, discovery-call CTA

**Proposed:** pre-fill phone with dial code from Cloudflare country header, fallback +91, code-only counts as empty; thank-you at /contact/thank-you (noindex). Map provider Google vs OSM; remember choice? CTA destination?

**A (user):**
- Country code proposal not contested (accepted).
- Thank-you is NOT a separate page. On success the contact form changes to a thank-you state in place.
- Map: Google Maps.
- "Book a discovery call" goes down to the contact form.
- Do not remember the map-loading choice between visits.

## Batch 3 — Map target, URLs and redirects, SEO metadata

**Proposed:** URL scheme (/, /about, /careers, /contact, /services/<slug> x4, /products/<slug> x7, /solutions/<slug>, /industries/<slug>, /privacy); category index paths and Terms/Cookies/Sitemap have no page; old WordPress redirects?; title "<H1> | TAMS Infotech"; description = hero intro truncated to 160 chars; link previews use same title/description; share image?

**A (user):**
- Map target address: #67, 35th Main 100 Feet Road, KAS Officers Colony, BTM 2nd Stage, Bengaluru, Karnataka 560068.
- No redirects from old WordPress URLs. Unknown paths go to the 404 page. It does not matter.
- Link previews text-only for now. Flag for next version: user will design a share banner image.
- URL scheme and title/description proposal: not contested (accepted).

## Batch 4 — Nav menus, no-JS, network failure, accessibility

**Proposed:** desktop dropdowns open on hover or click, keyboard Tab/Enter/Escape, close on outside click; mobile menu per Mobile design; Solutions/Industries items -> "#" until shipped. Form requires JavaScript; rest of site works without it; contact details stay visible. 15 s client timeout -> send-failure message, values kept. Turnstile token auto-refreshes on expiry. WCAG 2.1 AA.

**A (user):** All OK. WCAG 2.1 AA confirmed.

## Audit round 1 — user decisions (2026-09-22)

Questions raised by the requirements auditor, with proposed defaults:
1. Body limit vs 4000-char message: raise body limit to 64 KB. -> ACCEPTED (default)
2. Added NFR numbers (origin p95 <= 500 ms at 200 VUs for 5 min; 5-min uptime sampling, redeploys count as downtime; /health within 1 s; Referrer-Policy strict-origin-when-cross-origin; Lighthouse median of 3 runs). -> ACCEPTED (default)
3. Field error texts: "Enter your name." / "Enter your company name." / "Enter a valid email address." / "Enter a valid phone number." / "Choose an interest." / "Message must be at least 20 characters." / "Message must be at most 4000 characters." -> ACCEPTED (default)
4. Duplicate email after page timeout is acceptable; server budget Turnstile <= 3 s, SMTP <= 8 s (11 s total < 15 s page timeout). -> ACCEPTED (default)
5. Production URL: https://tamsinfotech.com (user answer)
6. Origin reachable only through Cloudflare (tunnel or Cloudflare-IP firewall), configured by the user; app trusts CF-Connecting-IP on that basis. -> ACCEPTED (default)
7. "Contact — Thank You" frame exists on both Desktop and Mobile pages. (user answer: yes)
8. Map: plain Google Maps embed, no API key, no Google script. (user answer)
9. Visitors sharing one IP share the 5 per 10 min limit. -> ACCEPTED (default)
10. Activating "Load map" is sufficient consent for Google cookies; no banner. -> ACCEPTED (default)
11. User runs the external uptime monitor (Cloudflare Health Check or equivalent) against /health; outside the codebase. -> ACCEPTED (default)

## Audit round 2 — user decisions (2026-09-22)

- Auditor N1 (rate-limit message wording) was a false positive: the wording was in the NFR proposal table the user approved ("All OK"), see 02-non-functional.md.
- Footer (from Paper read) links all 4 Services and 7 Products pages; not Solutions or Industries.
- Q: Without JavaScript, may Solutions/Industries be unreachable from the header? A (user): **Must be reachable.** Header menus must work without JavaScript.
- Q: Will the user run one manual form submission on a physical iPhone and one on a physical Android phone? A (user): **Yes, I'll test.**

