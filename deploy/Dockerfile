# TAMS Infotech website: build the static site with Bun, serve it with nginx on port 4321.
# Build from the repository root:  docker build -f deploy/Dockerfile -t tams-website .

# ---- build ----
FROM oven/bun:1.3 AS build
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .
# optional: endpoint for the contact form (see README); baked in at build time
ARG VITE_CONTACT_ENDPOINT=""
ENV VITE_CONTACT_ENDPOINT=$VITE_CONTACT_ENDPOINT
RUN bun run build

# ---- serve ----
FROM nginx:1.27-alpine
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 4321
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://127.0.0.1:4321/healthz || exit 1
CMD ["nginx", "-g", "daemon off;"]
