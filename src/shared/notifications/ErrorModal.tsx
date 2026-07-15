import { useSyncExternalStore } from "react";
import { notificationController } from "./notificationController";

export function ErrorModal() {
  const state = useSyncExternalStore(
    notificationController.subscribe,
    notificationController.getState,
  );

  if (!state.error) return null;

  return (
    <div role="alertdialog" aria-modal="true">
      <div>
        <p>{state.error}</p>
        <button type="button" onClick={notificationController.dismissError}>
          Dismiss
        </button>
      </div>
    </div>
  );
}
