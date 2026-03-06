import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";

export function useFleetStatus() {
  return useQuery({
    queryKey: ["sites"],
    queryFn: api.sites.list,
    refetchInterval: 60_000, // poll every 60 seconds
    staleTime: 30_000,
  });
}

export function useSiteStatus(siteId: string) {
  return useQuery({
    queryKey: ["sites", siteId],
    queryFn: () => api.sites.get(siteId),
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
}
