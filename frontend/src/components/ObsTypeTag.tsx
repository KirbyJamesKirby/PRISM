import type { ObType } from "../lib/types";

const TAG_STYLES: Record<ObType, string> = {
  RADAR: "bg-blue-900/40 text-blue-300 border border-blue-700",
  OPTICAL: "bg-yellow-900/40 text-yellow-300 border border-yellow-700",
  RF: "bg-purple-900/40 text-purple-300 border border-purple-700",
};

const LABELS: Record<ObType, string> = {
  RADAR: "Passive Radar",
  OPTICAL: "EO",
  RF: "RF",
};

export function ObsTypeTag({ type }: { type: ObType }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${TAG_STYLES[type]}`}>
      {LABELS[type]}
    </span>
  );
}
