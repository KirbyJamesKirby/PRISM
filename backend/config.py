from pydantic_settings import BaseSettings
from pydantic import Field
import yaml
from pathlib import Path
from typing import Any


class Settings(BaseSettings):
    udl_base_url: str = Field(default="https://unifieddatalibrary.com", alias="UDL_BASE_URL")
    udl_username: str = Field(default="", alias="UDL_USERNAME")
    udl_password: str = Field(default="", alias="UDL_PASSWORD")
    # How many minutes of silence before a sensor is flagged as down
    sensor_outage_threshold_minutes: int = Field(default=30, alias="SENSOR_OUTAGE_THRESHOLD_MINUTES")
    sites_config_path: str = Field(default="sites.yaml", alias="SITES_CONFIG_PATH")

    model_config = {"env_file": ".env", "populate_by_name": True}


def load_sites_config(path: str | None = None) -> list[dict[str, Any]]:
    """Load the site/sensor registry from sites.yaml."""
    config_path = Path(path or "sites.yaml")
    if not config_path.exists():
        return []
    with open(config_path) as f:
        data = yaml.safe_load(f)
    return data.get("sites", [])


settings = Settings()
