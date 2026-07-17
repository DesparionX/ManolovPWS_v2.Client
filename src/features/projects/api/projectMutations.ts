import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "../../../shared/api/httpClient";
import { queryKeys } from "../../../shared/api/queryKeys";
import type {
  AddProjectRequest,
  ProjectReadModel,
  ChangeProjectNameRequest,
  UpdateProjectDescriptionRequest,
  ChangeProjectStateRequest,
  ChangeProjectThumbRequest,
  UpdateProjectGalleryRequest,
  ChangeProjectGitHubUrlRequest,
  ChangeProjectLiveUrlRequest,
  UpdateProjectStackRequest,
} from "../types/projectTypes";

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: AddProjectRequest) =>
      apiFetch<ProjectReadModel>("/Projects", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    meta: { successMessage: "Project created" },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
    },
  });
}

function useProjectFieldPut<TRequest>(id: string, path: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: TRequest) =>
      apiFetch<void>(`/Projects/${id}${path}`, {
        method: "PUT",
        body: JSON.stringify(body),
      }),
    meta: { successMessage: "Saved" },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
    },
  });
}

export function useUpdateProjectName(id: string) {
  return useProjectFieldPut<ChangeProjectNameRequest>(id, "/name");
}

export function useUpdateProjectDescription(id: string) {
  return useProjectFieldPut<UpdateProjectDescriptionRequest>(id, "/description");
}

export function useUpdateProjectState(id: string) {
  return useProjectFieldPut<ChangeProjectStateRequest>(id, "/state");
}

export function useUpdateProjectThumb(id: string) {
  return useProjectFieldPut<ChangeProjectThumbRequest>(id, "/thumb");
}

export function useUpdateProjectGallery(id: string) {
  return useProjectFieldPut<UpdateProjectGalleryRequest>(id, "/gallery");
}

export function useUpdateProjectGitHubUrl(id: string) {
  return useProjectFieldPut<ChangeProjectGitHubUrlRequest>(id, "/github-url");
}

export function useUpdateProjectLiveUrl(id: string) {
  return useProjectFieldPut<ChangeProjectLiveUrlRequest>(id, "/live-url");
}

export function useUpdateProjectStack(id: string) {
  return useProjectFieldPut<UpdateProjectStackRequest>(id, "/stack");
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<void>(`/Projects/${id}`, { method: "DELETE" }),
    meta: { successMessage: "Project deleted" },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
    },
  });
}
