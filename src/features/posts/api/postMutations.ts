import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "../../../shared/api/httpClient";
import { queryKeys } from "../../../shared/api/queryKeys";
import type {
  NewPostRequest,
  PostReadModel,
  UpdatePostTitleRequest,
  UpdatePostContextRequest,
  UpdatePostThumbRequest,
  UpdatePostGalleryRequest,
} from "../types/postTypes";

export function useCreatePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: NewPostRequest) =>
      apiFetch<PostReadModel>("/Posts", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    meta: { successMessage: "Post created" },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
    },
  });
}

function usePostFieldPut<TRequest>(id: string, path: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: TRequest) =>
      apiFetch<void>(`/Posts/${id}${path}`, {
        method: "PUT",
        body: JSON.stringify(body),
      }),
    meta: { successMessage: "Saved" },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
    },
  });
}

export function useUpdatePostTitle(id: string) {
  return usePostFieldPut<UpdatePostTitleRequest>(id, "/title");
}

export function useUpdatePostContext(id: string) {
  return usePostFieldPut<UpdatePostContextRequest>(id, "/context");
}

export function useUpdatePostThumb(id: string) {
  return usePostFieldPut<UpdatePostThumbRequest>(id, "/thumb");
}

export function useUpdatePostGallery(id: string) {
  return usePostFieldPut<UpdatePostGalleryRequest>(id, "/gallery");
}

export function useTogglePostPin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<void>(`/Posts/${id}/pin`, { method: "PUT" }),
    meta: { successMessage: "Saved" },
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.detail(id) });
    },
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<void>(`/Posts/${id}`, { method: "DELETE" }),
    meta: { successMessage: "Post deleted" },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
    },
  });
}
