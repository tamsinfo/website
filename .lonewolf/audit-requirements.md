---
artifact: audit-requirements
phase: 2
status: draft
version: 2
updated: 2026-09-22
owner: requirements-auditor
depends_on:
  - docs/01-planning/project-charter.md
  - docs/01-planning/mvp-scope.md
  - docs/02-requirements/functional-requirements.md
  - docs/02-requirements/non-functional-requirements.md
  - docs/02-requirements/user-stories.md
  - .lonewolf/stack-profile.md
---

# Requirements Audit, Round 2: TAMS Infotech Website V1

Documents audited: FR v2 (FR-001..FR-052), NFR v2 (NFR-001..NFR-028), US v2 (US-001..US-013).

## Summary

| Severity | Count |
|---|---|
| critical | 0 |
| high | 1 |
| medium | 7 |
| low | 9 |
| **total** | **17** |

Verdict: **NOT READY — 1 blocking finding** (0 critical, 1 high).

Accepted residuals, not re-raised: L7 (no minimum phone content) and the M1 scope
wording in mvp-scope scope-contact, which must go through `/lonewolf:amend`.

## Round-1 disposition

| ID | Status | Note |
|---|---|---|
| C1 | resolved | NFR-007 is now 64 KB and the body is JSON. Worst case, with 4-byte characters `\u`-escaped plus a 2048-char token, is about 53.4 KB. |
| C2 | resolved | FR-024 makes `/contact` on-demand with `Cache-Control: private, no-store`, which the stack permits because an FR names it. NFR-015 reads the Turnstile site key at runtime. |
| H1 | resolved | NFR-028 added. |
| H2 | partial | See R1 below. |
| H3 | resolved | The user accepted the texts (decision 3). |
| H4 | resolved | RA-4 removed. 3 s + 8 s = 11 s, below the 15 s page timeout. |
| H5 | resolved | Production origin `https://tamsinfotech.com`. |
| H6 | resolved | FR-050, based on decision 6. |
| H7 | resolved | NFR-005 uses a distinct `CF-Connecting-IP` for each group of 5. |
| H8 | resolved | NFR-011 requires an ADR plus proof before G3. Hash only, no nonce. |
| M1 | resolved | The frame exists on both pages (decision 7). The scope wording is an accepted residual. |
| M2, M13 | resolved | Plain embed, no script, no key. NFR-026 added. |
| M3 | resolved | Split into FR-041 and FR-051. FR-051 has a new defect (N3). |
| M4 | resolved | FR-052. |
| M5 | resolved | Edge case removed. |
| M6 | resolved | `POST /api/contact`, JSON only, absent field treated as empty. |
| M7 | partial | See R4. |
| M8, M9, M10, M11, M14, M16 | resolved | |
| M12 | partial | Decision 10 answers it. The charter text is still stale (R5). |
| M15 | partial | See R2. |
| M17 | partial | The four named splits are done. The rest remain (R3). |
| L1 | partial | See R6. |
| L2, L12 | resolved | The Conventions section explains the non-scope sources. |
| L3, L4, L5, L6, L8, L9 | resolved | |
| L10 | open | See R7. |
| L11 | open | See R8. |

---

## Still open

### [medium] R1. (H2 residual) The NFR preamble still claims user confirmation for unconfirmed values

**Location:** non-functional-requirements.md, preamble, run conditions, and NFR-019
**Problem:** The preamble says "The user confirmed every value." Two values have no confirmation:
- "Lighthouse 12 or later". Decision 2 approved only "median of 3 runs".
- NFR-019 now requires "The user runs one manual form submission on a physical iOS device and one on an Android device". This assigns work to the user, and no transcript records their agreement.

**Consequence:** The G2 approver reads a false provenance statement.
**Fix (mechanical):** Mark these two values as proposed, or remove the blanket claim.
**Ask the user:** Will you run one manual contact-form submission on a physical iOS device and one on an Android device as part of acceptance?

### [medium] R2. (M15 residual) The NFR-019 measurement does not cover its requirement

**Location:** non-functional-requirements.md NFR-019
**Problem:** The requirement names the latest two major versions of Chrome, Edge, Firefox, and Safari. The method runs one build of each Playwright engine. That covers neither "latest two" nor Edge as a product.
**Fix (mechanical):** Make the two agree. Either the method names the browser channels and versions it runs, or the requirement narrows to what the method tests.

### [medium] R3. (M17 residual) Compound requirements remain

**Location:** FR-013, FR-014, FR-024, FR-037, FR-038, FR-045, FR-051; NFR-011, NFR-015, NFR-022
**Problem:** Each one bundles several independent obligations. Examples:
- FR-024: the pre-fill value, no prerendering, and a Cache-Control header.
- FR-051: links navigate without JavaScript, and every page is reachable from the footer.
- NFR-022: keyboard operability and a visible focus indicator.

**Consequence:** The traceability matrix cannot record a partial pass. This does not block the gate.

### [low] R4. (M7 residual) FR-024 names libphonenumber metadata without a version

The calling-code mapping changes between releases. Pin the version, or name the package
and state that the version in `bun.lock` governs.

### [low] R5. (M12 residual) Charter A-1 contradicts the map decision

Charter A-1 says only strictly necessary Cloudflare cookies are used. Decision 10 accepts
Google cookies after the visitor activates "Load map". No requirement records that
decision. Route the charter change through `/lonewolf:amend`, or add the rationale to
FR-017.

### [low] R6. (L1 residual) RFC 2119 wording

- FR-017 still reads "No Google request MUST occur". It should read "The page MUST NOT send any request to Google".
- The NFR-003 edge case says "Lighthouse MUST NOT count it". That places an obligation on a tool, not on the system.

### [low] R7. (L10) FR-031 does not require RFC 2047 encoding

The subject contains an em dash and possibly non-ASCII company names. Nothing requires
encoding them.

### [low] R8. (L11) The `.lonewolf/state.json` counters are still 0

The orchestrator should record FR 52, NFR 28, and US 13.

---

## New findings

### [high] N1. FR-049 rate-limit message is invented user-facing copy

**Location:** functional-requirements.md FR-049; user-stories.md AC-006.7
**Problem:** "Too many messages. Please try again in a few minutes." appears in no
transcript and in no audit decision. It is the same class of defect as round-1 H3. MVP
scope says agents MUST NOT make content decisions. "A few minutes" also understates the
10-minute window in FR-042.
**Consequence:** Copy the user never chose ships on the only interactive feature.
**Ask the user:** What text should the Contact page show when a visitor exceeds the limit of five messages in 10 minutes?

### [medium] N2. FR-048 names the wrong Turnstile mode and omits a dependency on user-owned configuration

**Location:** functional-requirements.md FR-048
**Problem:**
- The title says "non-interactive mode". In Turnstile, "Non-interactive" is a named widget type that never shows an interactive challenge. The FR's own edge case requires showing one when Turnstile demands it, and scope says the same. That behavior is the "Managed" widget type with `appearance: interaction-only`.
- The widget type is set on the site key in the Cloudflare dashboard, which the user owns (S-7). The code sets only `appearance`.

**Consequence:** A developer who follows the title picks the wrong mode. The requirement then passes or fails depending on dashboard settings outside the codebase.
**Fix (mechanical):** Name "Managed" and `appearance: interaction-only`. Record that the user creates the site key in Managed mode, as FR-050 records the origin restriction.

### [medium] N3. FR-051 assumes the footer contents, and its edge case is false for Solutions and Industries

**Location:** functional-requirements.md FR-051; user-stories.md AC-008.8
**Problem:**
- FR-051 requires every built Services and Products page to be reachable from a footer link. No Paper read confirms the footer links to all 4 Services and 7 Products pages. If it does not, the developer must add links, which is a design decision.
- The edge case says "The footer provides the same destinations" as the dropdowns. The Paper read found only Services, Products, and Company footer columns. Without JavaScript, the Solutions and Industries pages (FR-046, FR-047) are reachable from no link.
- AC-008.8 does not test the reachability obligation.

**Ask the user:** Does the footer in the Paper design link to all four Services pages and all seven Products pages? Without JavaScript, visitors will have no link to the Solutions and Industries pages. Is that acceptable?

### [medium] N4. NFR-026 allows two frame-src outcomes, one of which permits any frame

**Location:** non-functional-requirements.md NFR-026
**Problem:** The measurement for pages other than Contact accepts "`https://challenges.cloudflare.com`, or none". If "none" means the directive is absent, framing falls back to `child-src` and then `default-src`. With neither set, any origin may be framed. The requirement statement also covers only `/contact`, but the measurement adds an obligation for the other pages.
**Fix (mechanical):** State the exact `frame-src` value for pages other than Contact, for example `'none'`, in the requirement itself.

### [medium] N5. Error-response precedence is undefined

**Location:** FR-027, FR-028, FR-042; NFR-018
**Problem:** A single request can fail several checks at once: method, size, content type, rate limit, fields, and token. No requirement sets the order in which they are checked. NFR-018 allows one outcome per request.
**Consequence:** A test for "rate-limited and invalid" or "invalid fields and missing token" cannot predict the status code or the logged outcome. Whether Siteverify runs on invalid submissions is also left open.
**Fix (mechanical):** Add the evaluation order, for example 405 > 413 > 415 > 429 > 400 > 403. State that Siteverify runs only after field validation passes.

### [low] N6. Document order does not match identifier order

- FR-052 sits after FR-012, FR-051 after FR-015, FR-048 after FR-028, and FR-049 and FR-050 after FR-042.
- NFR-025, NFR-026, and NFR-027 are interleaved the same way.
- AC-009.5 precedes AC-009.3.

The identifiers themselves are unique, zero-padded, and have no gaps.

### [low] N7. FR-045 og:url has no value for the 404 page

"Origin followed by the route" is undefined when no route exists. State the value: the
requested path, or omit `og:url` on the 404 page.

### [low] N8. Static-server behaviors need verification against FR-009 and FR-052

`@astrojs/node` serves `dist/client/` files. Two things need checking:
- Under the default directory build format, `/about/index.html` may return 200, which violates FR-009.
- The 301 redirect in FR-052 on prerendered routes was not verified at intake.

The Phase 3 architect should confirm both on a scratch build.

### [low] N9. FR-023 "country calling code only" names no list

State that the list is the libphonenumber metadata that FR-024 uses.

---

## Questions requiring a user decision

1. What text should the Contact page show when a visitor exceeds the limit of five messages in 10 minutes?
2. Does the footer in the Paper design link to all four Services pages and all seven Products pages? Without JavaScript, visitors will have no link to the Solutions and Industries pages. Is that acceptable?
3. Will you run one manual contact-form submission on a physical iOS device and one on an Android device as part of acceptance?
