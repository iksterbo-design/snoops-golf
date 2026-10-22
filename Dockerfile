# syntax=docker/dockerfile:1
# ---------------------------------------------------------------------------
# AI Golf Coach — multi-platform build (linux/amd64, linux/arm64, macOS, Windows)
#   docker buildx build --platform linux/amd64,linux/arm64 -t snoops-golf .
# ---------------------------------------------------------------------------
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

FROM node:20-alpine AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Build-time env: demo mode by default so the image runs with zero secrets.
ARG NEXT_PUBLIC_DEMO_MODE=true
ENV NEXT_PUBLIC_DEMO_MODE=$NEXT_PUBLIC_DEMO_MODE
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

# Optional ffmpeg/ffprobe for real duration probing + checkpoint frame extraction.
ARG INSTALL_FFMPEG=false
RUN if [ "$INSTALL_FFMPEG" = "true" ]; then apk add --no-cache ffmpeg; fi

RUN addgroup -S nodejs && adduser -S nextjs -G nodejs

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
RUN mkdir -p /app/data /app/uploads && chown -R nextjs:nodejs /app

USER nextjs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s \
  CMD wget -qO- http://127.0.0.1:3000/api/health || exit 1

CMD ["node", "server.js"]
