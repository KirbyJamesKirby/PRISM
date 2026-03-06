import type { SiteStatus, Sensor, AnyObservation, Alert, ObType } from "./types";

const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

async function get<T>(path: string, params?: Record<string, string | number>): Promise<T> {
  const url = new URL(`${BASE}${path}`, window.location.origin);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      url.searchParams.set(k, String(v));
    }
  }
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`);
  return res.json() as Promise<T>;
}

export const api = {
  sites: {
    list: () => get<SiteStatus[]>("/api/sites"),
    get: (id: string) => get<SiteStatus>(`/api/sites/${id}`),
  },
  sensors: {
    get: (id: string) => get<Sensor>(`/api/sensors/${id}`),
  },
  observations: {
    list: (sensorId: string, hours = 24, obType?: ObType) =>
      get<AnyObservation[]>("/api/observations", {
        sensor_id: sensorId,
        hours,
        ...(obType ? { ob_type: obType } : {}),
      }),
  },
  alerts: {
    list: () => get<Alert[]>("/api/alerts"),
  },
};
