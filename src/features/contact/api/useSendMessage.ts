import { useMutation } from "@tanstack/react-query";
import { apiFetch } from "../../../shared/api/httpClient";
import type { NewMessageRequest, MessageReadModel } from "../types/contactTypes";

function sendMessage(request: NewMessageRequest) {
  return apiFetch<MessageReadModel>("/Contact/messages", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export function useSendMessage() {
  return useMutation({
    mutationFn: sendMessage,
  });
}
