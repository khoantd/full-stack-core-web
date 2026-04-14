# --- Stage 1: Build app ---
FROM node:20-alpine AS build

WORKDIR /app

# Needed by some deps (and good default TLS bundle)
RUN apk add --no-cache libc6-compat ca-certificates

# Next.js reads NEXT_PUBLIC_* at build time.
ARG NEXT_PUBLIC_API_URL=http://localhost:3001
ARG NEXT_PUBLIC_APP_URL=http://localhost:3000
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}

# Copy dependency files (npm only)
COPY package.json package-lock.json ./

# Install dependencies (reproducible via package-lock.json)
RUN --mount=type=cache,target=/root/.npm \
    npm ci --legacy-peer-deps

# Copy toàn bộ project
COPY . .

# Build production
RUN npm run build


# --- Stage 2: Production runtime ---
FROM node:20-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

# Run as non-root
RUN addgroup -S nodejs && adduser -S nextjs -G nodejs

# Copy only the standalone output (small + fast)
COPY --from=build /app/public ./public
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/.next/standalone ./

# Patch the start script so `npm start` also works (standalone doesn't ship the `next` binary)
RUN node -e "\
  const fs = require('fs'); \
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8')); \
  pkg.scripts = pkg.scripts || {}; \
  pkg.scripts.start = 'node server.js'; \
  fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2)); \
"

EXPOSE 3000

USER nextjs

CMD ["node", "server.js"]
