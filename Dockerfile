# syntax=docker/dockerfile:1
FROM node:22-bookworm-slim AS dependencies
WORKDIR /app

# Wrangler is a devDependency but is also the server for the compiled Worker.
COPY package.json package-lock.json .npmrc ./
RUN npm ci --include=dev --include=optional

FROM dependencies AS build
COPY . .
RUN npm run build

FROM node:22-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production \
    SITES_RUNTIME_ROOT=/app/.sites-runtime \
    WRANGLER_SEND_METRICS=false \
    CLOUDFLARE_CF_FETCH_ENABLED=false \
    CI=true

COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/dist ./dist
COPY package.json ./
COPY scripts/sites-env.mjs scripts/tool-environment.mjs ./scripts/
RUN mkdir -p /app/.sites-runtime /app/.wrangler/state \
    && chown -R node:node /app/.sites-runtime /app/.wrangler

USER node
EXPOSE 8787
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
    CMD ["node", "-e", "fetch('http://127.0.0.1:8787/').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"]
CMD ["node", "--import", "./scripts/sites-env.mjs", "./node_modules/wrangler/bin/wrangler.js", "dev", "--config", "dist/server/wrangler.json", "--local", "--persist-to", ".wrangler/state", "--ip", "0.0.0.0", "--port", "8787", "--inspector-port", "0"]
