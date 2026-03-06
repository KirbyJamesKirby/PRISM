import { AlertTriangle, AlertCircle } from "lucide-react";
import type { Alert } from "../lib/types";

export function AlertBanner({ alerts }: { alerts: Alert[] }) {
  if (alerts.length === 0) return null;

  const criticals = alerts.filter((a) => a.severity === "CRITICAL");
  const warnings = alerts.filter((a) => a.severity === "WARNING");

  return (
    <div className="space-y-1.5 mb-4">
      {criticals.length > 0 && (
        <div className="flex items-start gap-2 px-4 py-2.5 rounded-lg bg-red-950/60 border border-red-700 text-red-300 text-sm">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <div>
            <span className="font-semibold">{criticals.length} critical alert{criticals.length > 1 ? "s" : ""}:</span>{" "}
            {criticals[0].message}
            {criticals.length > 1 && ` (+${criticals.length - 1} more)`}
          </div>
        </div>
      )}
      {warnings.length > 0 && (
        <div className="flex items-start gap-2 px-4 py-2.5 rounded-lg bg-yellow-950/60 border border-yellow-700 text-yellow-300 text-sm">
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
          <div>
            <span className="font-semibold">{warnings.length} warning{warnings.length > 1 ? "s" : ""}:</span>{" "}
            {warnings[0].message}
            {warnings.length > 1 && ` (+${warnings.length - 1} more)`}
          </div>
        </div>
      )}
    </div>
  );
}
