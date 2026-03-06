import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { SiteStatus, SensorStatus } from "../lib/types";

const STATUS_COLOR: Record<SensorStatus, string> = {
  NOMINAL: "#4ade80",
  DEGRADED: "#facc15",
  OFFLINE: "#f87171",
  UNKNOWN: "#94a3b8",
};

export function FleetMap({ sites }: { sites: SiteStatus[] }) {
  return (
    <div className="rounded-xl overflow-hidden border border-slate-700" style={{ height: 320 }}>
      <MapContainer
        center={[20, 0]}
        zoom={2}
        style={{ height: "100%", width: "100%", background: "#0f172a" }}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        />
        {sites.map((site) => (
          <CircleMarker
            key={site.id}
            center={[site.location.lat, site.location.lon]}
            radius={10}
            pathOptions={{
              color: STATUS_COLOR[site.overall_status],
              fillColor: STATUS_COLOR[site.overall_status],
              fillOpacity: 0.7,
            }}
          >
            <Popup>
              <div className="text-sm">
                <p className="font-semibold">{site.name}</p>
                <p className="text-slate-500">{site.sensors.length} sensor{site.sensors.length !== 1 ? "s" : ""}</p>
                <p>Obs (24h): {site.obs_last_24h.toLocaleString()}</p>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
