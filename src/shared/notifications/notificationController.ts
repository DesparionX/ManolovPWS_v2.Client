export type NotificationState = {
  error: string | null;
  toast: string | null;
};

type Listener = (state: NotificationState) => void;

let listeners: Listener[] = [];
let state: NotificationState = { error: null, toast: null };

function emit() {
  listeners.forEach((l) => l(state));
}

export const notificationController = {
  showError(message: string) {
    state = { ...state, error: message };
    emit();
  },
  dismissError() {
    state = { ...state, error: null };
    emit();
  },
  showSuccess(message: string) {
    state = { ...state, toast: message };
    emit();
  },
  dismissToast() {
    state = { ...state, toast: null };
    emit();
  },
  subscribe(listener: Listener) {
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  },
  getState() {
    return state;
  },
};
