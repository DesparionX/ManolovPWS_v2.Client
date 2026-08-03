import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../../../shared/api/httpClient";
import { queryKeys } from "../../../shared/api/queryKeys";
import type { MessageReadModel } from "../types/inboxTypes";

// No dedicated GET /Inbox/messages/{id} endpoint exists (see openapi.json) —
// PUT /Inbox/messages/{id} both marks the message as read server-side and
// returns its full current MessageReadModel. Modeled as a query, not a
// mutation fired manually from an effect: the point of this call, from the
// client's perspective, is "read this message" (fetch its data) — that it
// also flips a flag server-side is a backend implementation detail, not
// something that needs its own useEffect/ref-guard wiring just to fetch on
// mount. useQuery already does exactly that, with the usual
// isLoading/isError/data lifecycle, keyed by id like any other detail
// fetch (see usePost.ts for the same shape).
function readMessage(id: string) {
  return apiFetch<MessageReadModel>(`/Inbox/messages/${id}`, { method: "PUT" });
}

export function useReadMessage(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.inbox.detail(id ?? ""),
    queryFn: () => readMessage(id as string),
    enabled: Boolean(id),
  });
}
