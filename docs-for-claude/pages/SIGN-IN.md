# Sign In Page

Route: `/admin/auth`. **Not** part of the protected `/admin` subtree despite the URL prefix — see Routing Note below. Component lives at `src/pages/SignInPage.tsx` (outside `pages/admin/`), consistent with `STRUCTURE.md`'s rule that everything under `pages/admin/` is protected — this page is the opposite (must be reachable while unauthenticated).

## Purpose

Hidden entry point for the Owner to sign in. Never linked anywhere in the visible UI — reached only via a double-click (desktop) or double-tap (mobile) on the navbar logo. Single-user app, so this is the only account that will ever sign in (per `AUTH.md`'s App Model).

## Routing Note (important)

`admin-layout.md` wraps the entire `/admin` subtree with a route guard that redirects unauthenticated visitors to home. If `/admin/auth` were nested inside that guarded route tree, unauthenticated visitors — exactly who needs to reach this page — would get bounced to home before ever seeing the form, making it unreachable.

**Resolution:** `/admin/auth` must be defined as its own standalone route in the router config, sibling to (not nested inside) the protected `AdminLayout` route object. The route guard is applied to a specific route subtree in code, not derived from matching the URL string — so this is straightforward, just needs to be deliberate rather than accidentally nested.

## Data / API

- `POST /Auth/sign-in` (public) — `{ userNameOrEmail: string, password: string }` → `SignInApiResponse` on success (per `AUTH.md`): `{ accessToken: { token, expiresAtUtc }, user: CompactUserReadModel }`
- On success:
  1. Store `accessToken` in the in-memory auth store (see Auth State Store dependency below)
  2. The refresh-token HttpOnly cookie is set automatically by the backend's `Set-Cookie` header — nothing for the frontend to handle explicitly (per `AUTH.md`)
  3. Navigate to `/admin` — handled by the same reactive effect as the Guest-only guard below (not a separate explicit `navigate()` call in the mutation's `onSuccess`), see Functionality & Interactions for why that unification matters
- **On failure: NOT the global `ApiError` modal.** Confirmed after real-world testing surfaced two problems with that original plan: (1) a modal reads as an "informational" popup, not a validation error, and needs to be dismissed rather than just read; (2) an unrelated bug in `httpClient.ts` (401 from sign-in was being misread as "session expired," triggering a silent-refresh attempt + the redirect-home behavior meant for protected routes — see `AUTH.md`'s Refresh Flow exception) meant the modal was torn out from under the Owner by a page redirect after about a second, before it could even be read. Fixed by: (a) excluding `/Auth/sign-in` from the refresh/redirect flow entirely, and (b) opting this mutation out of the global modal via `meta: { suppressGlobalError: true }` (per `API-CLIENT.md`), rendering the error as plain text in `text-danger` directly above the Sign In button instead. The error stays on this page until the Owner corrects the input and resubmits — no redirect, no auto-dismiss.
- **Error message content:** whatever `ApiError.message` resolves to from the response body — normally the backend's own validation message (e.g. "Invalid username or password"). If the backend returns an unhandled-exception response instead of a proper validation error, `httpClient.ts`'s `parseErrors` now falls back through ASP.NET's `ProblemDetails` `detail`/`title` fields rather than always showing a generic "Something went wrong" — see `API-CLIENT.md`.

## Dependency: Auth State Store (not yet formally documented — defining minimally here)

`AUTH.md` specifies storing the access token "in memory," but no concrete module exists yet for this. Since `shared/api/httpClient.ts` needs to read the current token from plain function code (not a React component) to attach the `Authorization` header, a React Context alone doesn't work here — same reasoning that led to `notificationController`'s module-level pub-sub pattern in `API-CLIENT.md`.

**Proposed minimal shape**, `shared/auth/authStore.ts`:

```ts
let accessToken: string | null = null;
let expiresAtUtc: string | null = null;
type Listener = () => void;
let listeners: Listener[] = [];

export const authStore = {
  getToken: () => accessToken,
  setToken: (token: string, expiry: string) => {
    accessToken = token;
    expiresAtUtc = expiry;
    listeners.forEach((l) => l());
  },
  clear: () => {
    accessToken = null;
    expiresAtUtc = null;
    listeners.forEach((l) => l());
  },
  isAuthenticated: () => accessToken !== null,
  subscribe: (listener: Listener) => {
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  },
};
```

`httpClient.ts` reads `authStore.getToken()` directly; React components (e.g. for conditionally showing the logout icon per `cv.md`, or the admin route guard) subscribe via `useSyncExternalStore`. This should formally move into `AUTH.md` or get its own doc once we implement it — flagged here as a known gap, not fully resolved.

## Functionality & Interactions

- **Guest-only guard, redirects to `/admin` (not home):** a single `useEffect` watching `authStore.isAuthenticated()` (via `useSyncExternalStore`) redirects to `/admin` whenever it's true — don't render the form at all in that case, even briefly. This is the mirror image of the `/admin` guard: that one requires auth, this one requires the _absence_ of it while rendering the form, but redirects to the same place once auth is present.
  - **This same effect is also what sends the Owner to `/admin` right after a successful sign-in** — `onSuccess` only stores the token (`authStore.setToken`); it deliberately does **not** also call `navigate()` itself. Earlier it did, and that caused a real bug: `authStore.setToken` flips `isAuthenticated` to `true`, which independently re-triggered this same guard effect — so two `navigate()` calls raced (`onSuccess`'s explicit one → `/admin`, the guard's reactive one → `/` as it was written then), and whichever ran last won, which in practice bounced the Owner to the home page instead of `/admin`. Unifying both cases into the one effect, targeting `/admin`, means there's only ever one navigation decision — the race is gone because both triggers now agree on the destination.
- **Trigger (lives in the shared Header/Logo component, not this page):** double-click (desktop) or double-tap (mobile) on the navbar logo. **Destination depends on session state:** already authenticated → straight to `/admin` (skips the login form entirely, no flash of it); otherwise → `/admin/auth`. No cursor pointer style change on hover — the logo should look and behave like a static image to a casual visitor, not an interactive element.
  - Desktop: native `onDoubleClick` handler
  - Mobile: no native double-tap event exists in browsers — implement manually by tracking tap timestamps (two `touchend` events within a short window, e.g. 300ms, counts as a double-tap)
- **Form fields:**
  - Username/Email — single text input (backend accepts either), required, **minimum 5 characters**
  - Password — masked by default; an eye icon reveals the value **only while actively pressed/held** (not a toggle): `onMouseDown`/`onTouchStart` switches the input to plain text, `onMouseUp`/`onMouseLeave`/`onTouchEnd`/`onTouchCancel` masks it again. Required, **minimum 9 characters** — no other complexity rules (no forced uppercase/number/symbol)
- **Validation timing:** on submit (button press), not live/on-change while typing — standard react-hook-form + Zod `onSubmit` mode, no extra config needed
- **Submit button:** labeled "Sign In", triggers the sign-in mutation. Shows a spinner in place of the label while the request is pending, per `THEME.md`'s Buttons & Loading State convention

## Design / Visual Notes

- **Confirmed:** the outer Header/Footer chrome (`STRUCTURE.md`'s SPA shell) IS shown on this page — not the "no navbar/footer" option originally floated here. Simple, centered login card in the remaining space between them, styled with `THEME.md`'s tokens.
- Floating label / border styling can reuse the same field conventions established in `admin/profile.md` for visual consistency across the app, even though this page isn't part of the admin panel functionally
- Eye icon: clear visual feedback for the press-and-hold state (e.g. icon swaps between open/closed eye) so it's obvious the reveal is momentary, not a toggle

## Edge Cases

- Double-tap on mobile conflicting with the browser's default double-tap-to-zoom gesture on some elements — may need `touch-action: manipulation` CSS on the logo to suppress that default behavior
- Submitting with empty/too-short fields — client-side Zod validation catches this before any request fires (userNameOrEmail < 5 chars, password < 9 chars), errors shown per-field via `FloatingInput`'s error slot, same as any other field error — no password complexity rules beyond length (this is login, not registration/account creation)
- Failed sign-in (wrong credentials) — inline `text-danger` message above the Sign In button (see Data / API above), NOT the global modal. Page does not redirect on this failure — the Owner stays on `/admin/auth` to correct and resubmit.

## Open Questions / Ask Before Assuming

- The Auth State Store (`shared/auth/authStore.ts`) is defined minimally here out of necessity but hasn't been formally folded into `AUTH.md` or given its own doc — worth doing that cleanup pass once implemented, so it's not just living inside this page's doc
