import { QueryClient, QueryCache, MutationCache } from "@tanstack/react-query";
import { notificationController } from "../notifications/notificationController";
import { ApiError } from "./httpClient";
import { queryKeys } from "./queryKeys";

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      if (error instanceof ApiError)
        notificationController.showError(error.message);
    },
    // TanStack Query v5 dropped per-query onSuccess — this is the
    // replacement for the one case that needs it: reading a message's
    // detail (features/inbox/api/useReadMessage.ts) marks it as read
    // server-side as a side effect, so the shared inbox list/badge query
    // needs invalidating whenever that specific query succeeds, to keep
    // the Inbox list and both unread badges (AdminLayout nav, Header) in
    // sync without each needing their own wiring. `queryClient` is
    // referenced here before its own declaration finishes below, but that's
    // fine — this callback only actually runs later, once some query has
    // settled, by which point the assignment below has long completed.
    onSuccess: (_data, query) => {
      if (query.queryKey[0] === "inbox" && query.queryKey[1] === "message") {
        queryClient.invalidateQueries({ queryKey: queryKeys.inbox.all });
      }
    },
  }),
  mutationCache: new MutationCache({
    onError: (error, _variables, _context, mutation) => {
      if (mutation.meta?.suppressGlobalError) return;
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
