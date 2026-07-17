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
      className="fixed right-4 bottom-4 z-50 rounded-xl border border-success/40 bg-bg-surface/90 px-6 py-4 text-base text-success shadow-xl backdrop-blur-md"
    >
      {state.toast}
    </div>
  );
}
