import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../../../shared/api/httpClient";
import { queryKeys } from "../../../shared/api/queryKeys";
import type { ProjectReadModel } from "../types/projectTypes";

function getProjects() {
  return apiFetch<ProjectReadModel[]>("/Projects");
}

export function useProjects() {
  return useQuery({
    queryKey: queryKeys.projects.all,
    queryFn: getProjects,
  });
}
