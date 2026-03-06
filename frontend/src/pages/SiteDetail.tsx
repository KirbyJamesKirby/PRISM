import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Radio, Eye, Wifi } from "lucide-react";
import { useSiteStatus } from "../hooks/useFleetStatus";
import { useAlerts } from "../hooks/useAlerts";
import { StatusBadge } from "../components/StatusBadge";
import { AlertBanner } from "../components/AlertBanner";
import { ObservationFeed } from "../components/ObservationFeed";
import type { Sensor } from "../lib/types";

function SensorTypeIcon({ type }: { type: string }) {
  if (type === "RADAR") return <Radio className="w-4 h-4 text-blue-400" />;
  if (type === "OPTICAL") return <Eye className="w-4 h-4 text-yellow-400" />;
  return <Wifi className="w-4 h-4 text-purple-400" />;
}

function SensorRow({
  sensor,
  selected,
  onClick,
}: {
  sensor: Sensor;
  selected: boolean;
  onClick: () => void;
}) {
  const ageMs = sensor.last_ob_epoch ? Date.now() - new Date(sensor.last_ob_epoch).getTime() : null;
  const ageMins = ageMs !== null ? Math.floor(ageMs / 60_000) : null;

  return (
    <button
      onClick={onClick}
      className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-lg border transition-colors ${
        selected
          ? "border-slate-500 bg-slate-800"
          : "border-slate-700 bg-slate-900 hover:border-slate-600"
      }`}
    >
      <SensorTypeIcon type={sensor.type} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-200 truncate">{sensor.name}</p>
        <p className="text-xs text-slate-500 font-mono">{sensor.id}</p>
      </div>
      <div className="text-right text-xs text-slate-400 shrink-0">
        <p>{sensor.obs_last_24h.toLocaleString()} obs/24h</p>
        <p>{ageMins !== null ? `${ageMins}m ago` : "No data"}</p>
      </div>
      <StatusBadge status={sensor.status} />
    </button>
  );
}

export function SiteDetail() {
  const { siteId } = useParams<{ siteId: string }>();
  const { data: site, isLoading, isError } = useSiteStatus(siteId ?? "");
  const { data: allAlerts } = useAlerts();
  const [selectedSensorId, setSelectedSensorId] = useState<string | null>(null);

  const siteAlerts = allAlerts?.filter((a) => a.site_id === siteId) ?? [];
  const activeSensor = selectedSensorId ?? site?.sensors[0]?.id ?? null;

  if (isLoading) {
    return <div className="text-slate-500 text-center py-20">Loading site…</div>;
  }
  if (isError || !site) {
    return <div className="text-red-400 text-center py-20">Site not found.</div>;
  }

  return (
    <div className="min-h-screen bg-[#0a0f1e] px-6 py-8 max-w-7xl mx-auto">
      <div className="mb-6">
        <Link to="/" className="flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to Fleet
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-100">{site.name}</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {site.location.lat.toFixed(4)}°, {site.location.lon.toFixed(4)}°
            </p>
          </div>
          <StatusBadge status={site.overall_status} />
        </div>
      </div>

      {siteAlerts.length > 0 && <AlertBanner alerts={siteAlerts} />}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sensor list */}
        <div>
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Sensors</h2>
          <div className="space-y-2">
            {site.sensors.map((sensor) => (
              <SensorRow
                key={sensor.id}
                sensor={sensor}
                selected={activeSensor === sensor.id}
                onClick={() => setSelectedSensorId(sensor.id)}
              />
            ))}
          </div>
        </div>

        {/* Observation feed */}
        <div className="lg:col-span-2">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Observations · {site.sensors.find((s) => s.id === activeSensor)?.name ?? ""}
          </h2>
          {activeSensor ? (
            <ObservationFeed sensorId={activeSensor} />
          ) : (
            <p className="text-slate-500 text-sm">Select a sensor to view observations.</p>
          )}
        </div>
      </div>
    </div>
  );
}

// useState must be imported — add it here
import { useState } from "react";
