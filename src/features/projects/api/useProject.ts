import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../../../shared/api/httpClient";
import { queryKeys } from "../../../shared/api/queryKeys";
import type { ProjectReadModel } from "../types/projectTypes";

function getProject(id: string) {
  return apiFetch<ProjectReadModel>(`/Projects/${id}`);
}

export function useProject(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.projects.detail(id ?? ""),
    queryFn: () => getProject(id as string),
    enabled: Boolean(id),
  });
}
