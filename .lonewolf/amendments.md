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
**Status:** open

### AMD-002: "Send another message" control has no requirement

**Raised by:** system-architect, during Phase 3 (BLOCKED question 2)
**Root cause:** docs/02-requirements/functional-requirements.md (missing FR)
**Trigger:** The thank-you design shows a "Send another message" control. No FR defines
its behaviour, so developers would invent it. The user decided it resets the form in
place to its initial state (FR-024 prefill, FR-025 Interest unselected).

**Blast radius.** Same artifact set and gates as AMD-001.

**Approved by:** user, 2026-09-23T01:11:58Z
**Status:** open

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
**Status:** open
