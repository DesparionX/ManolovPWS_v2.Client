import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "../../../shared/api/httpClient";
import { queryKeys } from "../../../shared/api/queryKeys";

// Marking a message as read isn't a mutation fired from here — it's a
// side effect of reading it, see api/useReadMessage.ts.
export function useDeleteMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<void>(`/Inbox/messages/${id}`, { method: "DELETE" }),
    meta: { successMessage: "Message deleted" },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inbox.all });
    },
  });
}
