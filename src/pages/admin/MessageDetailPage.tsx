import { useEffect, useRef, useState, type ReactNode } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Trash2, Globe, Monitor, type LucideIcon } from "lucide-react";
import { useReadMessage, useDeleteMessage } from "../../features/inbox";
import { Button } from "../../shared/components/Button";
import { ConfirmDialog } from "../../shared/components/ConfirmDialog";

const LEGEND_CLASS =
  "pointer-events-none absolute top-0 left-[10%] -translate-y-1/2 text-lg font-semibold text-[color-mix(in_srgb,var(--color-accent)_80%,black)] [text-shadow:0_0_1px_rgba(0,0,0,1),0_0_2px_rgba(0,0,0,1),0_0_3px_rgba(0,0,0,1),0_0_4px_rgba(0,0,0,1),0_0_6px_rgba(0,0,0,0.95),0_0_9px_rgba(0,0,0,0.85)]";

// Same field-group box as Profile's "Name"/"Address" (THEME.md's Field-group
// legends section) — one field per box. `className` controls each field's
// own width/height, since Title/Name/Email are short single-line values
// that don't need this page's full max-w-xl.
function DetailField({
  label,
  className = "",
  valueClassName = "",
  children,
}: {
  label: string;
  className?: string;
  valueClassName?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={`relative mx-auto w-full rounded-xl border border-border-default px-4 pt-5 pb-5 text-center ${className}`}
    >
      <span className={LEGEND_CLASS}>{label}</span>
      {/* wrap-break-word since every field here comes straight from the
          public contact form (untrusted, arbitrary text) — a long unbroken
          token (a pasted URL with no spaces, say) would otherwise overflow
          the box's own max-width and, with nothing upstream clipping it,
          break the page horizontally the same way the Device tooltip did. */}
      <div className={`wrap-break-word text-text-primary ${valueClassName}`}>{children}</div>
    </div>
  );
}

// IP/Device aren't needed at a glance — a small icon that reveals the value
// in a tooltip instead of its own always-visible box. Desktop: hover, same
// as before. Mobile has no hover, so tapping the icon toggles the same
// tooltip open/closed instead (`open` state, combined with the existing
// `group-hover` so desktop's hover behavior is untouched). Tapping anywhere
// else closes it again, same click-away convention as the admin list rows'
// long-press reveal (see useLongPressReveal.ts).
function IconMeta({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(e: PointerEvent) {
      if (!buttonRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={() => setOpen((o) => !o)}
      aria-label={label}
      aria-pressed={open}
      className="group relative flex items-center justify-center rounded-full border border-border-default p-3 text-text-secondary transition-colors duration-300 hover:text-accent"
    >
      <Icon className="h-5 w-5" />
      {/* No whitespace-nowrap — the Device tooltip's value is a full user-agent
          string, which forced onto one line pushed way past both edges of the
          viewport and unlocked page-wide horizontal scroll. w-max + max-w lets
          short values (like the IP) still hug their own content while long
          ones wrap normally within a sane width instead. */}
      <span
        className={`pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 w-max max-w-[min(80vw,18rem)] -translate-x-1/2 rounded-lg border border-border-default bg-bg-surface/95 px-3 py-1.5 text-xs wrap-break-word text-text-primary shadow-xl backdrop-blur-md transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        }`}
      >
        {label}: {value}
      </span>
    </button>
  );
}

// Reading a message IS what marks it as read server-side — see
// features/inbox/api/useReadMessage.ts. It's a plain query keyed by id,
// so it fetches automatically on mount; no manual firing needed here.
export function MessageDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: message, isLoading, isError } = useReadMessage(id);
  const deleteMessage = useDeleteMessage();
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  if (!id || isError) {
    return <p className="text-danger">Message not found.</p>;
  }
  if (isLoading || !message) {
    return <p className="text-text-secondary">Loading message...</p>;
  }

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-6">
      <div className="flex flex-col items-center gap-5">
        <div className="flex gap-4">
          <IconMeta icon={Globe} label="IP" value={message.senderMetadata.ipAddress} />
          <IconMeta
            icon={Monitor}
            label="Device"
            value={message.senderMetadata.userAgent}
          />
        </div>

        <DetailField
          label="Title"
          className="max-w-sm"
          valueClassName="flex min-h-5 items-center justify-center"
        >
          {message.title}
        </DetailField>
        <DetailField
          label="Name"
          className="max-w-xs"
          valueClassName="flex min-h-5 items-center justify-center font-semibold"
        >
          {message.senderName}
        </DetailField>
        <DetailField
          label="Email"
          className="max-w-xs"
          valueClassName="flex min-h-5 items-center justify-center font-normal"
        >
          {message.senderEmail}
        </DetailField>

        <DetailField
          label="Message"
          className="max-w-lg"
          valueClassName="flex min-h-24 items-start justify-center"
        >
          <span className="whitespace-pre-wrap">{message.context}</span>
        </DetailField>
      </div>

      <Button
        type="button"
        onClick={() => setConfirmDeleteOpen(true)}
        className="mx-auto flex items-center gap-2 rounded-lg bg-danger px-6 py-2 font-medium text-text-primary transition-colors duration-300 hover:bg-danger/80"
      >
        <Trash2 className="h-4 w-4" /> Delete Message
      </Button>

      <ConfirmDialog
        open={confirmDeleteOpen}
        title="Delete this message?"
        description="This can't be undone."
        isLoading={deleteMessage.isPending}
        onConfirm={() => {
          deleteMessage.mutate(message.id, {
            onSuccess: () => navigate("/admin/inbox", { replace: true }),
          });
          setConfirmDeleteOpen(false);
        }}
        onCancel={() => setConfirmDeleteOpen(false)}
      />
    </div>
  );
}
