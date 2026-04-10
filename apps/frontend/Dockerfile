# --- Stage 1: Build app ---
FROM node:20 AS build

WORKDIR /app

# Next.js reads NEXT_PUBLIC_* at build time.
ARG NEXT_PUBLIC_API_URL=http://localhost:3001
ARG NEXT_PUBLIC_APP_URL=http://localhost:3000
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}

# Copy dependency files (npm only)
COPY package.json package-lock.json ./

# Install dependencies (reproducible via package-lock.json)
RUN npm ci --legacy-peer-deps

# Copy toàn bộ project
COPY . .

# Build production
RUN npm run build


# --- Stage 2: Production runtime ---
FROM node:20 AS production

WORKDIR /app

# Chỉ copy output đã build (giảm dung lượng)
COPY --from=build /app ./

ENV NODE_ENV=production
EXPOSE 3000

CMD ["npm", "run", "start"]
