import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../../../shared/api/httpClient";
import { queryKeys } from "../../../shared/api/queryKeys";
import type { PostReadModel } from "../types/postTypes";

function getPost(id: string) {
  return apiFetch<PostReadModel>(`/Posts/${id}`);
}

export function usePost(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.posts.detail(id ?? ""),
    queryFn: () => getPost(id as string),
    enabled: Boolean(id),
  });
}
