import { Fragment, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, Trash2 } from "lucide-react";
import { useMessages, useDeleteMessage } from "../../features/inbox";
import { ConfirmDialog } from "../../shared/components/ConfirmDialog";
import {
  useLongPressReveal,
  LONG_PRESS_ROW_ATTR,
} from "../../shared/hooks/useLongPressReveal";

export function InboxPage() {
  const navigate = useNavigate();
  const { data: messages, isLoading, isError } = useMessages();
  const deleteMessage = useDeleteMessage();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { revealedId, onTouchStart, onTouchEnd, consumeLongPress } = useLongPressReveal();

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
        <div>
          {sorted.map((message, index) => (
            <Fragment key={message.id}>
              {index > 0 && <div className="mx-auto h-px w-4/5 bg-border-default" />}
              <div
                {...{ [LONG_PRESS_ROW_ATTR]: message.id }}
                onClick={() => {
                  if (consumeLongPress()) return;
                  navigate(`/admin/inbox/${message.id}`);
                }}
                onTouchStart={() => onTouchStart(message.id)}
                onTouchEnd={onTouchEnd}
                onTouchMove={onTouchEnd}
                className="group grid cursor-pointer grid-cols-[1fr_auto_1fr] items-center gap-3 rounded-lg px-3 py-3 transition-colors duration-300 select-none hover:bg-bg-surface/80"
              >
                <div />
                <div className="flex min-w-0 items-center justify-center gap-2">
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
                <div
                  className={`flex shrink-0 justify-end gap-1 transition-opacity duration-300 group-hover:opacity-100 ${
                    revealedId === message.id ? "opacity-100" : "opacity-0"
                  }`}
                >
                  <button
                    type="button"
                    aria-label="Read"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/admin/inbox/${message.id}`);
                    }}
                    className={`rounded-lg p-2 transition-colors duration-300 ${
                      revealedId === message.id
                        ? "text-accent"
                        : "text-text-secondary hover:text-accent"
                    }`}
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
                    className={`rounded-lg p-2 transition-colors duration-300 ${
                      revealedId === message.id
                        ? "text-danger"
                        : "text-text-secondary hover:text-danger"
                    }`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </Fragment>
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
