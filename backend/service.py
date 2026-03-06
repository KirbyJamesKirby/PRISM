"""
Business logic: aggregate UDL data + site registry into PRISM models.
"""

from datetime import datetime, timedelta, timezone
from typing import Any
import uuid

from config import settings, load_sites_config
from udl_client import udl_client
from models.observation import AnyObservation
from models.sensor import Sensor, SensorStatus
from models.site import SiteStatus, SiteLocation
from models.alert import Alert


def _sensor_status(last_ob: datetime | None) -> SensorStatus:
    if last_ob is None:
        return "UNKNOWN"
    age = datetime.now(timezone.utc) - last_ob
    threshold = timedelta(minutes=settings.sensor_outage_threshold_minutes)
    if age < threshold * 0.5:
        return "NOMINAL"
    elif age < threshold:
        return "DEGRADED"
    return "OFFLINE"


def _worst_status(statuses: list[SensorStatus]) -> SensorStatus:
    order = ["OFFLINE", "DEGRADED", "UNKNOWN", "NOMINAL"]
    for s in order:
        if s in statuses:
            return s  # type: ignore[return-value]
    return "UNKNOWN"


async def get_all_sites_status() -> list[SiteStatus]:
    sites_cfg = load_sites_config(settings.sites_config_path)
    since_24h = datetime.now(timezone.utc) - timedelta(hours=24)

    results = []
    for site_cfg in sites_cfg:
        sensors_cfg: list[dict[str, Any]] = site_cfg.get("sensors", [])
        sensors: list[Sensor] = []
        total_obs = 0
        last_ob_overall: datetime | None = None

        for s_cfg in sensors_cfg:
            obs = await udl_client.get_observations(
                sensor_id=s_cfg["id"],
                since=since_24h,
            )
            count = len(obs)
            last_ob = obs[0].epoch if obs else None
            total_obs += count
            if last_ob and (last_ob_overall is None or last_ob > last_ob_overall):
                last_ob_overall = last_ob

            sensors.append(
                Sensor(
                    id=s_cfg["id"],
                    name=s_cfg["name"],
                    type=s_cfg["type"],
                    site_id=site_cfg["id"],
                    status=_sensor_status(last_ob),
                    last_ob_epoch=last_ob,
                    obs_last_24h=count,
                )
            )

        loc = site_cfg.get("location", {})
        results.append(
            SiteStatus(
                id=site_cfg["id"],
                name=site_cfg["name"],
                location=SiteLocation(lat=loc.get("lat", 0), lon=loc.get("lon", 0)),
                sensors=sensors,
                overall_status=_worst_status([s.status for s in sensors]),
                obs_last_24h=total_obs,
                last_ob_epoch=last_ob_overall,
            )
        )
    return results


async def get_sensor_observations(
    sensor_id: str,
    hours: int = 24,
    ob_type: str | None = None,
) -> list[AnyObservation]:
    since = datetime.now(timezone.utc) - timedelta(hours=hours)
    return await udl_client.get_observations(sensor_id=sensor_id, since=since, ob_type=ob_type)


async def get_alerts(sites: list[SiteStatus]) -> list[Alert]:
    alerts: list[Alert] = []
    for site in sites:
        for sensor in site.sensors:
            if sensor.status in ("OFFLINE", "UNKNOWN") and sensor.last_ob_epoch is None:
                alerts.append(
                    Alert(
                        id=str(uuid.uuid4()),
                        alert_type="SENSOR_OUTAGE",
                        severity="CRITICAL",
                        site_id=site.id,
                        sensor_id=sensor.id,
                        message=f"Sensor {sensor.name} at {site.name} has no observations (never reported).",
                        triggered_at=datetime.now(timezone.utc),
                    )
                )
            elif sensor.status == "OFFLINE":
                alerts.append(
                    Alert(
                        id=str(uuid.uuid4()),
                        alert_type="SENSOR_OUTAGE",
                        severity="CRITICAL",
                        site_id=site.id,
                        sensor_id=sensor.id,
                        message=(
                            f"Sensor {sensor.name} at {site.name} has been silent for "
                            f">{settings.sensor_outage_threshold_minutes} minutes."
                        ),
                        triggered_at=datetime.now(timezone.utc),
                    )
                )
            elif sensor.status == "DEGRADED":
                alerts.append(
                    Alert(
                        id=str(uuid.uuid4()),
                        alert_type="SENSOR_OUTAGE",
                        severity="WARNING",
                        site_id=site.id,
                        sensor_id=sensor.id,
                        message=f"Sensor {sensor.name} at {site.name} may be degrading — observation gap detected.",
                        triggered_at=datetime.now(timezone.utc),
                    )
                )
    return alerts
