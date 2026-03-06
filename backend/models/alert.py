from pydantic import BaseModel
from typing import Literal, Optional
from datetime import datetime


AlertSeverity = Literal["WARNING", "CRITICAL"]
AlertType = Literal["SENSOR_OUTAGE", "MISSED_PASS"]


class Alert(BaseModel):
    id: str
    alert_type: AlertType
    severity: AlertSeverity
    site_id: str
    sensor_id: Optional[str] = None
    message: str
    triggered_at: datetime
