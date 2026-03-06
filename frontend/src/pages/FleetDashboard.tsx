import { useFleetStatus } from "../hooks/useFleetStatus";
import { useAlerts } from "../hooks/useAlerts";
import { SiteCard } from "../components/SiteCard";
import { AlertBanner } from "../components/AlertBanner";
import { FleetMap } from "../components/FleetMap";
import { RefreshCw } from "lucide-react";

function LastUpdated() {
  return (
    <span className="flex items-center gap-1.5 text-xs text-slate-500">
      <RefreshCw className="w-3 h-3" />
      Auto-refreshes every 60s
    </span>
  );
}

export function FleetDashboard() {
  const { data: sites, isLoading, isError } = useFleetStatus();
  const { data: alerts } = useAlerts();

  const totalObs = sites?.reduce((sum, s) => sum + s.obs_last_24h, 0) ?? 0;
  const totalSensors = sites?.reduce((sum, s) => sum + s.sensors.length, 0) ?? 0;
  const offlineSensors = sites?.flatMap((s) => s.sensors).filter((s) => s.status === "OFFLINE").length ?? 0;

  return (
    <div className="min-h-screen bg-[#0a0f1e] px-6 py-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">
            PRISM
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Crimson Shock · Fleet Status</p>
        </div>
        <LastUpdated />
      </div>

      {/* Alerts */}
      {alerts && alerts.length > 0 && <AlertBanner alerts={alerts} />}

      {/* Summary stats */}
      {sites && (
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            { label: "Sites", value: sites.length },
            { label: "Sensors", value: totalSensors },
            { label: "Offline sensors", value: offlineSensors, warn: offlineSensors > 0 },
            { label: "Obs (24h)", value: totalObs.toLocaleString() },
          ].map((stat) => (
            <div key={stat.label} className="bg-slate-900 border border-slate-700 rounded-xl p-4">
              <p className="text-xs text-slate-500 mb-1">{stat.label}</p>
              <p className={`text-2xl font-bold font-mono ${stat.warn ? "text-red-400" : "text-slate-100"}`}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Map */}
      {sites && sites.length > 0 && (
        <div className="mb-6">
          <FleetMap sites={sites} />
        </div>
      )}

      {/* Loading / error */}
      {isLoading && (
        <p className="text-slate-500 text-sm text-center py-12">Loading fleet status…</p>
      )}
      {isError && (
        <p className="text-red-400 text-sm text-center py-12">
          Failed to load fleet data. Check UDL connectivity.
        </p>
      )}

      {/* Site cards */}
      {sites && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sites.map((site) => (
            <SiteCard key={site.id} site={site} />
          ))}
        </div>
      )}
    </div>
  );
}
