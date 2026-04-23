"""
TiketKonser Backend — Data layer
In-memory data store (no external DB needed for this project)
"""
import threading
import time
from typing import Any

Concert = dict[str, Any]
Reservation = dict[str, Any]

# ──────────────────────────────────────────
# CONCERT DATA
# ──────────────────────────────────────────
CONCERTS: list[Concert] = [
    {
        "id": 1,
        "artist": "Coldplay",
        "tour": "Music of the Spheres World Tour",
        "date": "2026-06-14",
        "time": "19:00",
        "venue": "Gelora Bung Karno, Jakarta",
        "category": "International",
        "tags": ["Rock", "Pop", "Alternative"],
        "tiers": [
            {"name": "Festival",  "price": 1500000,  "total": 10000, "sold": 7823},
            {"name": "Tribune A", "price": 2500000,  "total": 5000,  "sold": 3100},
            {"name": "VIP",       "price": 5000000,  "total": 1000,  "sold": 1000},
        ],
        "is_hot": True,
        "status": "on_sale",
    },
    {
        "id": 2,
        "artist": "Billie Eilish",
        "tour": "HIT ME HARD AND SOFT: THE TOUR",
        "date": "2026-07-24",
        "time": "20:00",
        "venue": "Istora Senayan, Jakarta",
        "category": "International",
        "tags": ["Pop", "Alternative", "Indie"],
        "tiers": [
            {"name": "Festival",  "price": 1200000,  "total": 8000,  "sold": 4500},
            {"name": "Tribune A", "price": 2000000,  "total": 4000,  "sold": 2100},
            {"name": "SVIP",      "price": 7500000,  "total": 500,   "sold": 120},
        ],
        "is_hot": True,
        "status": "on_sale",
    },
    {
        "id": 3,
        "artist": "Bruno Mars",
        "tour": "24K Magic World Tour — Return",
        "date": "2026-08-08",
        "time": "19:30",
        "venue": "Gelora Bung Karno, Jakarta",
        "category": "International",
        "tags": ["Pop", "R&B", "Funk"],
        "tiers": [
            {"name": "Festival",  "price": 2000000,  "total": 10000, "sold": 10000},
            {"name": "Tribune B", "price": 3200000,  "total": 5000,  "sold": 3800},
            {"name": "Diamond",   "price": 10000000, "total": 300,   "sold": 45},
        ],
        "is_hot": False,
        "status": "on_sale",
    },
    {
        "id": 4,
        "artist": "Raisa",
        "tour": "Raisa Live in Concert 2026",
        "date": "2026-09-19",
        "time": "18:00",
        "venue": "Tennis Indoor Senayan, Jakarta",
        "category": "Nasional",
        "tags": ["Pop", "R&B"],
        "tiers": [
            {"name": "Regular",  "price": 450000,  "total": 5000, "sold": 1200},
            {"name": "Prestige", "price": 850000,  "total": 2000, "sold": 400},
            {"name": "VVIP",     "price": 2500000, "total": 200,  "sold": 30},
        ],
        "is_hot": False,
        "status": "on_sale",
    },
    {
        "id": 5,
        "artist": "Dewa 19",
        "tour": "35 Tahun Merajai — The Grand Reunion",
        "date": "2026-10-10",
        "time": "17:00",
        "venue": "Gelora Bung Karno, Jakarta",
        "category": "Nasional",
        "tags": ["Rock", "Pop Rock"],
        "tiers": [
            {"name": "Festival", "price": 350000,  "total": 15000, "sold": 5000},
            {"name": "Tribune",  "price": 650000,  "total": 6000,  "sold": 2000},
            {"name": "VVIP",     "price": 1500000, "total": 500,   "sold": 500},
        ],
        "is_hot": False,
        "status": "on_sale",
    },
    {
        "id": 6,
        "artist": "NewJeans",
        "tour": "How Sweet World Tour",
        "date": "2026-11-20",
        "time": "18:30",
        "venue": "Indonesia Arena, Jakarta",
        "category": "International",
        "tags": ["K-Pop", "Pop"],
        "tiers": [
            {"name": "Standing", "price": 1800000, "total": 6000,  "sold": 2300},
            {"name": "Seated A", "price": 2800000, "total": 4000,  "sold": 1500},
            {"name": "Pit VVIP", "price": 6000000, "total": 400,   "sold": 80},
        ],
        "is_hot": True,
        "status": "on_sale",
    },
]

# ──────────────────────────────────────────
# THREAD-SAFE TICKET RESERVATION STORE
# ──────────────────────────────────────────
_lock = threading.Lock()
_reservations: list[Reservation] = []
_reservation_counter = 0


def get_all_concerts() -> list[Concert]:
    """Return all concerts with availability calculated."""
    result = []
    for c in CONCERTS:
        concert = dict(c)
        tiers_with_avail = []
        for tier in c["tiers"]:
            t = dict(tier)
            t["available"] = tier["total"] - tier["sold"]
            t["is_sold_out"] = t["available"] <= 0
            tiers_with_avail.append(t)
        concert["tiers"] = tiers_with_avail
        result.append(concert)
    return result


def get_concert_by_id(concert_id: int) -> Concert | None:
    concerts = get_all_concerts()
    return next((c for c in concerts if c["id"] == concert_id), None)


def reserve_ticket(concert_id: int, tier_name: str, buyer_name: str, buyer_email: str) -> dict[str, Any]:
    """Thread-safe ticket reservation."""
    global _reservation_counter

    # Find concert & tier
    concert = next((c for c in CONCERTS if c["id"] == concert_id), None)
    if not concert:
        return {"success": False, "error": "Concert not found"}

    tier = next((t for t in concert["tiers"] if t["name"].lower() == tier_name.lower()), None)
    if not tier:
        return {"success": False, "error": "Ticket tier not found"}

    with _lock:
        available = tier["total"] - tier["sold"]
        if available <= 0:
            return {"success": False, "error": "Ticket sold out"}

        # Reserve the ticket
        tier["sold"] += 1
        _reservation_counter += 1
        reservation_id = f"TK-{int(time.time())}-{_reservation_counter:05d}"

        reservation = {
            "id": reservation_id,
            "concert_id": concert_id,
            "artist": concert["artist"],
            "venue": concert["venue"],
            "date": concert["date"],
            "tier": tier_name,
            "price": tier["price"],
            "buyer_name": buyer_name,
            "buyer_email": buyer_email,
            "reserved_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        }
        _reservations.append(reservation)

    return {"success": True, "reservation": reservation}


def get_stats() -> dict[str, Any]:
    """Return aggregate stats for monitoring."""
    total_sold = sum(
        tier["sold"]
        for concert in CONCERTS
        for tier in concert["tiers"]
    )
    total_available = sum(
        tier["total"] - tier["sold"]
        for concert in CONCERTS
        for tier in concert["tiers"]
    )
    return {
        "total_concerts": len(CONCERTS),
        "total_tickets_sold": total_sold,
        "total_tickets_available": total_available,
        "total_reservations_this_session": len(_reservations),
    }
