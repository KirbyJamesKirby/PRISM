from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from .sensor import Sensor, SensorStatus


class SiteLocation(BaseModel):
    lat: float
    lon: float


class SiteStatus(BaseModel):
    id: str
    name: str
    location: SiteLocation
    sensors: list[Sensor]
    overall_status: SensorStatus  # worst-case across all sensors
    obs_last_24h: int
    last_ob_epoch: Optional[datetime] = None
    active_alert_count: int = 0
