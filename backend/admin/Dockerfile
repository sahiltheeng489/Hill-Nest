# ── Stage 1: Dependencies ─────────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app
RUN apk add --no-cache libc6-compat openssl

COPY package.json package-lock.json* ./
COPY prisma ./prisma/
RUN npm ci --ignore-scripts

# Generate Prisma client
RUN npx prisma generate

# ── Stage 2: Development ──────────────────────────────────────
FROM node:20-alpine AS development
WORKDIR /app
RUN apk add --no-cache libc6-compat openssl

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Create logs directory
RUN mkdir -p logs

EXPOSE 5001

CMD ["npm", "run", "dev"]

# ── Stage 3: Builder ──────────────────────────────────────────
FROM deps AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# ── Stage 4: Production ───────────────────────────────────────
FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production

RUN apk add --no-cache libc6-compat openssl dumb-init
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 admin && \
    mkdir -p logs && chown admin:nodejs logs

COPY --from=builder --chown=admin:nodejs /app/dist ./dist
COPY --from=builder --chown=admin:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=admin:nodejs /app/prisma ./prisma
COPY --from=builder --chown=admin:nodejs /app/package.json ./

USER admin
EXPOSE 5001

# Use dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/index.js"]

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5001/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"
