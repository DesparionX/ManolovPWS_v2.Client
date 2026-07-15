import { QueryClient, QueryCache, MutationCache } from "@tanstack/react-query";
import { notificationController } from "../notifications/notificationController";
import { ApiError } from "./httpClient";

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      if (error instanceof ApiError)
        notificationController.showError(error.message);
    },
  }),
  mutationCache: new MutationCache({
    onError: (error) => {
      if (error instanceof ApiError)
        notificationController.showError(error.message);
    },
    onSuccess: (_data, _vars, _ctx, mutation) => {
      const message = mutation.meta?.successMessage;
      if (typeof message === "string")
        notificationController.showSuccess(message);
    },
  }),
  defaultOptions: {
    queries: { staleTime: 60_000, retry: 1 },
    mutations: { retry: 0 },
  },
});
