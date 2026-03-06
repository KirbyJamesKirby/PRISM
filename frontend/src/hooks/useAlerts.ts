import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";

export function useAlerts() {
  return useQuery({
    queryKey: ["alerts"],
    queryFn: api.alerts.list,
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
}
