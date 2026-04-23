"""
TiketKonser Backend — FastAPI Application
Service B | Port 8080 | Python FastAPI + Uvicorn

Endpoints:
  GET  /health                  — Docker HEALTHCHECK & Nginx health probe
  GET  /api/health              — Detailed API health (called by frontend)
  GET  /api/hostname            — Worker node identification (load balancing verification)
  GET  /api/concerts            — List all concerts with availability
  GET  /api/concerts/{id}       — Concert detail
  POST /api/tickets/reserve     — Reserve a ticket (thread-safe)
  GET  /api/stats               — System & ticket statistics
  GET  /api/metrics             — Performance metrics for monitoring
"""

import logging
import os
import platform
import socket
import time
from contextlib import asynccontextmanager
from datetime import datetime, timezone

from fastapi import FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

from src import data as db

# ──────────────────────────────────────────
# LOGGING
# ──────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s — %(message)s",
    datefmt="%Y-%m-%dT%H:%M:%S",
)
logger = logging.getLogger("tiketkonser")

# ──────────────────────────────────────────
# APP CONFIG
# ──────────────────────────────────────────

def _env_csv(name: str, default: str) -> list[str]:
    value = os.getenv(name, default)
    return [v.strip() for v in value.split(",") if v.strip()]


APP_ENV = os.getenv("APP_ENV", "production")
APP_NAME = os.getenv("APP_NAME", "TiketKonser Backend")
VERSION = os.getenv("APP_VERSION", "1.0.0")
HOSTNAME = socket.gethostname()
START_TIME = time.time()

CORS_ALLOW_ORIGINS = _env_csv("CORS_ALLOW_ORIGINS", "*")
CORS_ALLOW_METHODS = _env_csv("CORS_ALLOW_METHODS", "GET,POST")
CORS_ALLOW_HEADERS = _env_csv("CORS_ALLOW_HEADERS", "*")

# ──────────────────────────────────────────
# LIFESPAN (startup / shutdown hooks)
# ──────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("=" * 60)
    logger.info(f"  {APP_NAME} v{VERSION}")
    logger.info(f"  Hostname  : {HOSTNAME}")
    logger.info(f"  Env       : {APP_ENV}")
    logger.info(f"  Python    : {platform.python_version()}")
    logger.info("=" * 60)
    yield
    logger.info("Shutting down TiketKonser Backend...")


# ──────────────────────────────────────────
# FAST API APP
# ──────────────────────────────────────────
app = FastAPI(
    title=APP_NAME,
    version=VERSION,
    description="High-Availability Concert Ticket Platform — Backend API",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
    lifespan=lifespan,
)

# CORS — allow frontend to call the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ALLOW_ORIGINS,
    allow_credentials=False,
    allow_methods=CORS_ALLOW_METHODS,
    allow_headers=CORS_ALLOW_HEADERS,
)

# ──────────────────────────────────────────
# REQUEST LOGGING MIDDLEWARE
# ──────────────────────────────────────────
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start = time.perf_counter()
    response = await call_next(request)
    duration_ms = round((time.perf_counter() - start) * 1000, 2)
    logger.info(
        f"{request.method} {request.url.path} "
        f"→ {response.status_code} ({duration_ms}ms) "
        f"[{request.client.host if request.client else 'unknown'}]"
    )
    # Expose worker hostname in response headers
    # Penting untuk memverifikasi load balancing distribution
    response.headers["X-Worker-Node"] = HOSTNAME
    response.headers["X-Response-Time"] = f"{duration_ms}ms"
    return response

# ──────────────────────────────────────────
# PYDANTIC MODELS
# ──────────────────────────────────────────
class ReservationRequest(BaseModel):
    concert_id: int = Field(..., gt=0, description="ID of the concert")
    tier_name: str  = Field(..., min_length=1, description="Ticket tier name (e.g. Festival, VIP)")
    buyer_name: str = Field(..., min_length=2, max_length=100, description="Full name of buyer")
    buyer_email: str = Field(..., description="Email address of buyer")

class HealthResponse(BaseModel):
    status: str
    hostname: str
    version: str
    environment: str
    uptime_seconds: float
    timestamp: str

# ──────────────────────────────────────────
# ROUTES
# ──────────────────────────────────────────

# ── 1. HEALTH CHECK ──────────────────────
@app.get(
    "/health",
    tags=["Health"],
    summary="Docker & Nginx health probe",
    response_model=HealthResponse,
)
async def health_check():
    """
    Lightweight health check used by:
    - Docker HEALTHCHECK instruction
    - Nginx upstream health probe
    Returns 200 if service is healthy.
    """
    return {
        "status": "ok",
        "hostname": HOSTNAME,
        "version": VERSION,
        "environment": APP_ENV,
        "uptime_seconds": round(time.time() - START_TIME, 2),
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@app.get(
    "/api/health",
    tags=["Health"],
    summary="Detailed API health check",
    response_model=HealthResponse,
)
async def api_health():
    """
    Detailed health endpoint called by the frontend status bar.
    Includes hostname for load balancing verification.
    """
    return {
        "status": "ok",
        "hostname": HOSTNAME,
        "version": VERSION,
        "environment": APP_ENV,
        "uptime_seconds": round(time.time() - START_TIME, 2),
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


# ── 2. HOSTNAME / NODE INFO ───────────────
@app.get(
    "/api/hostname",
    tags=["Health"],
    summary="Worker node identification",
)
async def get_hostname():
    """
    Returns the hostname of the worker node serving this request.
    Critical for verifying that the Load Balancer distributes
    traffic evenly across all worker nodes (Round Robin / Least Conn).
    Used by frontend to display which node is serving.
    """
    return {
        "hostname": HOSTNAME,
        "ip": socket.gethostbyname(HOSTNAME),
        "platform": platform.system(),
        "python_version": platform.python_version(),
        "uptime_seconds": round(time.time() - START_TIME, 2),
    }


# ── 3. CONCERTS ──────────────────────────
@app.get(
    "/api/concerts",
    tags=["Concerts"],
    summary="List all concerts with ticket availability",
)
async def list_concerts(
    category: str | None = None,
    available_only: bool = False,
):
    """
    Returns all concerts. Supports filtering by:
    - `category`: 'International' or 'Nasional'
    - `available_only`: only show concerts with available tickets
    """
    concerts = db.get_all_concerts()

    if category:
        concerts = [c for c in concerts if c["category"].lower() == category.lower()]

    if available_only:
        concerts = [
            c for c in concerts
            if any(not t["is_sold_out"] for t in c["tiers"])
        ]

    logger.info(f"GET /api/concerts → {len(concerts)} concerts returned")
    return {
        "count": len(concerts),
        "concerts": concerts,
        "served_by": HOSTNAME,
    }


@app.get(
    "/api/concerts/{concert_id}",
    tags=["Concerts"],
    summary="Get a single concert by ID",
)
async def get_concert(concert_id: int):
    """Return detail of a specific concert including all tier availability."""
    concert = db.get_concert_by_id(concert_id)
    if not concert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Concert with id={concert_id} not found",
        )
    return {"concert": concert, "served_by": HOSTNAME}


# ── 4. TICKET RESERVATION ────────────────
@app.post(
    "/api/tickets/reserve",
    tags=["Tickets"],
    summary="Reserve a concert ticket (thread-safe)",
    status_code=status.HTTP_201_CREATED,
)
async def reserve_ticket(payload: ReservationRequest):
    """
    Thread-safe ticket reservation.
    Uses an in-memory lock to prevent double-booking
    under high concurrent load (war tiket simulation).

    Returns a reservation ID that can be used for confirmation.
    """
    result = db.reserve_ticket(
        concert_id=payload.concert_id,
        tier_name=payload.tier_name,
        buyer_name=payload.buyer_name,
        buyer_email=payload.buyer_email,
    )

    if not result["success"]:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=result["error"],
        )

    logger.info(
        f"Ticket reserved: {result['reservation']['id']} | "
        f"Concert #{payload.concert_id} | Tier: {payload.tier_name}"
    )
    return {
        "message": "Reservation successful",
        "reservation": result["reservation"],
        "served_by": HOSTNAME,
    }


# ── 5. STATS ─────────────────────────────
@app.get(
    "/api/stats",
    tags=["Monitoring"],
    summary="Ticket & system statistics",
)
async def get_stats():
    """
    Returns aggregate statistics:
    - Total tickets sold / available per concert
    - Total reservations in this session
    - Worker node info

    Useful for monitoring dashboard and load test analysis.
    """
    stats = db.get_stats()
    return {
        **stats,
        "served_by": HOSTNAME,
        "uptime_seconds": round(time.time() - START_TIME, 2),
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


# ── 6. PERFORMANCE METRICS ───────────────
@app.get(
    "/api/metrics",
    tags=["Monitoring"],
    summary="Performance metrics for load test verification",
)
async def get_metrics():
    """
    Returns metrics useful for verifying load balancer distribution.
    Each worker node tracks its own request count.
    Compare counts across WK-01..WK-04 to verify even distribution.
    """
    try:
        import resource as _resource  # type: ignore
    except ModuleNotFoundError:
        _resource = None

    mem_mb = -1
    if _resource is not None:
        try:
            mem_mb = _resource.getrusage(_resource.RUSAGE_SELF).ru_maxrss / 1024
        except Exception:
            mem_mb = -1

    return {
        "node": {
            "hostname": HOSTNAME,
            "uptime_seconds": round(time.time() - START_TIME, 2),
            "memory_mb": round(mem_mb, 2),
        },
        "app": {
            "name": APP_NAME,
            "version": VERSION,
            "environment": APP_ENV,
        },
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


# ── 7. ROOT REDIRECT ─────────────────────
@app.get("/", include_in_schema=False)
async def root():
    return JSONResponse({
        "service": APP_NAME,
        "version": VERSION,
        "hostname": HOSTNAME,
        "docs": "/api/docs",
        "health": "/health",
    })


# ── 404 HANDLER ──────────────────────────
@app.exception_handler(404)
async def not_found_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=404,
        content={
            "error": "Not Found",
            "path": str(request.url.path),
            "served_by": HOSTNAME,
        },
    )


# ── 500 HANDLER ──────────────────────────
@app.exception_handler(500)
async def internal_error_handler(request: Request, exc: Exception):
    logger.exception("Internal error on %s", request.url.path)
    return JSONResponse(
        status_code=500,
        content={"error": "Internal Server Error", "served_by": HOSTNAME},
    )
