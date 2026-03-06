import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { ObType } from "../lib/types";

export function useObservations(sensorId: string, hours = 24, obType?: ObType) {
  return useQuery({
    queryKey: ["observations", sensorId, hours, obType],
    queryFn: () => api.observations.list(sensorId, hours, obType),
    refetchInterval: 60_000,
    staleTime: 30_000,
    enabled: !!sensorId,
  });
}
