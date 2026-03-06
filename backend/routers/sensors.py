from fastapi import APIRouter, HTTPException
from models.sensor import Sensor
from service import get_all_sites_status

router = APIRouter(prefix="/api/sensors", tags=["sensors"])


@router.get("/{sensor_id}", response_model=Sensor)
async def get_sensor(sensor_id: str) -> Sensor:
    """Return status for a single sensor by its UDL sensor ID."""
    sites = await get_all_sites_status()
    for site in sites:
        for sensor in site.sensors:
            if sensor.id == sensor_id:
                return sensor
    raise HTTPException(status_code=404, detail=f"Sensor '{sensor_id}' not found.")
