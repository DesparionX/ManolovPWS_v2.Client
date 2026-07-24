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
- On a `401` **from a protected request**: attempts exactly one silent refresh (per `AUTH.md`'s Refresh Flow), then retries the original request once with the new token. If refresh also fails, treat the session as ended (redirect home, per `AUTH.md`'s Failure/Redirect Behavior) — do not retry a second time (avoid infinite loops)
- **Exception:** `POST /Auth/sign-in` and `POST /Auth/register` never enter the refresh/redirect flow above, even on 401 — a 401 there means wrong credentials, not an expired session (there's no session yet). `httpClient.ts` special-cases these paths (`SESSION_INDEPENDENT_PATHS`) so their failures just throw a normal `ApiError` for the calling page to handle — see `AUTH.md`'s Refresh Flow exception and `pages/sign-in.md`.
- **Concurrency note:** if multiple requests 401 at roughly the same time (e.g. several TanStack Query calls in flight), only one refresh call should actually fire — the rest should wait on that same in-flight refresh promise rather than each independently calling refresh. A simple module-level "current refresh promise" variable (created on first 401, cleared when it resolves/rejects) handles this without extra libraries.
- Normalizes every failure into a consistent shape before throwing, regardless of which endpoint failed:
  ```ts
  class ApiError extends Error {
    status: number;
    errors: { code: string; message: string }[];
  }
  ```
  This is what `ErrorDto[]` (per `CLAUDE.md`'s backend contract notes) gets mapped into — callers never deal with raw response shapes directly. (Written with explicit field declarations rather than constructor parameter-property shorthand — `tsconfig.app.json`'s `erasableSyntaxOnly` rejects the shorthand since it emits real assignment code, not just erased types.)
- **Error body isn't always the documented `ErrorDto[]` array.** An unhandled backend exception gets serialized by ASP.NET Core as `ProblemDetails` (`title`/`detail` fields, not an array) — if `parseErrors` only checked `Array.isArray`, every unhandled exception surfaced as a useless generic "Something went wrong" instead of the real reason. It now falls back through `detail` → `message` → `title` on a non-array JSON body before giving up and using the generic message.
- **Model-validation failures are a third shape, and the fallback above wasn't enough for them.** ASP.NET Core's *automatic* model-validation ProblemDetails (triggered by `[ApiController]` when a request body fails to bind/validate — wrong field type, missing required field, etc.) always sets `title` to the same generic **"One or more validation errors occurred."**, regardless of what actually failed — the real, field-specific reason lives in a separate `errors: { [field]: string[] }` object that the `detail`/`message`/`title` fallback never looks at. Real-world case that caught this: adding a Skill in the admin Profile editor threw this exact generic message with zero indication of which field was wrong — turned out to be `SkillDto.type`, which `openapi.json` documents as a plain `string` but the frontend was sending as a raw JSON number (`1`/`2`), likely failing JSON→string model binding before validation even ran. `parseErrors` now checks for a non-array `errors` object first and, if present, flattens it into one `{code: field, message}` entry per validation message — surfacing the actual field and reason instead of the useless generic title.
- **Successful responses aren't always JSON either — a real bug this caught.** Many `PUT` endpoints (profile fields, post/project fields, `POST /Posts/{id}/pin`) are documented in `openapi.json` as `200 OK` with no content schema, meaning the response body is empty. `apiFetch` used to call `response.json()` unconditionally on any non-204 success, which throws a `SyntaxError` on an empty body — not an `ApiError`, so it passed through every error handler unrecognized: no error modal (checks `instanceof ApiError`), and critically no success toast either, since the mutation had already rejected before `onSuccess` could ever run. Net effect: the backend saved the change correctly, but the Owner saw zero feedback either way — exactly the "it saves but nothing tells me so" bug reported after wiring up the success toast. Fixed by reading the response as text first and only attempting `JSON.parse` when there's actually content — empty body now resolves to `undefined` instead of throwing, for both `200` and `204`.

## Global Error & Success Handling

Confirmed pattern: **failures show a modal, successes show a timed toast** — with one opt-out (see `suppressGlobalError` below) for forms that need to show the error inline instead. This is wired centrally, not per-component, using TanStack Query's global `QueryCache`/`MutationCache` hooks rather than repeating `onError`/`onSuccess` in every hook:

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
    onError: (error, _vars, _ctx, mutation) => {
      if (mutation.meta?.suppressGlobalError) return;
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
  **Revised after real usage:** originally this was meant to keep blur-autosave fields (Profile, Post/Project Editor) silent, on the assumption that a toast on every blur would feel noisy. In practice, the opposite problem showed up first — saving a field with no confirmation at all just looked broken (no visible sign anything happened). So blur-autosave fields now opt in too, via a shared `successMessage: "Saved"` set once on each feature's field-mutation factory (`useProfilePut` in `features/profile/api/profileMutations.ts`, `usePostFieldPut`/`useTogglePostPin` in `features/posts/api/postMutations.ts`, `useProjectFieldPut` in `features/projects/api/projectMutations.ts`) — every mutation built on top of these picks it up automatically, no per-call opt-in needed. Deliberate actions (create, delete) keep their own specific message (e.g. `"Post deleted"`) instead of the generic one.

- **Opting a mutation out of the global error modal:** `meta: { suppressGlobalError: true }`, e.g.:
  ```ts
  useMutation({
    mutationFn: signIn,
    meta: { suppressGlobalError: true },
  });
  ```
  Added for `useSignIn` (`pages/sign-in.md`): the global modal was actively wrong there — briefly flashing then getting torn down by the (unrelated, now-fixed) redirect-home bug, and even once that's fixed, a modal is the wrong UX for "wrong password," which the Owner needs to read calmly and correct, not dismiss. The mutation's own `error` (from `useMutation`'s return value) is rendered inline on the page instead. Use this sparingly — it's an opt-out from the default, not the norm; most mutations (admin saves/deletes) should keep using the global modal.

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

- **Unchanged-value policy: blurring a field whose value didn't actually change never fires its `PUT`.** Applies to every blur-autosave field across Profile (Main tab), Post Editor, and Project Editor — each blur handler compares the (validated) local value against the corresponding field already on the loaded `profile`/`post`/`project` object, and returns early without calling `mutate` if they're equal. Avoids a pointless round-trip (and a "Saved" toast that's misleading — nothing was actually saved) every time the Owner just clicks into a field and back out without editing it, or retypes the same value.
- **Required-field policy: clearing a required field and blurring reverts it, rather than leaving it empty with an error.** Applies to every blur-autosave field across Profile (Main tab), Post Editor, and Project Editor. If a required field is emptied out and blurred, the handler resets the local value back to the last known-good value (the corresponding field already on the loaded `profile`/`post`/`project` object) instead of calling the `PUT` and instead of leaving the invalid empty value on screen with an error message — there's nothing meaningful to save, and showing an error under a blank field the Owner has to notice and manually undo is worse UX than just snapping it back. This is specific to the **emptied** case — a non-empty but still-invalid value (bad email format, name too short, an out-of-range value) keeps the existing behavior: show the inline error, leave the value in place for the Owner to correct. Optional fields (phone number, Project's Live URL/GitHub URL) are unaffected since an empty value is already valid for them. Not applied to the array-item tabs (Education, Experience, Certificates, Languages, Skills, Contacts) — their `ListEditor`-based add/remove UX doesn't map onto a single "revert to old value" the same way; flag if this should extend there too.
- **A subtlety this uncovered:** for a plain controlled `<input>`/`<textarea>` in a component that supports both create and edit modes (Post/Project editors), the displayed `value` must always come from local component state that's seeded once from the loaded record — never a `isEditing ? serverValue : localState` ternary. The ternary reads great but is actually broken: since the input is controlled, every render re-applies whatever expression backs `value`, and if that expression prefers the server value whenever editing, it overwrites the user's own keystroke on every render, making the field appear frozen (can't type or delete, even though it's not `disabled`). Local state is seeded from the server record exactly once (keyed off the record's `id`, not re-synced on every refetch) via a render-phase state adjustment, then trusted as the single source of truth from then on — the same pattern `ProfileMainTab` already used correctly from the start (which is why Profile's fields never had this bug, only Post/Project's `title`/`name`/`liveUrl`/`gitHubUrl`, added later with the dual-mode ternary). Rich-text fields (Post's `context`, Project's `description`) aren't affected the same way — the `RichTextEditor` wrapper only reads its `initialContent` prop once, at mount, so re-renders don't fight the user's typing; reverting one of these on an empty-and-required blur instead forces a remount (`key` bump) so it re-mounts with the reverted `initialContent`.

## Open Questions / Ask Before Assuming

- Exact toast auto-dismiss duration and visual styling — deferred to `THEME.md`
- None blocking otherwise — individual per-endpoint hooks (`usePosts`, `useCreatePost`, etc.) will be generated directly when we build each feature, following the conventions above rather than being pre-documented per endpoint
