import { useMutation } from "@tanstack/react-query";
import { apiFetch } from "../../../shared/api/httpClient";
import type { SignInRequest, SignInApiResponse } from "../types/authTypes";

function signIn(request: SignInRequest) {
  return apiFetch<SignInApiResponse>("/Auth/sign-in", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export function useSignIn() {
  return useMutation({
    mutationFn: signIn,
    meta: { suppressGlobalError: true },
  });
}
