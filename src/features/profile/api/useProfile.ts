import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../../../shared/api/httpClient";
import { queryKeys } from "../../../shared/api/queryKeys";
import type { PrivateUserReadModel } from "../types/profileTypes";

function getProfile() {
  return apiFetch<PrivateUserReadModel>("/Account/me");
}

export function useProfile() {
  return useQuery({
    queryKey: queryKeys.account.me,
    queryFn: getProfile,
  });
}
