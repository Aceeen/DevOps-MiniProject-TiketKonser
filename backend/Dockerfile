# ─── Stage 1: Builder ─────────────────────────────────────
FROM python:3.12-slim AS builder
WORKDIR /app

# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# ─── Stage 2: Production ──────────────────────────────────
FROM python:3.12-slim AS production
WORKDIR /app

# Buat user non-root + patch CVE OS (tanpa curl agar OS lebih bersih dari CVE)
RUN apt-get update && apt-get upgrade -y \
    && rm -rf /var/lib/apt/lists/* \
    && groupadd -g 1001 appgroup \
    && useradd -u 1001 -g appgroup -s /bin/sh -d /app appuser

# Copy packages Python dari builder
COPY --from=builder /usr/local/lib/python3.12/site-packages /usr/local/lib/python3.12/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

# Copy seluruh source code beserta sub-module
COPY --chown=appuser:appgroup ./src ./src

# Variabel environment (nilai di-inject saat runtime)
ENV APP_ENV=production \
    PORT=8080 \
    WORKERS=2

EXPOSE 8080

# Gunakan python bawaan untuk health check daripada curl agar nghttp2/curl vulnerabilities hilang
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8080/health')" || exit 1

USER appuser
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8080", "--workers", "2"]
