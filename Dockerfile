# Base stage with Node.js 25 and npm
FROM node:25-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set build-time environment variables with placeholders
# Actual secrets will be injected at runtime by Fly.io
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_bGVnYWwtd2FzcC0xNi5jbGVyay5hY2NvdW50cy5kZXYk
ENV CLERK_SECRET_KEY=placeholder

# Build Next.js application
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy package files for runtime scripts (e.g., npm run migrate)
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json ./package-lock.json

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/scripts ./scripts
COPY --from=builder --chown=nextjs:nodejs /app/src ./src

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Runtime environment variables will be injected by Fly.io
CMD ["node", "server.js"]
