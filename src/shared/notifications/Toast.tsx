import { useEffect, useSyncExternalStore } from "react";
import { notificationController } from "./notificationController";

const AUTO_DISMISS_MS = 3500;

export function Toast() {
  const state = useSyncExternalStore(
    notificationController.subscribe,
    notificationController.getState,
  );

  useEffect(() => {
    if (!state.toast) return;
    const timer = setTimeout(() => {
      notificationController.dismissToast();
    }, AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [state.toast]);

  if (!state.toast) return null;

  return (
    <div
      role="status"
      className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-xl border border-border-default bg-bg-surface/80 px-4 py-3 text-sm text-text-primary shadow-xl backdrop-blur-md"
    >
      {state.toast}
    </div>
  );
}
