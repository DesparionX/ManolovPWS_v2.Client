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

// The backend (Railway) sleeps after inactivity and cold-starts on the next
// request — the container can take several seconds to actually start
// accepting connections. During that window a request either hangs (native
// fetch has no timeout of its own; left alone it waits on the OS's own TCP
// timeout, commonly minutes, with no feedback and no recovery) or Railway's
// own edge proxy fails it early with a 502/503/504 before the app is up.
// `fetchWithRetry` below wraps every request in a bounded per-attempt
// timeout plus a couple of retries, so a cold backend self-heals into a
// normal response instead of hanging indefinitely or failing once on a
// timeout guess that just wasn't quite long enough.
//
// Chosen over just raising a single attempt's timeout very high: one long
// wait has no recovery path if that guess is still too short, while a few
// bounded attempts adapt to whatever the actual cold-start duration turns
// out to be. An already-warm backend is unaffected either way — the first
// attempt succeeds immediately, same as before this existed.
//
// Safe to apply to every request, mutations (POST/PUT/DELETE) included, not
// just queries — unlike the "don't auto-retry writes, some aren't
// idempotent" concern behind `mutations: { retry: 0 }` in queryClient.ts,
// these retries only ever fire when the app never received/processed the
// request in the first place (a timeout, a dropped connection, or a
// 502/503/504 from the proxy standing in front of a container that isn't
// listening yet). There's nothing server-side to duplicate. That's a
// fundamentally different, much narrower case than "the app processed the
// write but the response was lost on the way back" — which is the real
// risk non-idempotent retries run, and stays disabled exactly as before.
const REQUEST_TIMEOUT_MS = 15_000;
const MAX_ATTEMPTS = 3;
const RETRY_DELAY_MS = 2_000;

// Statuses a reverse proxy (Railway's edge) returns when it can't yet reach
// the app container — not something the app itself produced. Any other
// status means the app actually responded, so retrying it wouldn't change a
// real 404/422/500 the running app returned on purpose.
const GATEWAY_RETRYABLE_STATUSES = new Set([502, 503, 504]);

function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetry(url: string, init: RequestInit): Promise<Response> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const isLastAttempt = attempt === MAX_ATTEMPTS;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      const response = await fetch(url, { ...init, signal: controller.signal });
      clearTimeout(timeoutId);
      if (GATEWAY_RETRYABLE_STATUSES.has(response.status) && !isLastAttempt) {
        await sleep(RETRY_DELAY_MS);
        continue;
      }
      return response;
    } catch (err) {
      clearTimeout(timeoutId);
      lastError = err;
      if (isLastAttempt) break;
      await sleep(RETRY_DELAY_MS);
    }
  }
  throw lastError;
}

let refreshPromise: Promise<boolean> | null = null;

export async function refreshAccessToken(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const response = await fetchWithRetry(`${BASE_URL}/Auth/refresh-token`, {
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

    // ASP.NET Core's automatic model-validation failure shape is a
    // ProblemDetails whose `title` is always the generic "One or more
    // validation errors occurred." — the actually useful, field-specific
    // reason lives in `errors: { [field]: string[] }`, which the plain
    // detail/message/title fallback below never looks at. Without this,
    // every model-binding/validation failure (wrong field type, missing
    // required field, etc.) surfaced as the same useless generic message
    // no matter what actually went wrong.
    if (
      obj.errors &&
      typeof obj.errors === "object" &&
      !Array.isArray(obj.errors)
    ) {
      const fieldErrors = Object.entries(
        obj.errors as Record<string, unknown>,
      ).flatMap(([field, messages]) =>
        Array.isArray(messages)
          ? messages.map((m) => ({ code: field, message: String(m) }))
          : [],
      );
      if (fieldErrors.length > 0) return fieldErrors;
    }

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

  let response: Response;
  try {
    response = await fetchWithRetry(`${BASE_URL}${path}`, {
      ...init,
      headers,
      credentials: isCredentialed ? "include" : init.credentials,
    });
  } catch {
    // Every attempt timed out or failed at the network level — never got a
    // real response from the server at all (as opposed to the server
    // responding with a real error status, handled below). Thrown as a real
    // ApiError, not the raw AbortError/TypeError fetchWithRetry caught —
    // anything else silently passes through every error handler unrecognized
    // (checks `instanceof ApiError`), the same "saves but nothing tells you"
    // class of bug `parseErrors` above already had to be hardened against.
    throw new ApiError(0, [
      {
        code: "server_unreachable",
        message: "Couldn't reach the server. Please try again in a moment.",
      },
    ]);
  }

  if (GATEWAY_RETRYABLE_STATUSES.has(response.status)) {
    // Still 502/503/504 after every retry — the backend never came up in
    // time. A real Response exists here (unlike the network-failure case
    // above), but its body is Railway's own proxy error page, not our
    // ErrorDto[] shape, so parseErrors' generic fallback wouldn't read as
    // meaningful — a dedicated message instead.
    throw new ApiError(response.status, [
      {
        code: "server_unavailable",
        message: "The server is starting up. Please try again in a moment.",
      },
    ]);
  }

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
