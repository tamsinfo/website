# Phase 1 Strategy Interview

Started: 2026-09-22T20:28:48Z
Inputs read: docs/00-intake/project-brief.md, docs/00-intake/tech-stack.md, .lonewolf/stack-profile.md

## Batch 1 — Problem, persona, alternative

**Q1.** What breaks today without the new site? Is there a current site?
**Q2.** Walk through one real primary visitor.
**Q3.** What do prospects use instead of the website?

**A (user, verbatim summary preserved):**
- A website exists. Built years ago by a rookie developer on WordPress that was never updated; has known exploits.
- No consistent design system or tokens. Nothing matches brand values; the site is not recognizably TAMS Infotech.
- Company has evolved; much more content exists. Current site lacks a blog, case studies, job postings, and pages for current services.
- Design does not convey an "expensive" or "professional" feel.
- Code quality is very bad: slow loads, lost engagement from bugs and layout issues. Web server setup is bad: expired SSL certificates, improper routing, no caching.
- Primary visitor: prospective customer in a mid-to-high role at a company of any size (small to large) that can afford SAP. Mostly India and South Asia.
- Sales motion: a representative visits on-site, talks to decision-makers, learns operations and pain points, proposes a switch to SAP or additional ERP work. Pitch: TAMS + SAP let the customer focus on sales instead of book-keeping.
- Discovery: mainly direct URL from brochure or business card handed over by the representative. Also the SAP partner profile page, and LinkedIn posts by the social media team.
- No analytics exist on the current site; channels above are best guesses.
- A full design system and all page designs exist in a Paper file. Design and content only need translating to code. No design or content decisions are needed from the agents.

## Batch 2 — Content ownership, top three, non-goals

**Reflection given:** site's main job is to reinforce an in-progress sales conversation (trust, professionalism, capability) more than cold lead generation. Design and content are final in Paper. User did not dispute.

**Q.** Who publishes blog posts, case studies, job postings — and how (repo Markdown, CMS, mix)?
**Q4.** Rank the top three features.
**Q5.** What will the site deliberately NOT do?

**A (user):**
- No CMS and no database for now. Priority: deploy and run as soon as possible.
- The only visitor interaction in V1 is a contact form that emails a mailbox handled by the sales team.
- Blog, case studies, and careers pages use placeholder content only in V1. Implementing them is maintenance-phase work, not essential for V1.
- Top three, ranked: (1) all services pages, (2) all products pages, (3) the contact page. These hook a prospect and convert them.
- Constraint: do not sacrifice professional look or design consistency. Every style decision MUST map to a token or guideline in the design system, named "Meridian Design". No hardcoded values in code; use design tokens.
- Non-goals beyond the above: not yet answered explicitly (asked again in batch 3).

## Batch 3 — Success metrics, analytics, non-goals

**Reflection given:** V1 = ship fast; no CMS/DB; one interaction (contact form -> sales mailbox); blog/case studies/careers are placeholder pages; priority services > products > contact; every visual value traces to a Meridian Design token. User did not dispute.

**Q6.** Three-month success metrics (enquiries/month, Lighthouse, uptime, sales feedback)?
**Q7.** Analytics in V1 (cookieless, GA, none)?
**Q8.** Further explicit non-goals (job applications, i18n, live chat, newsletter)?

**A (user):**
- Goal right now is to deploy quickly so visitors see something better and more professional.
- After V1 deploys, user will add a CMS or DB for careers, blog, etc.
- User is not currently concerned with measuring whether V1 worked. Will look at the proposed metrics after the full website is up.
- Cloudflare will sit in front of the website and supply technical analytics. PostHog or Umami for marketing analytics later.
- Live chat: out of scope.
- Job applications: current site lists open roles in a table. V1 shows a table stating "No openings available" or similar.
- Newsletter signup: not in V1; maybe later with the blog update.
- Internationalization wanted later; V1 is English only. Current design has no language/region switcher; it arrives in a later release.

## Closing sequence

**Heard:** (1) old WordPress site is insecure, off-brand, slow, buggy, badly hosted; undermines in-person pitch. (2) Visitor: mid-to-senior decision-maker, mostly India/South Asia, arrives via brochure/card URL, SAP partner profile, LinkedIn. (3) V1 purpose: fast replacement, professional, Meridian Design. (4) Priority: services > products > contact. (5) Only interaction: contact form -> sales mailbox. (6) Blog and case studies placeholder; careers shows empty roles table. (7) Cloudflare technical analytics; PostHog/Umami later. (8) Out of V1: accounts, CMS/DB, live chat, newsletter, online applications, i18n and switcher.

**Proposed assumptions:**
- A1: launch-time metrics — Lighthouse mobile perf >= 90, a11y and SEO >= 95 on every page; test enquiry reaches sales mailbox within 60 s; zero non-token style values; HTTPS-only with valid Cloudflare certificate.
- A2: business metrics deferred to the analytics release.
- A3: no marketing/analytics cookies in V1; only strictly necessary Cloudflare cookies; no consent banner; privacy policy page still required.

**Open:** target launch date.

**A (user):**
- Target: V1 up and running tonight around 10 PM Pacific time (2026-09-22 22:00 PDT). At worst, tomorrow midnight.
- All assumptions correct, with changes:
  - User accounts and live chat are out of scope permanently, not only in V1.
  - Drop the HTTPS/certificate metric. TLS and Cloudflare certificates are the user's responsibility, outside this project.

