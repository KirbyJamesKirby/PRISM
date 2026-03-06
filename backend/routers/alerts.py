from fastapi import APIRouter
from models.alert import Alert
from service import get_all_sites_status, get_alerts

router = APIRouter(prefix="/api/alerts", tags=["alerts"])


@router.get("", response_model=list[Alert])
async def list_alerts() -> list[Alert]:
    """Return active alerts across all Crimson Shock sites."""
    sites = await get_all_sites_status()
    return await get_alerts(sites)
