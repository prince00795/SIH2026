"""
VayuSutra APIx - Dashboard Source Telemetry & Route Movement (Read-Only)
Additive, read-only SQLite helpers that power the command-center dashboard's
"Live Data Collection" status and route-level movement analytics.

All values are computed from the same ingestion tables that feed the existing
statutory endpoints (raw_quotes, cleaned_quotes, route_indices, sources) so the
UI never needs client-side synthetic data.
"""

import datetime
import logging
from typing import Any, Dict, List, Optional

from ..config.db import get_db_connection

logger = logging.getLogger("vayusutra.source_telemetry")

# Friendly labels for ingestion channels present in raw_quotes.source_portal
PORTAL_LABELS = {
    "DIRECT_INDIGO": ("IndiGo", "AIRLINE_DIRECT"),
    "DIRECT_AIRINDIA": ("Air India", "AIRLINE_DIRECT"),
    "DIRECT_AKASAAIR": ("Akasa Air", "AIRLINE_DIRECT"),
    "DIRECT_SPICEJET": ("SpiceJet", "AIRLINE_DIRECT"),
    "OTA_MAKEMYTRIP": ("MakeMyTrip", "OTA_AGGREGATOR"),
    "OTA_EASEMYTRIP": ("EaseMyTrip", "OTA_AGGREGATOR"),
    "OTA_CLEARTRIP": ("Cleartrip", "OTA_AGGREGATOR"),
}

WINDOW_WEIGHTS = {1: 0.22, 7: 0.34, 15: 0.24, 30: 0.14, 45: 0.06}


def _latest_two_booking_dates(conn) -> List[Any]:
    """Returns [latest_booking_date, previous_booking_date] available in raw_quotes."""
    rows = conn.execute(
        "SELECT DISTINCT booking_date FROM raw_quotes ORDER BY booking_date DESC LIMIT 2"
    ).fetchall()
    return [r["booking_date"] for r in rows]


def _portal_stats(conn, portal: str, date: str) -> Dict[str, Any]:
    """Aggregate quote activity for one source portal on a given booking date."""
    row = conn.execute(
        """
        SELECT COUNT(*) AS cnt,
               AVG(total_fare) AS avg_fare,
               MAX(scraped_at) AS last_activity,
               COUNT(CASE WHEN total_fare > 0 THEN 1 END) AS priced
        FROM raw_quotes WHERE source_portal = ? AND booking_date = ?
        """,
        (portal, date),
    ).fetchone()
    return {
        "cnt": row["cnt"] or 0,
        "avg_fare": float(row["avg_fare"]) if row["avg_fare"] else None,
        "last_activity": row["last_activity"],
    }


def get_source_telemetry() -> Dict[str, Any]:
    """Per-channel collection status: quote counts, latest activity, fare movement.

    Health rules (honest telemetry):
      FAILED   -> registry inactive or error_count_24h >= 5
      DELAYED  -> active channel with zero quotes on the latest booking date
      SUCCESS  -> active channel with fresh quotes
    """
    conn = get_db_connection()
    dates = _latest_two_booking_dates(conn)
    latest_date = dates[0] if dates else None
    prev_date = dates[1] if len(dates) > 1 else None

    # Registry metadata (success rate / latency / errors / status)
    registry: Dict[str, Any] = {}
    try:
        for r in conn.execute(
            "SELECT source_id, source_name, source_type, status, success_rate_24h, "
            "avg_latency_ms, error_count_24h, is_active, last_scraped_at FROM sources"
        ).fetchall():
            registry[r["source_name"].upper()] = dict(r)
    except Exception as exc:  # noqa: BLE001
        logger.debug(f"Sources registry unavailable: {exc}")

    channels: List[Dict[str, Any]] = []
    summary = {
        "as_of_date": latest_date,
        "previous_date": prev_date,
        "channels_healthy": 0,
        "channels_total": 0,
        "quotes_today_total": 0,
        "validated_quotes_today": 0,
        "outliers_today": 0,
        "average_fare_today_inr": None,
        "average_fare_previous_inr": None,
        "national_fare_change_pct": None,
        "generated_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
    }

    today_stats_all: List[float] = []
    prev_stats_all: List[float] = []

    # eSankhyiki official portal registry entry (not part of the fare quote stream)
    for reg_name in ("MOSPI ESANKHYIKI", "MOSPI ESANKHYIKI",):
        reg = registry.get(reg_name) or registry.get("MOSPI ESANKHYIKI")
        if reg:
            channels.append({
                "channel_key": "SRC-ESANKHYIKI",
                "display_name": "MoSPI eSankhyiki",
                "source_type": "GOVERNMENT_PORTAL",
                "base_url": reg.get("base_url"),
                "health": "SUCCESS" if reg.get("status") == "ACTIVE" else "FAILED",
                "quotes_today": None,
                "last_activity": reg.get("last_scraped_at"),
                "latency_ms": reg.get("avg_latency_ms"),
                "success_rate_24h": reg.get("success_rate_24h"),
                "note": "Official macro catalog · monthly CPI baseline sync",
            })
            break

    for portal, (label, stype) in PORTAL_LABELS.items():
        cur = _portal_stats(conn, portal, latest_date) if latest_date else {"cnt": 0, "avg_fare": None, "last_activity": None}
        prev = _portal_stats(conn, portal, prev_date) if prev_date else {"cnt": 0, "avg_fare": None, "last_activity": None}
        if cur["avg_fare"] is not None:
            today_stats_all.append(cur["avg_fare"])
            prev_stats_all.append(prev["avg_fare"] if prev["avg_fare"] is not None else cur["avg_fare"])
        cnt30 = conn.execute(
            "SELECT COUNT(*) c FROM raw_quotes WHERE source_portal = ? AND booking_date >= date(?, '-30 day')",
            (portal, latest_date or "2026-01-01"),
        ).fetchone()["c"]

        reg = registry.get(label.upper()) or registry.get(f"{label} DIRECT") or registry.get(label)
        active = bool(reg.get("is_active", 1)) if reg else True
        errs = int(reg.get("error_count_24h", 0) or 0) if reg else 0
        if (reg and reg.get("status") != "ACTIVE") or errs >= 5 or not active:
            health = "FAILED"
        elif cur["cnt"] == 0:
            health = "DELAYED"
        else:
            health = "SUCCESS"

        fare_change = None
        if cur["avg_fare"] is not None and prev["avg_fare"]:
            fare_change = round((cur["avg_fare"] - prev["avg_fare"]) / prev["avg_fare"] * 100.0, 2)

        channels.append({
            "channel_key": portal,
            "display_name": label,
            "source_type": stype,
            "base_url": reg.get("base_url") if reg else None,
            "health": health,
            "quotes_today": cur["cnt"],
            "quotes_30d": cnt30,
            "avg_fare_today_inr": round(cur["avg_fare"], 2) if cur["avg_fare"] is not None else None,
            "avg_fare_previous_inr": round(prev["avg_fare"], 2) if prev["avg_fare"] is not None else None,
            "fare_change_pct": fare_change,
            "last_activity": cur["last_activity"],
            "latency_ms": reg.get("avg_latency_ms") if reg else None,
            "success_rate_24h": reg.get("success_rate_24h") if reg else None,
            "error_count_24h": errs,
        })

    # Pipeline cleanliness for the latest cycle (cleaned_quotes mirror)
    try:
        if latest_date:
            clean_row = conn.execute(
                "SELECT COUNT(*) c, SUM(CASE WHEN outlier_flag = 0 THEN 1 ELSE 0 END) kept, "
                "SUM(CASE WHEN outlier_flag = 1 THEN 1 ELSE 0 END) outliers "
                "FROM cleaned_quotes WHERE booking_date = ?",
                (latest_date,),
            ).fetchone()
            summary["validated_quotes_today"] = int(clean_row["kept"] or 0)
            summary["outliers_today"] = int(clean_row["outliers"] or 0)
    except Exception as exc:  # noqa: BLE001
        logger.debug(f"Cleaned quotes mirror unavailable: {exc}")

    summary["channels_total"] = len(channels)
    summary["channels_healthy"] = sum(1 for c in channels if c["health"] == "SUCCESS")
    summary["quotes_today_total"] = sum(c["quotes_today"] or 0 for c in channels if c["source_type"] != "GOVERNMENT_PORTAL")
    if today_stats_all:
        summary["average_fare_today_inr"] = round(sum(today_stats_all) / len(today_stats_all), 2)
    if prev_stats_all:
        summary["average_fare_previous_inr"] = round(sum(prev_stats_all) / len(prev_stats_all), 2)
    if summary["average_fare_today_inr"] and summary["average_fare_previous_inr"]:
        summary["national_fare_change_pct"] = round(
            (summary["average_fare_today_inr"] - summary["average_fare_previous_inr"])
            / summary["average_fare_previous_inr"] * 100.0, 2)

    return {"summary": summary, "channels": channels, "data_tag": "REAL_COMPUTED"}


def get_route_movements(lookback_days: int = 7) -> Dict[str, Any]:
    """Route-level composite movement between the latest two calculation dates.

    Composite relative per route/date = mean of window composites stored in
    route_indices; composite fare = DGCA-window weighted Jevons mean. National
    aggregates are route-weight (DGCA) + window-weight adjusted.
    """
    conn = get_db_connection()
    dates = [r["calculation_date"] for r in conn.execute(
        "SELECT DISTINCT calculation_date FROM route_indices ORDER BY calculation_date DESC").fetchall()]
    if len(dates) < 2:
        return {"as_of_date": dates[0] if dates else None, "comparison_date": None,
                "routes": [], "national": None, "data_tag": "REAL_COMPUTED"}

    latest = dates[0]
    target = latest
    for d in dates[1:]:
        if (datetime.date.fromisoformat(latest) - datetime.date.fromisoformat(d)).days >= max(1, lookback_days):
            target = d
            break
    if target == latest:
        target = dates[-1]

    def route_snapshot(date_str: str) -> Dict[str, Dict[str, Any]]:
        rows = conn.execute(
            "SELECT route_code, advance_window, jevons_mean_fare, composite_route_relative "
            "FROM route_indices WHERE calculation_date = ?", (date_str,)).fetchall()
        snap: Dict[str, Dict[str, Any]] = {}
        for r in rows:
            w = int(r["advance_window"].replace("T+", "").replace("T", "") or 7)
            wt = WINDOW_WEIGHTS.get(w, 0.2)
            e = snap.setdefault(r["route_code"], {"rel_wsum": 0.0, "fare_wsum": 0.0, "wsum": 0.0, "cnt": 0})
            e["rel_wsum"] += float(r["composite_route_relative"] or 0.0)
            e["fare_wsum"] += wt * float(r["jevons_mean_fare"] or 0.0)
            e["wsum"] += wt
            e["cnt"] += 1
        out = {}
        for rc, e in snap.items():
            out[rc] = {
                "composite_relative": e["rel_wsum"] / e["cnt"] if e["cnt"] else 1.0,
                "composite_fare_inr": e["fare_wsum"] / e["wsum"] if e["wsum"] else None,
            }
        return out

    cur = route_snapshot(latest)
    prev = route_snapshot(target)

    from ..config.routes import DGCA_TOP_20_ROUTES
    routes_out = []
    for r in DGCA_TOP_20_ROUTES:
        rc = r.route_code
        if rc not in cur:
            continue
        c, p = cur[rc], prev.get(rc)
        if p is None or not p["composite_fare_inr"] or not c["composite_fare_inr"]:
            continue
        change_pct = round((c["composite_fare_inr"] - p["composite_fare_inr"]) / p["composite_fare_inr"] * 100.0, 2)
        routes_out.append({
            "route_code": rc,
            "origin_iata": r.origin,
            "destination_iata": r.destination,
            "origin_city": r.origin_city,
            "destination_city": r.destination_city,
            "dgca_weight_pct": round(r.weight * 100.0, 2),
            "current_fare_inr": round(c["composite_fare_inr"], 2),
            "previous_fare_inr": round(p["composite_fare_inr"], 2),
            "current_composite_relative": round(c["composite_relative"], 4),
            "change_pct": change_pct,
        })

    routes_out.sort(key=lambda x: x["change_pct"], reverse=True)

    # National aggregates: route weights (normalized over present routes) applied
    wsum_nat = sum(x["dgca_weight_pct"] for x in routes_out) or 1.0
    nat_cur = sum(x["current_fare_inr"] * x["dgca_weight_pct"] for x in routes_out) / wsum_nat
    nat_prev = sum(x["previous_fare_inr"] * x["dgca_weight_pct"] for x in routes_out) / wsum_nat
    national = {
        "current_fare_inr": round(nat_cur, 2),
        "previous_fare_inr": round(nat_prev, 2),
        "change_pct": round((nat_cur - nat_prev) / nat_prev * 100.0, 2) if nat_prev else None,
        "routes_covered": len(routes_out),
    }

    return {
        "as_of_date": latest,
        "comparison_date": target,
        "lookback_days_requested": lookback_days,
        "routes": routes_out,
        "national": national,
        "data_tag": "REAL_COMPUTED",
    }
