from fastapi import APIRouter
from models.site import SiteStatus
from service import get_all_sites_status

router = APIRouter(prefix="/api/sites", tags=["sites"])


@router.get("", response_model=list[SiteStatus])
async def list_sites() -> list[SiteStatus]:
    """Return fleet-level status for all Crimson Shock sites."""
    return await get_all_sites_status()


@router.get("/{site_id}", response_model=SiteStatus)
async def get_site(site_id: str) -> SiteStatus:
    sites = await get_all_sites_status()
    for site in sites:
        if site.id == site_id:
            return site
    from fastapi import HTTPException
    raise HTTPException(status_code=404, detail=f"Site '{site_id}' not found.")
