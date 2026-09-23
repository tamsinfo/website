# deploy/Dockerfile
#
# Implements: ADR-001 (static output, on-demand /contact, /api/contact, /health),
# ADR-002 (run `node server.ts`, image MUST contain server.ts,
#   src/lib/http-hardening.ts, dist/, package.json, production node_modules),
# ADR-004 (Nodemailer runtime dependency), ADR-009 (sessions disabled, no writable
#   session directory required), ADR-015 (all configuration from process.env, none
#   baked at build), system-architecture.md section 5.6 (deployment shape: one image,
#   node:24 base with full ICU, user node uid 1000, CMD ["node", "server.ts"], tag =
#   git SHA), NFR-014 (non-root container), NFR-015 (no secret baked into the image),
#   NFR-024 (image tagged by git SHA, applied at build time by CI, not in this file).
#
# Package manager: Bun 1.3.14 only (stack-profile.md section 1). Runtime: Node 24
# (stack-profile.md frontmatter). Node's official images ship full ICU by default,
# which satisfies the ADR-004 Asia/Kolkata timestamp formatting requirement.
#
# NOTE: This file references package.json, bun.lock, astro.config.ts, server.ts, and
# src/, which Phase 4 has not yet created. The build stages below cannot run until
# those files exist. Structure and pins are correct as prepared; see deploy/README.md
# for what to validate once Phase 4 lands.

# ---- Stage 1: production dependencies only (no devDependencies, no build tools) ----
FROM oven/bun:1.3.14@sha256:e10577f0db68676a7024391c6e5cb4b879ebd17188ab750cf10024a6d700e5c4 AS deps-prod
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production

# ---- Stage 2: full install and production build (devDependencies included) ----
FROM oven/bun:1.3.14@sha256:e10577f0db68676a7024391c6e5cb4b879ebd17188ab750cf10024a6d700e5c4 AS build
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .
RUN bunx astro sync && bunx astro build

# ---- Stage 3: runtime. No Bun. Non-root. Only the files ADR-002 names. ----
FROM node:24-slim@sha256:0e0ff40c39bc087845bfb27465a0df4ea419520094bc35842ff83dd8cbe6f9b6 AS runtime
WORKDIR /app
ENV NODE_ENV=production

# ADR-015: PORT and HOST have defaults in server.ts (4321, 0.0.0.0). Every other
# variable in the table (SMTP_*, MAIL_FROM, SALES_MAILBOX, TURNSTILE_*) MUST be
# supplied at `docker run` / compose / the platform's secret store. None is set here.
COPY --from=deps-prod /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/dist ./dist
COPY --from=build /app/server.ts ./server.ts
COPY --from=build /app/src/lib/http-hardening.ts ./src/lib/http-hardening.ts

# node:24-slim already ships a non-root "node" user at uid 1000 (NFR-014). The
# numeric form is used on USER so the id resolves even if /etc/passwd is ever
# stripped from a future base image variant.
RUN chown -R node:node /app
USER 1000:1000

EXPOSE 4321

# NFR-010: GET /health MUST answer 200 within 1 second, independent of SMTP or
# configuration state. Uses Node's built-in fetch, so no extra package (curl/wget)
# is installed into the slim runtime image.
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD ["node", "-e", "fetch('http://127.0.0.1:' + (process.env.PORT || 4321) + '/health').then((r) => process.exit(r.status === 200 ? 0 : 1)).catch(() => process.exit(1))"]

# ADR-009: sessions are disabled (astro.config.ts session: false). The container
# depends on no writable session directory, so the root filesystem MAY be read-only
# (see deploy/docker-compose.yml read_only).
CMD ["node", "server.ts"]
