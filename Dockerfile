# syntax=docker/dockerfile:1

FROM node:24-alpine AS base
WORKDIR /app

# ---------------------------------------------------------------- deps ---
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# --------------------------------------------------------------- build ---
FROM deps AS build
COPY . .
RUN npm run build

# ------------------------------------------------------------- runtime ---
FROM base AS runtime
ENV NODE_ENV=production
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=build /app/build ./build
COPY --from=build /app/drizzle ./drizzle
COPY --from=build /app/scripts ./scripts
COPY --from=build /app/server.js ./server.js

# läuft als unprivilegierter Nutzer; das Uploads-Volume gehört ihm
RUN addgroup -S digifriends && adduser -S digifriends -G digifriends \
	&& mkdir -p /data/uploads && chown -R digifriends:digifriends /data/uploads
USER digifriends

EXPOSE 3000
ENV PORT=3000 HOST=0.0.0.0

CMD ["sh", "-c", "node scripts/migrate.js && node server.js"]
