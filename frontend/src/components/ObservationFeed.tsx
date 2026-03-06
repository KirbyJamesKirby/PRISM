import { useState } from "react";
import { useObservations } from "../hooks/useObservations";
import { ObsTypeTag } from "./ObsTypeTag";
import type { AnyObservation, ObType, RadarObservation, OpticalObservation, RFObservation } from "../lib/types";

const OB_TYPES: Array<{ label: string; value: ObType | "ALL" }> = [
  { label: "All", value: "ALL" },
  { label: "Passive Radar", value: "RADAR" },
  { label: "EO", value: "OPTICAL" },
  { label: "RF", value: "RF" },
];

function formatEpoch(epoch: string) {
  return new Date(epoch).toLocaleString("en-US", {
    month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit",
    hour12: false,
  });
}

function ObDetail({ ob }: { ob: AnyObservation }) {
  if (ob.ob_type === "RADAR") {
    const r = ob as RadarObservation;
    return (
      <span className="text-slate-400 text-xs font-mono">
        {r.range_km != null ? `Rng ${r.range_km.toFixed(1)} km` : ""}
        {r.azimuth_deg != null ? ` | Az ${r.azimuth_deg.toFixed(1)}°` : ""}
        {r.elevation_deg != null ? ` El ${r.elevation_deg.toFixed(1)}°` : ""}
        {r.snr_db != null ? ` SNR ${r.snr_db.toFixed(1)} dB` : ""}
      </span>
    );
  }
  if (ob.ob_type === "OPTICAL") {
    const o = ob as OpticalObservation;
    return (
      <span className="text-slate-400 text-xs font-mono">
        {o.magnitude != null ? `Mag ${o.magnitude.toFixed(1)}` : ""}
        {o.right_ascension_deg != null ? ` | RA ${o.right_ascension_deg.toFixed(3)}°` : ""}
        {o.declination_deg != null ? ` Dec ${o.declination_deg.toFixed(3)}°` : ""}
      </span>
    );
  }
  if (ob.ob_type === "RF") {
    const r = ob as RFObservation;
    return (
      <span className="text-slate-400 text-xs font-mono">
        {r.frequency_mhz != null ? `Freq ${r.frequency_mhz.toFixed(2)} MHz` : ""}
        {r.eirp_dbw != null ? ` | EIRP ${r.eirp_dbw.toFixed(1)} dBW` : ""}
      </span>
    );
  }
  return null;
}

export function ObservationFeed({ sensorId }: { sensorId: string }) {
  const [typeFilter, setTypeFilter] = useState<ObType | "ALL">("ALL");

  const { data, isLoading, isError } = useObservations(
    sensorId,
    24,
    typeFilter === "ALL" ? undefined : typeFilter
  );

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        {OB_TYPES.map((t) => (
          <button
            key={t.value}
            onClick={() => setTypeFilter(t.value)}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
              typeFilter === t.value
                ? "bg-slate-600 text-slate-100"
                : "bg-slate-800 text-slate-400 hover:bg-slate-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {isLoading && (
        <p className="text-slate-500 text-sm py-4 text-center">Loading observations…</p>
      )}
      {isError && (
        <p className="text-red-400 text-sm py-4 text-center">Failed to load observations.</p>
      )}

      {data && data.length === 0 && (
        <p className="text-slate-500 text-sm py-4 text-center">No observations in this window.</p>
      )}

      {data && data.length > 0 && (
        <div className="rounded-lg border border-slate-700 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-800 border-b border-slate-700">
                <th className="text-left px-3 py-2 text-slate-400 font-medium text-xs">Epoch (UTC)</th>
                <th className="text-left px-3 py-2 text-slate-400 font-medium text-xs">Type</th>
                <th className="text-left px-3 py-2 text-slate-400 font-medium text-xs">Catalog #</th>
                <th className="text-left px-3 py-2 text-slate-400 font-medium text-xs">Details</th>
              </tr>
            </thead>
            <tbody>
              {data.map((ob) => (
                <tr key={ob.ob_id} className="border-b border-slate-800 hover:bg-slate-800/40">
                  <td className="px-3 py-2 font-mono text-slate-300 text-xs whitespace-nowrap">
                    {formatEpoch(ob.epoch)}
                  </td>
                  <td className="px-3 py-2">
                    <ObsTypeTag type={ob.ob_type} />
                  </td>
                  <td className="px-3 py-2 font-mono text-slate-400 text-xs">
                    {ob.catalog_number ?? "—"}
                  </td>
                  <td className="px-3 py-2">
                    <ObDetail ob={ob} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
