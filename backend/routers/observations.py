from fastapi import APIRouter, Query
from typing import Literal, Optional
from models.observation import AnyObservation
from service import get_sensor_observations

router = APIRouter(prefix="/api/observations", tags=["observations"])

ObType = Literal["RADAR", "OPTICAL", "RF"]


@router.get("", response_model=list[AnyObservation])
async def list_observations(
    sensor_id: str = Query(..., description="UDL sensor ID"),
    hours: int = Query(default=24, ge=1, le=168, description="Lookback window in hours"),
    ob_type: Optional[ObType] = Query(default=None, description="Filter by observation type"),
) -> list[AnyObservation]:
    """Return observations for a sensor, optionally filtered by type."""
    return await get_sensor_observations(
        sensor_id=sensor_id, hours=hours, ob_type=ob_type
    )
