# API Client & Data Fetching Conventions

Shared infrastructure every feature's data layer builds on. Read before writing any `api/` hook or fetch call.

## Location

Per `STRUCTURE.md`'s `shared/` conventions:

```
shared/api/
├── httpClient.ts       # low-level fetch wrapper — auth headers, refresh flow, error normalization
├── queryClient.ts       # TanStack QueryClient instance + global error wiring
└── queryKeys.ts          # centralized query key factory
shared/notifications/
├── notificationController.ts   # imperative show/hide API, usable outside React tree
├── ErrorModal.tsx
└── Toast.tsx
```

## Base URL

Read from a Vite env var: `VITE_API_BASE_URL` (e.g. `.env.local` → `VITE_API_BASE_URL=https://localhost:5001`). Never hardcode the API origin in fetch calls — always build off this.

## `httpClient.ts` — the low-level wrapper

Responsibilities:

- Prefixes every request with `VITE_API_BASE_URL`
- Attaches `Authorization: Bearer {accessToken}` from in-memory auth state (per `AUTH.md`) for protected calls
- Sets `credentials: "include"` specifically for the three auth endpoints that need the refresh cookie (per `AUTH.md`) — not needed on every request
- On a `401`: attempts exactly one silent refresh (per `AUTH.md`'s Refresh Flow), then retries the original request once with the new token. If refresh also fails, treat the session as ended (redirect home, per `AUTH.md`'s Failure/Redirect Behavior) — do not retry a second time (avoid infinite loops)
- **Concurrency note:** if multiple requests 401 at roughly the same time (e.g. several TanStack Query calls in flight), only one refresh call should actually fire — the rest should wait on that same in-flight refresh promise rather than each independently calling refresh. A simple module-level "current refresh promise" variable (created on first 401, cleared when it resolves/rejects) handles this without extra libraries.
- Normalizes every failure into a consistent shape before throwing, regardless of which endpoint failed:
  ```ts
  class ApiError extends Error {
    constructor(
      public status: number,
      public errors: { code: string; message: string }[],
    ) {
      super(errors[0]?.message ?? "Something went wrong");
    }
  }
  ```
  This is what `ErrorDto[]` (per `CLAUDE.md`'s backend contract notes) gets mapped into — callers never deal with raw response shapes directly.

## Global Error & Success Handling

Confirmed pattern: **failures show a modal, successes show a timed toast.** This is wired centrally, not per-component, using TanStack Query's global `QueryCache`/`MutationCache` hooks rather than repeating `onError`/`onSuccess` in every hook:

```ts
// shared/api/queryClient.ts
import { QueryClient, QueryCache, MutationCache } from "@tanstack/react-query";
import { notificationController } from "../notifications/notificationController";
import { ApiError } from "./httpClient";

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      if (error instanceof ApiError)
        notificationController.showError(error.message);
    },
  }),
  mutationCache: new MutationCache({
    onError: (error) => {
      if (error instanceof ApiError)
        notificationController.showError(error.message);
    },
    onSuccess: (_data, _vars, _ctx, mutation) => {
      // Only show a toast if the mutation opted in with a message (see below) —
      // not every mutation needs a visible confirmation (e.g. blur-autosave fields
      // shouldn't spam a toast on every single field edit)
      const message = mutation.meta?.successMessage;
      if (typeof message === "string")
        notificationController.showSuccess(message);
    },
  }),
  defaultOptions: {
    queries: { staleTime: 60_000, retry: 1 },
    mutations: { retry: 0 }, // don't auto-retry writes — some aren't idempotent (e.g. POST /Posts)
  },
});
```

- Per-mutation opt-in for the success toast uses TanStack Query's `meta` field, e.g.:
  ```ts
  useMutation({
    mutationFn: deletePost,
    meta: { successMessage: "Post deleted" },
  });
  ```
  This keeps blur-autosave fields (Profile, Post/Project Editor) silent by default — constant toasts on every blur would be noisy — while deliberate actions (delete, create, pin) can opt in explicitly.

## `notificationController.ts` — imperative show/hide, no new dependency

Since nothing in the current stack handles global UI notifications, and this needs to be callable from _outside_ the React tree (the `QueryCache`/`MutationCache` handlers above aren't components), a small module-level pub-sub is enough — no need for Zustand or another state library:

```ts
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
  subscribe(listener: Listener) {
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  },
};
```

`ErrorModal.tsx` and `Toast.tsx` subscribe to this via `useSyncExternalStore` (or a simple `useEffect` + `useState`), and are mounted once at the app root (`app/App.tsx`, per `STRUCTURE.md`'s SPA shell) — always present, driven entirely by this controller.

- **Toast:** auto-dismisses after a timeout (e.g. 3-4 seconds) — exact duration and visual style TBD alongside `THEME.md`
- **Error modal:** stays until dismissed by the Owner (doesn't auto-close — errors shouldn't be easy to miss)

## Query Key Conventions

Centralized in `shared/api/queryKeys.ts` rather than inline string arrays scattered across features — avoids typos causing silent cache misses:

```ts
export const queryKeys = {
  posts: {
    all: ["posts"] as const,
    detail: (id: string) => ["posts", id] as const,
  },
  projects: {
    all: ["projects"] as const,
    detail: (id: string) => ["projects", id] as const,
  },
  cv: ["cv"] as const,
  account: {
    me: ["account", "me"] as const,
  },
  users: {
    detail: (id: string) => ["users", id] as const,
  },
};
```

Each feature's `api/` folder (per `STRUCTURE.md`) imports from here rather than defining its own keys — keeps invalidation (`queryClient.invalidateQueries`) consistent across the app.

## Mutation Pattern for Blur-Autosave Fields

The per-field `PUT` pattern used throughout `admin/profile.md`, `admin/post-editor.md`, and `admin/project-editor.md` (fire on blur, after validation) is just a `useMutation` called imperatively from an `onBlur` handler — no special TanStack Query feature needed beyond what's already described above. No optimistic updates by default (wait for the real response before reflecting success) — simpler and safer for a single-user app with no real concurrency concerns, revisit only if the UX ever feels sluggish.

## Open Questions / Ask Before Assuming

- Exact toast auto-dismiss duration and visual styling — deferred to `THEME.md`
- None blocking otherwise — individual per-endpoint hooks (`usePosts`, `useCreatePost`, etc.) will be generated directly when we build each feature, following the conventions above rather than being pre-documented per endpoint
