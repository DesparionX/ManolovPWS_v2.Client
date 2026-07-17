import { authStore } from "../auth/authStore";
import { router } from "../../app/router";

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

// Endpoints where a 401 is an expected, meaningful response of that specific
// call (e.g. wrong sign-in credentials) — not a signal that an existing
// session/token has expired. Must never trigger the silent-refresh or
// redirect-home flow below, which is only meaningful for protected calls.
const SESSION_INDEPENDENT_PATHS = ["/Auth/sign-in", "/Auth/register"];

let refreshPromise: Promise<boolean> | null = null;

export async function refreshAccessToken(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const response = await fetch(`${BASE_URL}/Auth/refresh-token`, {
          method: "POST",
          credentials: "include",
        });
        if (!response.ok) {
          authStore.clear();
          return false;
        }
        const data = await response.json();
        authStore.setToken(data.accessToken.token, data.accessToken.expiresAtUtc);
        return true;
      } catch {
        authStore.clear();
        return false;
      } finally {
        refreshPromise = null;
      }
    })();
  }
  return refreshPromise;
}

function redirectHome() {
  // A hard reload (window.location.href) tears down the whole React tree —
  // including the ErrorModal that's about to show the "session ended"
  // message — before the Owner has any chance to read it. Navigating through
  // the router instead only swaps the routed <Outlet/> content; ErrorModal
  // and Toast are mounted at the App root outside of it, so they survive the
  // navigation and stay visible until dismissed.
  router.navigate("/");
}

async function parseErrors(
  response: Response,
): Promise<{ code: string; message: string }[]> {
  let body: unknown;
  try {
    body = await response.json();
  } catch {
    return [{ code: "unknown_error", message: "Something went wrong" }];
  }

  if (Array.isArray(body)) {
    return body as { code: string; message: string }[];
  }

  // Not the documented ErrorDto[] shape — most likely an unhandled backend
  // exception, which ASP.NET Core serializes as ProblemDetails (`title`,
  // `detail`) rather than our normal error array. Surface whatever readable
  // message it gives instead of silently discarding it.
  if (body && typeof body === "object") {
    const obj = body as Record<string, unknown>;
    const message =
      (typeof obj.detail === "string" && obj.detail) ||
      (typeof obj.message === "string" && obj.message) ||
      (typeof obj.title === "string" && obj.title);
    if (message) {
      return [{ code: "error", message }];
    }
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
  const isSessionIndependent = SESSION_INDEPENDENT_PATHS.some((p) =>
    path.startsWith(p),
  );

  const headers = new Headers(init.headers);
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const accessToken = authStore.getToken();
  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers,
    credentials: isCredentialed ? "include" : init.credentials,
  });

  if (
    response.status === 401 &&
    !isRetry &&
    !isRefreshCall &&
    !isSessionIndependent
  ) {
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
    if (
      (response.status === 401 || response.status === 403) &&
      !isSessionIndependent
    ) {
      redirectHome();
    }
    throw new ApiError(response.status, await parseErrors(response));
  }

  // Don't assume every successful response has a JSON body to parse — several
  // PUT endpoints (e.g. /Account/profession) document only "200 OK" with no
  // content schema, meaning the actual body is empty. Blindly calling
  // response.json() on an empty body throws (SyntaxError, not ApiError), which
  // silently failed the mutation client-side even though the backend had
  // already saved the change — no success toast, no error modal either, since
  // the thrown error wasn't an ApiError instance. Read as text first and only
  // parse if there's actually something there.
  const text = await response.text();
  if (!text) {
    return undefined as T;
  }
  return JSON.parse(text) as T;
}
