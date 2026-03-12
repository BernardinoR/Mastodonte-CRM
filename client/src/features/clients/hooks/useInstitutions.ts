import { useQuery } from "@tanstack/react-query";
import type { Institution } from "@shared/types";

export function useInstitutions() {
  return useQuery<{ institutions: Institution[] }>({
    queryKey: ["/api/institutions"],
    staleTime: Infinity,
  });
}
