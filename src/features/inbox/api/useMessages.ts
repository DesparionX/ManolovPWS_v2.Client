import { useQuery } from "@tanstack/react-query";
import { useSyncExternalStore } from "react";
import { apiFetch } from "../../../shared/api/httpClient";
import { queryKeys } from "../../../shared/api/queryKeys";
import { authStore } from "../../../shared/auth/authStore";
import type { MessageReadModel } from "../types/inboxTypes";

function getMessages() {
  return apiFetch<MessageReadModel[]>("/Inbox/messages");
}

// Single shared query — both the AdminLayout nav badge and the Header's
// sign-out-area badge call this same hook, so they read the exact same
// cache entry and stay trivially in sync instead of each fetching
// independently (see docs-for-claude/pages/admin/INBOX.md). Gated on
// authStore rather than only relying on route-level protection, since the
// Header renders on every page — including signed-out public ones — and
// this is a protected endpoint.
export function useMessages() {
  const isAuthenticated = useSyncExternalStore(
    authStore.subscribe,
    authStore.isAuthenticated,
  );
  return useQuery({
    queryKey: queryKeys.inbox.all,
    queryFn: getMessages,
    enabled: isAuthenticated,
  });
}
