# Amendments

### AMD-001: Enquiry reference shown on thank-you state has no requirement

**Raised by:** system-architect, during Phase 3 (BLOCKED question 1)
**Root cause:** docs/02-requirements/functional-requirements.md, FR-031, FR-032, FR-036
**Trigger:** The approved "Contact — Thank You" Paper design shows a "Reference" row
(placeholder TAMS-2026-0412). No FR defines a reference, and FR-031/FR-032 fix the email
subject and body without one. The requirements under-specified the design the scope
commits to (scope-contact). The user decided the server generates a random,
non-sequential reference per valid submission, returns it in the 200 body, shows it on
the thank-you state, and includes it in the email subject and body.

**Blast radius.** 6 artifacts, gates G2 and G3 (G3 not yet approved).
- docs/02-requirements/functional-requirements.md (root cause, in-review)
- docs/02-requirements/user-stories.md
- .lonewolf/audit-requirements.md
- docs/03-design/system-architecture.md
- docs/03-design/data-model.md
- docs/03-design/api-contract.yaml (frontmatter in YAML comments; not visible to impact.py)

**Approved by:** user, 2026-09-23T01:11:58Z
**Resolution.** Resolved 2026-09-23T01:38:32Z. FR-031/FR-032/FR-036 amended; FR-054 added; contract 200 body carries `reference`; ENT-007 added. Regenerated: docs/02-requirements/functional-requirements.md v3, docs/02-requirements/non-functional-requirements.md v3, docs/02-requirements/user-stories.md v3 (G2 re-approved 2026-09-23T01:13:20Z); docs/03-design/system-architecture.md v2, docs/03-design/api-contract.yaml v2, docs/03-design/data-model.md v2 (G3 approved 2026-09-23T01:38:32Z). .lonewolf/audit-requirements.md remains stale (auditor report, not regenerated).
**Status:** resolved

### AMD-002: "Send another message" control has no requirement

**Raised by:** system-architect, during Phase 3 (BLOCKED question 2)
**Root cause:** docs/02-requirements/functional-requirements.md (missing FR)
**Trigger:** The thank-you design shows a "Send another message" control. No FR defines
its behaviour, so developers would invent it. The user decided it resets the form in
place to its initial state (FR-024 prefill, FR-025 Interest unselected).

**Blast radius.** Same artifact set and gates as AMD-001.

**Approved by:** user, 2026-09-23T01:11:58Z
**Resolution.** Resolved 2026-09-23T01:38:32Z. FR-055 added; UI spec SCR-004 specifies the reset. Regenerated: docs/02-requirements/functional-requirements.md v3, docs/02-requirements/non-functional-requirements.md v3, docs/02-requirements/user-stories.md v3 (G2 re-approved 2026-09-23T01:13:20Z); docs/03-design/system-architecture.md v2, docs/03-design/api-contract.yaml v2, docs/03-design/data-model.md v2 (G3 approved 2026-09-23T01:38:32Z). .lonewolf/audit-requirements.md remains stale (auditor report, not regenerated).
**Status:** resolved

### AMD-003: CSP forbids the Cloudflare Web Analytics beacon the user needs

**Raised by:** orchestrator, during Phase 3 (from system-architect deployment prerequisite)
**Root cause:** docs/02-requirements/non-functional-requirements.md, NFR-011
**Trigger:** NFR-011 allows scripts only from the site origin and Turnstile. The user
requires Cloudflare Web Analytics automatic injection, which loads
https://static.cloudflareinsights.com/beacon.min.js and reports to
https://cloudflareinsights.com. The NFR was written before this operational need was
known; the requirement, not the design, is wrong.

**Blast radius.** non-functional-requirements.md (root cause, in-review) plus
.lonewolf/audit-requirements.md, docs/03-design/system-architecture.md,
docs/03-design/data-model.md, docs/03-design/api-contract.yaml. Gates G2 and G3.

**Approved by:** user, 2026-09-23T01:11:58Z
**Resolution.** Resolved 2026-09-23T01:38:32Z. NFR-011 amended; ADR-002 CSP adds Cloudflare Insights origins (re-proven on the scratch build). Regenerated: docs/02-requirements/functional-requirements.md v3, docs/02-requirements/non-functional-requirements.md v3, docs/02-requirements/user-stories.md v3 (G2 re-approved 2026-09-23T01:13:20Z); docs/03-design/system-architecture.md v2, docs/03-design/api-contract.yaml v2, docs/03-design/data-model.md v2 (G3 approved 2026-09-23T01:38:32Z). .lonewolf/audit-requirements.md remains stale (auditor report, not regenerated).
**Status:** resolved

### Known deviation KD-001: `.prettierignore` scopes the oxfmt gate

**Raised by:** backend-developer, during TASK-001 (BLOCKED question 1)
**Artifact:** .lonewolf/stack-profile.md, sections 1, 7, and 8 (`bunx oxfmt --check`)
**Problem:** The bare gate also formats Markdown, YAML, and JSX. It fails on the frozen
Phase 0–3 artifacts in `docs/`, `.lonewolf/`, and `deploy/`, which MUST NOT be rewritten.
**Decision:** The user accepted a `.prettierignore` (ignore paths only: `docs/`,
`.lonewolf/`, `deploy/`) as a deviation, 2026-09-22. No gate reopened. The profile
wording SHOULD be corrected in a later amendment.
**Status:** accepted deviation

### Known deviation KD-002: SMTP timeout does not abort an in-flight send

**Raised by:** code-reviewer, review of feature/contact-endpoint (TASK-002), medium finding
**Artifact:** docs/03-design/system-architecture.md, ADR-004 (assumes `transport.close()` stops a send)
**Problem:** In nodemailer 10.0.10, `close()` does not abort an in-flight SMTP session. After
the 8 s deadline returns 502, a slow relay can still deliver the email; a retry then produces
a duplicate in the sales mailbox.
**Decision:** Treated as the same duplicate-email outcome the user accepted in audit round 1
(Q4, FR-039 edge case). Recorded by the orchestrator 2026-09-22; the user may route it to
`/lonewolf:amend` against ADR-004 instead.
**Status:** accepted deviation (pending user objection)

### Known deviation KD-003: Meridian 4 px grid unit declared as `--spacing`

**Raised by:** code-reviewer, review of feature/site-shell (TASK-003), high finding 1
**Artifact:** docs/03-design/design-system.md §3 and §4A; FR-011
**Problem:** The Paper design uses many 4 px-grid sizes with no named token (52 px heights,
340 px column, 18 px line heights, 760 px widths). Tailwind multiplier classes (`h-13`,
`w-85`, `leading-4.5`) compute from Tailwind's default `--spacing`, which is not a Meridian token.
**Decision (user, 2026-09-22):** Declare Meridian's own grid unit `--spacing: 4px` (equal to
`--spacing-1`) as a derived token in `src/styles/global.css` §4A block, so multiplier
utilities are token-derived and the design is reproduced exactly. Recorded as a deviation to
avoid reopening G3 tonight; design-system.md MUST be updated in a later amendment.
**Status:** accepted deviation

### Known deviation KD-004: Desktop header spacing at 1280–1439 px

**Raised by:** code-reviewer, review of feature/site-shell (TASK-003), medium finding
**Artifact:** docs/03-design/ui-specification.md (header), Paper desktop header (1440 px)
**Problem:** The designed header row (~1,300 px) does not fit within 80 px gutters at 1280 px.
**Decision (user, 2026-09-22):** Between `--breakpoint-xl` and `--breakpoint-2xl` the header
uses 40 px gutters and tighter gaps; at ≥ 1440 px it matches the design exactly.
**Status:** accepted deviation

### Schedule note SN-001: Charter G-1 deadline missed

**Recorded:** 2026-09-22 22:53 PDT by the orchestrator.
**Fact:** Charter goal G-1 (deployable by 2026-09-22 22:00 PDT; fallback 2026-09-24 00:00 PDT)
was missed. A usage-limit pause stopped all agents from ~19:15 to 22:50 PDT. At 22:51 the
Must pages, Phase 5, and Gate G6 remained.
**Decision (user):** Continue the full gated process; V1 deploys when G6 passes. No
requirement changed.

### Known deviation KD-005: Vendor Portal mobile "In build" banner omitted

**Raised by:** frontend-developer, TASK-006 (BLOCKED 1)
**Problem:** `mobile/products-vendor-portal.jsx` has a dismissible warning banner absent from the Desktop screen; no FR defines dismiss behaviour.
**Decision (user, 2026-09-22):** Omit the banner on both layouts for V1.
**Status:** accepted deviation

### Known deviation KD-006: Detail-page section types beyond ui-specification §5

**Raised by:** frontend-developer, TASK-006 (BLOCKED 2)
**Problem:** ui-specification §5 lists only card grid, table, stat band, and process rail; the snapshots also use leads, callouts, captions, checklists, chip groups, an architecture diagram, bullet columns, and always-open FAQ lists.
**Decision (user, 2026-09-22):** Accept as drawn; the spec list was incomplete. ui-specification.md SHOULD be corrected in a later amendment.
**Status:** accepted deviation

### Known deviation KD-007: Four design-note captions removed

**Raised by:** frontend-developer, TASK-006 (out-of-scope note)
**Problem:** Four captions read like notes left in the design: Gate Entry "Both diagrams share the same component"; Digital Manufacturing & AI "…and the page says so"; Connected Factory "no vendor is named on the site"; Vendor Portal "Two audiences, one diagram…".
**Decision (user, 2026-09-22):** Remove these four captions. The user will reconcile the Paper design.
**Status:** accepted deviation
