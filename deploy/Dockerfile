# Builds the Vite/React app and serves it with nginx on port 4321.
# Build context is the repository root:  docker build -f deploy/Dockerfile .

# ---- build ----
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
# Playwright is a dev-only test tool; skip its browser download in the image
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
RUN npm ci
COPY . .
# Optional: pass the contact-form endpoint at build time (Vite inlines VITE_* vars)
ARG VITE_CONTACT_ENDPOINT
ENV VITE_CONTACT_ENDPOINT=$VITE_CONTACT_ENDPOINT
RUN npm run build

# ---- serve ----
FROM nginx:1.27-alpine
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 4321
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://127.0.0.1:4321/ >/dev/null || exit 1
CMD ["nginx", "-g", "daemon off;"]
