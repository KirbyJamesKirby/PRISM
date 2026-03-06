"""
Async client for the Unified Data Library (UDL) REST API.

UDL uses HTTP Basic Auth to obtain a session token which is then passed
as a Bearer token on subsequent requests. This client handles that flow
and exposes methods for querying observations by sensor ID and time range.
"""

import httpx
import logging
from datetime import datetime, timezone
from typing import Any

from config import settings
from models.observation import (
    RadarObservation,
    OpticalObservation,
    RFObservation,
    AnyObservation,
)

logger = logging.getLogger(__name__)

# UDL epoch format: ISO-8601 with Z suffix
_EPOCH_FMT = "%Y-%m-%dT%H:%M:%S.%fZ"


def _fmt_epoch(dt: datetime) -> str:
    return dt.strftime(_EPOCH_FMT)


def _parse_epoch(s: str) -> datetime:
    try:
        return datetime.strptime(s, _EPOCH_FMT).replace(tzinfo=timezone.utc)
    except ValueError:
        return datetime.fromisoformat(s.replace("Z", "+00:00"))


class UDLClient:
    def __init__(self) -> None:
        self._base = settings.udl_base_url.rstrip("/")
        self._username = settings.udl_username
        self._password = settings.udl_password
        self._token: str | None = None
        self._http = httpx.AsyncClient(timeout=30.0)

    async def _get_token(self) -> str:
        """Exchange credentials for a bearer token."""
        resp = await self._http.get(
            f"{self._base}/udl/userinfo",
            auth=(self._username, self._password),
        )
        resp.raise_for_status()
        data = resp.json()
        return data.get("token") or data.get("access_token", "")

    async def _ensure_token(self) -> str:
        if not self._token:
            self._token = await self._get_token()
        return self._token

    async def _get(self, path: str, params: dict[str, Any]) -> Any:
        token = await self._ensure_token()
        resp = await self._http.get(
            f"{self._base}{path}",
            params=params,
            headers={"Authorization": f"Bearer {token}"},
        )
        if resp.status_code == 401:
            # Token expired — refresh and retry once
            self._token = await self._get_token()
            resp = await self._http.get(
                f"{self._base}{path}",
                params=params,
                headers={"Authorization": f"Bearer {self._token}"},
            )
        resp.raise_for_status()
        return resp.json()

    async def get_observations(
        self,
        sensor_id: str,
        since: datetime,
        ob_type: str | None = None,
        limit: int = 500,
    ) -> list[AnyObservation]:
        """
        Fetch observations for a sensor since a given datetime.
        ob_type: 'RADAR', 'OPTICAL', or 'RF'. None = all types.
        """
        params: dict[str, Any] = {
            "sensorId": sensor_id,
            "epoch": f">={_fmt_epoch(since)}",
            "limit": limit,
            "sort": "epoch:desc",
        }
        if ob_type:
            params["observationType"] = ob_type

        try:
            raw = await self._get("/udl/observation", params)
        except httpx.HTTPStatusError as e:
            logger.warning("UDL query failed for sensor %s: %s", sensor_id, e)
            return []
        except Exception as e:
            logger.error("Unexpected error querying UDL for sensor %s: %s", sensor_id, e)
            return []

        results: list[AnyObservation] = []
        for item in raw if isinstance(raw, list) else raw.get("data", []):
            obs = _parse_udl_observation(item)
            if obs:
                results.append(obs)
        return results

    async def close(self) -> None:
        await self._http.aclose()


def _parse_udl_observation(item: dict[str, Any]) -> AnyObservation | None:
    """Map a raw UDL observation dict to a typed Pydantic model."""
    ob_type = item.get("observationType") or item.get("obType", "")
    base = {
        "ob_id": str(item.get("id") or item.get("obId", "")),
        "sensor_id": str(item.get("sensorId", "")),
        "epoch": _parse_epoch(item.get("epoch", "")),
        "catalog_number": str(item.get("catalogNumber", "")) or None,
    }
    if ob_type == "RADAR":
        return RadarObservation(
            **base,
            range_km=item.get("range"),
            range_rate_km_s=item.get("rangeRate"),
            azimuth_deg=item.get("azimuth"),
            elevation_deg=item.get("elevation"),
            snr_db=item.get("snr"),
        )
    elif ob_type == "OPTICAL":
        return OpticalObservation(
            **base,
            right_ascension_deg=item.get("ra"),
            declination_deg=item.get("dec"),
            magnitude=item.get("magnitude"),
            track_length_s=item.get("trackLength"),
        )
    elif ob_type == "RF":
        return RFObservation(
            **base,
            frequency_mhz=item.get("frequencyMhz"),
            eirp_dbw=item.get("eirpDbw"),
        )
    else:
        logger.debug("Unknown ob_type '%s', skipping.", ob_type)
        return None


# Singleton — shared across the app lifetime
udl_client = UDLClient()
