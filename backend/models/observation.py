from pydantic import BaseModel
from typing import Literal, Optional
from datetime import datetime


class BaseObservation(BaseModel):
    ob_id: str
    sensor_id: str
    epoch: datetime
    catalog_number: Optional[str] = None  # SATNO / NORAD ID
    ob_type: Literal["RADAR", "OPTICAL", "RF"]


class RadarObservation(BaseObservation):
    ob_type: Literal["RADAR"] = "RADAR"
    range_km: Optional[float] = None
    range_rate_km_s: Optional[float] = None
    azimuth_deg: Optional[float] = None
    elevation_deg: Optional[float] = None
    snr_db: Optional[float] = None


class OpticalObservation(BaseObservation):
    ob_type: Literal["OPTICAL"] = "OPTICAL"
    right_ascension_deg: Optional[float] = None
    declination_deg: Optional[float] = None
    magnitude: Optional[float] = None
    track_length_s: Optional[float] = None


class RFObservation(BaseObservation):
    ob_type: Literal["RF"] = "RF"
    frequency_mhz: Optional[float] = None
    eirp_dbw: Optional[float] = None


AnyObservation = RadarObservation | OpticalObservation | RFObservation
