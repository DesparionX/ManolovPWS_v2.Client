import { useMutation } from "@tanstack/react-query";
import { apiFetch } from "../../../shared/api/httpClient";
import { authStore } from "../../../shared/auth/authStore";

function signOut() {
  return apiFetch<void>("/Auth/sign-out", { method: "POST" });
}

export function useSignOut() {
  return useMutation({
    mutationFn: signOut,
    onSettled: () => {
      authStore.clear();
    },
  });
}
