import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../../../shared/api/httpClient";
import { queryKeys } from "../../../shared/api/queryKeys";
import type { PublicCVReadModel } from "../types/cvTypes";

function getCv() {
  return apiFetch<PublicCVReadModel>("/CV");
}

export function useCv() {
  return useQuery({
    queryKey: queryKeys.cv,
    queryFn: getCv,
  });
}
