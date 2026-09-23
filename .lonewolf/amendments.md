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
