import type { SensorStatus } from "../lib/types";

const STATUS_STYLES: Record<SensorStatus, string> = {
  NOMINAL: "bg-green-900/40 text-green-400 border border-green-700",
  DEGRADED: "bg-yellow-900/40 text-yellow-400 border border-yellow-700",
  OFFLINE: "bg-red-900/40 text-red-400 border border-red-700",
  UNKNOWN: "bg-slate-800 text-slate-400 border border-slate-600",
};

const STATUS_DOT: Record<SensorStatus, string> = {
  NOMINAL: "bg-green-400",
  DEGRADED: "bg-yellow-400",
  OFFLINE: "bg-red-400",
  UNKNOWN: "bg-slate-500",
};

export function StatusBadge({ status }: { status: SensorStatus }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium ${STATUS_STYLES[status]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[status]}`} />
      {status}
    </span>
  );
}
