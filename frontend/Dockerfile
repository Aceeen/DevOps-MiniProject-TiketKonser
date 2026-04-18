# ─── Stage 1: Builder ─────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

# Copy dependency manifest terlebih dahulu (layer caching)
COPY package*.json ./
RUN npm ci

# Copy source dan build
COPY . .
RUN npm run build

# ─── Stage 2: Production ──────────────────────────────────
FROM nginx:1.30-alpine-slim AS production

# Update package OS jika ada patch terbaru, lalu buat user non-root
RUN apk update && apk upgrade --no-cache && \
    addgroup -g 1001 appgroup && \
    adduser -u 1001 -G appgroup -s /bin/sh -D appuser && \
    # Pindahkan nginx PID ke /tmp (writable oleh semua user)
    # /var/run di Alpine adalah symlink ke /run yang milik root
    sed -i 's|pid\s*/var/run/nginx.pid;|pid /tmp/nginx.pid;|' /etc/nginx/nginx.conf && \
    # Hapus directive 'user' karena kita tidak jalan sebagai root
    sed -i '/^user /d' /etc/nginx/nginx.conf && \
    # Siapkan direktori yang perlu ditulis nginx
    mkdir -p /var/cache/nginx /var/log/nginx && \
    chown -R appuser:appgroup /var/cache/nginx /var/log/nginx /etc/nginx/conf.d /usr/share/nginx/html

# Copy hasil build dari stage builder
COPY --from=builder --chown=appuser:appgroup /app/dist /usr/share/nginx/html

# Copy konfigurasi Nginx custom
COPY --chown=appuser:appgroup nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

USER appuser
CMD ["nginx", "-g", "daemon off;"]
