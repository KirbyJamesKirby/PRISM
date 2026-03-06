import { Link } from "react-router-dom";
import { Radio, Eye, Wifi, AlertCircle } from "lucide-react";
import type { SiteStatus } from "../lib/types";
import { StatusBadge } from "./StatusBadge";

function SensorTypeIcon({ type }: { type: string }) {
  if (type === "RADAR") return <Radio className="w-3.5 h-3.5" />;
  if (type === "OPTICAL") return <Eye className="w-3.5 h-3.5" />;
  return <Wifi className="w-3.5 h-3.5" />;
}

function formatEpoch(epoch: string | null) {
  if (!epoch) return "Never";
  const d = new Date(epoch);
  const ageMs = Date.now() - d.getTime();
  const ageMins = Math.floor(ageMs / 60_000);
  if (ageMins < 60) return `${ageMins}m ago`;
  const ageHrs = Math.floor(ageMins / 60);
  if (ageHrs < 24) return `${ageHrs}h ago`;
  return `${Math.floor(ageHrs / 24)}d ago`;
}

export function SiteCard({ site }: { site: SiteStatus }) {
  return (
    <Link
      to={`/sites/${site.id}`}
      className="block bg-slate-900 border border-slate-700 rounded-xl p-5 hover:border-slate-500 transition-colors"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h2 className="text-base font-semibold text-slate-100">{site.name}</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {site.location.lat.toFixed(2)}°, {site.location.lon.toFixed(2)}°
          </p>
        </div>
        <StatusBadge status={site.overall_status} />
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
        <div className="bg-slate-800/60 rounded-lg p-3">
          <p className="text-slate-400 text-xs mb-1">Obs (24h)</p>
          <p className="text-slate-100 font-mono font-medium">{site.obs_last_24h.toLocaleString()}</p>
        </div>
        <div className="bg-slate-800/60 rounded-lg p-3">
          <p className="text-slate-400 text-xs mb-1">Last obs</p>
          <p className="text-slate-100 font-mono font-medium">{formatEpoch(site.last_ob_epoch)}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        {site.sensors.map((s) => (
          <div
            key={s.id}
            className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-800 px-2 py-1 rounded"
          >
            <SensorTypeIcon type={s.type} />
            <span className="text-slate-300">{s.name}</span>
            <StatusBadge status={s.status} />
          </div>
        ))}
      </div>

      {site.active_alert_count > 0 && (
        <div className="flex items-center gap-1.5 text-xs text-red-400 mt-2">
          <AlertCircle className="w-3.5 h-3.5" />
          {site.active_alert_count} active alert{site.active_alert_count > 1 ? "s" : ""}
        </div>
      )}
    </Link>
  );
}
