from pydantic import BaseModel
from typing import Literal, Optional
from datetime import datetime


SensorType = Literal["RADAR", "OPTICAL", "RF"]
SensorStatus = Literal["NOMINAL", "DEGRADED", "OFFLINE", "UNKNOWN"]


class Sensor(BaseModel):
    id: str
    name: str
    type: SensorType
    site_id: str
    status: SensorStatus = "UNKNOWN"
    last_ob_epoch: Optional[datetime] = None
    obs_last_24h: int = 0
