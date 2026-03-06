from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from udl_client import udl_client
from routers import sites, sensors, observations, alerts


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield
    await udl_client.close()


app = FastAPI(
    title="PRISM",
    description="Monitoring and status app for the Crimson Shock expeditionary SDA capability.",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_methods=["GET"],
    allow_headers=["*"],
)

app.include_router(sites.router)
app.include_router(sensors.router)
app.include_router(observations.router)
app.include_router(alerts.router)


@app.get("/health")
async def health():
    return {"status": "ok", "service": "PRISM"}
