# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

RUN apk add --no-cache ca-certificates

# Copy package files (npm only)
COPY package.json package-lock.json ./

# Install dependencies (reproducible via package-lock.json)
RUN npm ci --legacy-peer-deps

COPY . .

# Build NestJS
RUN npm run build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Copy package files and install production deps only
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --legacy-peer-deps

# Copy built output from builder
COPY --from=builder /app/dist ./dist

EXPOSE 3001

CMD ["node", "dist/main.js"]
