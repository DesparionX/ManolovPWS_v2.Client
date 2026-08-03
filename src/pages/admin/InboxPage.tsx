import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, Trash2 } from "lucide-react";
import { useMessages, useDeleteMessage } from "../../features/inbox";
import { ConfirmDialog } from "../../shared/components/ConfirmDialog";

export function InboxPage() {
  const navigate = useNavigate();
  const { data: messages, isLoading, isError } = useMessages();
  const deleteMessage = useDeleteMessage();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  if (isLoading) return <p className="text-text-secondary">Loading messages...</p>;
  if (isError || !messages) {
    return <p className="text-danger">Couldn't load messages. Try refreshing the page.</p>;
  }

  const sorted = [...messages].sort(
    (a, b) => new Date(b.sentDate).getTime() - new Date(a.sentDate).getTime(),
  );

  return (
    <div>
      {sorted.length === 0 ? (
        <p className="text-center text-text-secondary">No messages yet.</p>
      ) : (
        <div className="divide-y divide-border-default">
          {sorted.map((message) => (
            <div
              key={message.id}
              onClick={() => navigate(`/admin/inbox/${message.id}`)}
              className="group flex cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-3 transition-colors duration-300 hover:bg-bg-surface/80"
            >
              <div className="flex min-w-0 items-center gap-2">
                {message.isUnread && (
                  <span
                    className="h-2 w-2 shrink-0 rounded-full bg-accent"
                    aria-label="Unread"
                  />
                )}
                <p
                  className={`truncate ${
                    message.isUnread
                      ? "font-semibold text-text-primary"
                      : "text-text-primary"
                  }`}
                >
                  {message.title}{" "}
                  <span className="text-text-secondary">— {message.senderName}</span>
                </p>
              </div>
              <div className="flex shrink-0 gap-1 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <button
                  type="button"
                  aria-label="Read"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/admin/inbox/${message.id}`);
                  }}
                  className="rounded-lg p-2 text-text-secondary transition-colors duration-300 hover:text-accent"
                >
                  <Eye className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  aria-label="Delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteId(message.id);
                  }}
                  className="rounded-lg p-2 text-text-secondary transition-colors duration-300 hover:text-danger"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={deleteId !== null}
        title="Delete this message?"
        description="This can't be undone."
        isLoading={deleteMessage.isPending}
        onConfirm={() => {
          if (deleteId) deleteMessage.mutate(deleteId);
          setDeleteId(null);
        }}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
