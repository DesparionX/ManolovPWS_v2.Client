let accessToken: string | null = null;
let expiresAtUtc: string | null = null;

type Listener = () => void;
let listeners: Listener[] = [];

function emit() {
  listeners.forEach((l) => l());
}

export const authStore = {
  getToken: () => accessToken,
  getExpiresAtUtc: () => expiresAtUtc,
  setToken: (token: string, expiry: string) => {
    accessToken = token;
    expiresAtUtc = expiry;
    emit();
  },
  clear: () => {
    accessToken = null;
    expiresAtUtc = null;
    emit();
  },
  isAuthenticated: () => accessToken !== null,
  subscribe: (listener: Listener) => {
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  },
};
