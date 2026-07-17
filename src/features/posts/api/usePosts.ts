import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../../../shared/api/httpClient";
import { queryKeys } from "../../../shared/api/queryKeys";
import type { PostReadModel } from "../types/postTypes";

function getPosts() {
  return apiFetch<PostReadModel[]>("/Posts");
}

export function usePosts() {
  return useQuery({
    queryKey: queryKeys.posts.all,
    queryFn: getPosts,
  });
}
