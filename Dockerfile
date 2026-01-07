# ============================================
# Multi-Stage Dockerfile for Next.js + Turborepo
# Optimized for CertificablePlus Web App
# ============================================

# Base stage - Alpine for minimal size
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

# ============================================
# Stage 1: Install Turbo CLI globally
# ============================================
FROM base AS turbo
RUN npm install -g turbo@2.3.4

# ============================================
# Stage 2: Prune workspace to create minimal dependency tree
# This creates a pruned version with only web app dependencies
# ============================================
FROM turbo AS pruner
WORKDIR /app
COPY . .
RUN turbo prune web --docker

# ============================================
# Stage 3: Install dependencies (cached unless package.json changes)
# ============================================
FROM base AS installer
WORKDIR /app

# Copy package files from pruned output
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/package-lock.json* ./package-lock.json

# Install dependencies with clean install
RUN npm ci --omit=dev --ignore-scripts

# ============================================
# Stage 4: Build the application
# ============================================
FROM turbo AS builder
WORKDIR /app

# Copy installed dependencies
COPY --from=installer /app .

# Copy source files from pruned output
COPY --from=pruner /app/out/full/ .

# Copy Turborepo config for build orchestration
COPY turbo.json turbo.json

# Build the web app and all its dependencies
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build --filter=web

# ============================================
# Stage 5: Production runtime image (smallest)
# ============================================
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy public assets
COPY --from=builder /app/apps/web/public ./apps/web/public

# Copy standalone build output
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Start the Next.js server
CMD ["node", "apps/web/server.js"]
