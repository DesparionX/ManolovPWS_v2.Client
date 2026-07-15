import { useSyncExternalStore } from "react";
import { notificationController } from "./notificationController";

export function ErrorModal() {
  const state = useSyncExternalStore(
    notificationController.subscribe,
    notificationController.getState,
  );

  if (!state.error) return null;

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-bg-base/60 px-4 backdrop-blur-sm"
    >
      <div className="w-full max-w-sm rounded-xl border-2 border-accent bg-bg-surface/80 p-6 text-center shadow-xl backdrop-blur-md">
        <p className="text-text-primary">{state.error}</p>
        <button
          type="button"
          onClick={notificationController.dismissError}
          className="mt-4 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-bg-base transition-colors hover:bg-accent/90"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
