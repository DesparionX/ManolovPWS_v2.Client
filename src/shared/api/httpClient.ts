export class ApiError extends Error {
  status: number;
  errors: { code: string; message: string }[];

  constructor(status: number, errors: { code: string; message: string }[]) {
    super(errors[0]?.message ?? "Something went wrong");
    this.status = status;
    this.errors = errors;
  }
}

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const CREDENTIALED_PATHS = [
  "/Auth/sign-in",
  "/Auth/refresh-token",
  "/Auth/sign-out",
];

let accessToken: string | null = null;

export function getAccessToken() {
  return accessToken;
}

export function setAccessToken(token: string | null) {
  accessToken = token;
}

let refreshPromise: Promise<boolean> | null = null;

async function refreshAccessToken(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const response = await fetch(`${BASE_URL}/Auth/refresh-token`, {
          method: "POST",
          credentials: "include",
        });
        if (!response.ok) {
          setAccessToken(null);
          return false;
        }
        const data = await response.json();
        setAccessToken(data.token);
        return true;
      } catch {
        setAccessToken(null);
        return false;
      } finally {
        refreshPromise = null;
      }
    })();
  }
  return refreshPromise;
}

function redirectHome() {
  window.location.href = "/";
}

async function parseErrors(
  response: Response,
): Promise<{ code: string; message: string }[]> {
  try {
    const body = await response.json();
    if (Array.isArray(body)) return body;
  } catch {
    // response body wasn't JSON — fall through to the generic error below
  }
  return [{ code: "unknown_error", message: "Something went wrong" }];
}

export async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
  isRetry = false,
): Promise<T> {
  const isCredentialed = CREDENTIALED_PATHS.some((p) => path.startsWith(p));
  const isRefreshCall = path.startsWith("/Auth/refresh-token");

  const headers = new Headers(init.headers);
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers,
    credentials: isCredentialed ? "include" : init.credentials,
  });

  if (response.status === 401 && !isRetry && !isRefreshCall) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      return apiFetch<T>(path, init, true);
    }
    redirectHome();
    throw new ApiError(401, [
      { code: "session_expired", message: "Your session has ended." },
    ]);
  }

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      redirectHome();
    }
    throw new ApiError(response.status, await parseErrors(response));
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}
