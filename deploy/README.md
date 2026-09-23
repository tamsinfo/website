---
artifact: README
phase: 3
status: approved
version: 1
updated: 2026-09-22
owner: cicd-architect
depends_on:
  - docs/03-design/system-architecture.md
  - docs/03-design/data-model.md
  - docs/02-requirements/non-functional-requirements.md
  - docs/00-intake/tech-stack.md
  - .lonewolf/stack-profile.md
---

# Deployment assets — TAMS Infotech Website V1

Implements: docs/03-design/system-architecture.md (ADR-001, ADR-002, ADR-004,
ADR-009, ADR-015, section 5.6 "Deployment shape"), NFR-008 to NFR-010, NFR-014,
NFR-015, NFR-024. Written for someone who has not read any other document in this
repository.

## What this system is

One Node 24 container. It serves prerendered HTML for most routes and three
on-demand routes: `/contact`, `/api/contact`, and `/health`. It has no database
and stores nothing between requests. It sends contact-form enquiries by SMTP. It
sits behind Cloudflare, which the user owns and configures; the origin MUST be
reachable only from Cloudflare's network.

## What each asset does

| File | Purpose |
|---|---|
| `deploy/Dockerfile` | Multi-stage build. Stage 1 installs production-only dependencies with Bun. Stage 2 installs everything and runs the Astro build with Bun. Stage 3 is the runtime: a plain `node:24-slim` image with no Bun, running as the non-root `node` user, starting `node server.ts` (ADR-002 — NOT `node dist/server/entry.mjs`). |
| `deploy/docker-compose.yml` | Brings up the one service locally or in a prod-like environment. Reads secrets from `../.env`. Root filesystem is read-only (ADR-009: sessions are disabled, so nothing needs to write to disk). |
| `.env.example` (repo root) | Every environment variable the server reads, with placeholder values. Copy to `.env` and fill in real values; `.env` is git-ignored. |
| `.github/workflows/ci.yml` | Runs on every pull request and every push to `main`: installs dependencies, runs the full stack-profile lint/type-check/test/build gate, runs the dependency audit, and runs the Tailwind-arbitrary-value and inline-style greps. It builds nothing deployable. |
| `.github/workflows/build.yml` | Builds the container image and tags it with the git commit SHA (NFR-024). It does **not** push to any registry and does **not** deploy. A disabled, commented publish step shows where a push step would go once the user picks a registry. |

**Kubernetes manifests and a Helm chart are intentionally not included.**
`docs/03-design/system-architecture.md` names "one Node 24 container" behind
Cloudflare with no Kubernetes target, and `docs/00-intake/tech-stack.md` records
the deployment platform as "Container image... Platform not yet chosen." Building
a chart and manifest set for an unnamed target would be topology the NFRs do not
ask for (NFR-006 names 200 concurrent visitors, served by one container). If the
user's chosen platform turns out to be Kubernetes, request this asset again once
that decision is made, so it can be sized to a real platform instead of guessed.

## Prerequisites

* Docker Engine or a compatible builder, for building `deploy/Dockerfile`. Verified
  locally with Docker 24.0.2; any recent Docker Engine works.
* Docker Compose v2 (`docker compose`, not the standalone `docker-compose`), for
  `deploy/docker-compose.yml`.
* A container host reachable only from Cloudflare's IP ranges. This document does
  not choose one; see "Deployment target" below.
* An SMTP relay account (host, port, username, password) authorized to send as the
  `MAIL_FROM` address.
* A Cloudflare Turnstile Managed widget (site key and secret key). Create it in the
  Cloudflare dashboard under Turnstile.
* Cloudflare settings the user owns and MUST set before going live (ADR-002,
  AMD-003): Rocket Loader OFF, Email Address Obfuscation OFF, Web Analytics
  automatic injection ON.
* Phase 4 has not yet run in this repository, so `package.json`, `bun.lock`,
  `astro.config.ts`, `server.ts`, and `src/` do not exist yet. The Dockerfile and
  workflows are written against the file names ADR-002 requires; they cannot
  build until Phase 4 produces those files. See "What was validated" below.

## Environment variables

Every variable is documented with a placeholder in `.env.example`. Summary:

| Variable | Required | Purpose |
|---|---|---|
| `SMTP_HOST` | yes | SMTP relay host name |
| `SMTP_PORT` | yes | SMTP relay port (465 = implicit TLS; anything else uses STARTTLS) |
| `SMTP_USER` | yes | SMTP authentication username |
| `SMTP_PASSWORD` | yes | SMTP authentication password |
| `MAIL_FROM` | yes | `From` address on every enquiry email |
| `SALES_MAILBOX` | yes | Sole recipient of every enquiry email |
| `TURNSTILE_SITE_KEY` | yes | Public Turnstile site key, rendered on `/contact` |
| `TURNSTILE_SECRET_KEY` | yes | Turnstile Siteverify secret key |
| `PORT` | no (default `4321`) | Port the server binds |
| `HOST` | no (default `0.0.0.0`) | Address the server binds |

If any of the first eight is missing at request time, `/api/contact` returns
`502 SEND_FAILED`; `/health` still returns `200` (NFR-010). No variable is ever
baked into the image or the static build (NFR-015).

## Deploying — exact commands

These commands prepare and validate the deployment. **Running them locally does
not put the site on the internet**; that requires a container host, which is the
user's decision (see "Deployment target"). This document does not run any of them
on the user's behalf.

1. Once Phase 4 has produced `package.json` and `bun.lock`, from the repository
   root:
   ```bash
   cp .env.example .env
   # edit .env with real SMTP and Turnstile values
   ```

2. Build and run locally to verify the image works:
   ```bash
   docker compose -f deploy/docker-compose.yml up --build
   curl -s -o /dev/null -w '%{http_code}\n' http://127.0.0.1:4321/health
   # expect: 200
   ```

3. Build the image standalone, tagged by the current git commit, exactly as
   `build.yml` does in CI:
   ```bash
   docker build -f deploy/Dockerfile -t tams-infotech-website:$(git rev-parse HEAD) .
   ```

4. Push `tams-infotech-website:<sha>` to the registry the chosen host reads from,
   and run it there with the environment variables above supplied through the
   host's secret store (not through `.env` in that environment). This step is the
   user's to run; no agent in this workspace pushes an image or deploys.

5. Point Cloudflare's DNS at the host and confirm the origin is locked to
   Cloudflare's IP ranges only (FR-050 depends on `CF-Connecting-IP` being
   trustworthy, which requires this).

## How to verify the deployment succeeded

* `curl -s -o /dev/null -w '%{http_code}\n' https://tamsinfotech.com/health`
  returns `200` within 1 second (NFR-010).
* `docker run --rm tams-infotech-website:<sha> id -u` prints a non-zero uid
  (NFR-014).
* A real contact-form submission arrives in the sales mailbox within 60 seconds
  (NFR-028).
* Response headers on `/about` (or any prerendered page) include
  `Content-Security-Policy` and `Referrer-Policy: strict-origin-when-cross-origin`
  (NFR-011, NFR-012, NFR-013).
* Grep the running container's logs: no submitted field value or client IP
  appears (NFR-017).

## Rollback

Every image is tagged immutably by git commit SHA (NFR-024). The system stores no
data, so rollback never needs a data restore (NFR-009's own edge case).

To roll back:

1. Identify the last known-good SHA tag (the previous successful deploy).
2. Redeploy that exact tag to the host, replacing the current container.
3. Confirm `GET /health` returns `200`.

This MUST complete within 30 minutes of detecting a failure (NFR-009). Because the
container is stateless, redeploying an older tag is the entire rollback procedure;
no database migration reversal or cache invalidation is needed.

## Deployment target

`docs/00-intake/tech-stack.md` records the deployment platform as "Container
image... Platform not yet chosen." This is why `deploy/k8s/` and `deploy/helm/` do
not exist: writing them would mean guessing a platform this project has not named.
The assets above (`Dockerfile`, `docker-compose.yml`, and the two workflows) are
the portable minimum that works unchanged once a platform is chosen — a plain VM
running Docker, a single-container PaaS, or a Kubernetes cluster can all consume
the same image built from `deploy/Dockerfile`.
