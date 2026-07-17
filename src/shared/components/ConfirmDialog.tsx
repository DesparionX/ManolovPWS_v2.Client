import { Button } from "./Button";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Delete",
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-bg-base/60 px-4 backdrop-blur-sm"
    >
      <div className="w-full max-w-sm rounded-xl border border-border-default bg-bg-surface/90 p-6 text-center shadow-xl backdrop-blur-md">
        <p className="text-lg font-semibold text-text-primary">{title}</p>
        {description && (
          <p className="mt-2 text-sm text-text-secondary">{description}</p>
        )}
        <div className="mt-6 flex justify-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-border-default px-4 py-2 text-sm text-text-primary transition-colors duration-300 hover:border-accent"
          >
            Cancel
          </button>
          <Button
            type="button"
            isLoading={isLoading}
            onClick={onConfirm}
            className="rounded-lg bg-danger px-4 py-2 text-sm font-medium text-text-primary transition-colors duration-300 hover:bg-danger/90"
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
