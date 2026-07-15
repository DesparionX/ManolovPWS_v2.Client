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
    <div role="status">
      <p>{state.toast}</p>
    </div>
  );
}
