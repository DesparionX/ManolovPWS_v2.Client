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
  3. Navigate to `/admin`
- On failure: surfaced via the existing global `ApiError` modal (per `API-CLIENT.md`) — no bespoke inline error UI needed, this reuses infrastructure that already exists

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

- **Guest-only guard:** if `authStore.isAuthenticated()` is already true on mount, redirect immediately to home — don't render the form at all, even briefly. This is the mirror image of the `/admin` guard: that one requires auth, this one requires the _absence_ of it.
- **Trigger (lives in the shared Header/Logo component, not this page):** double-click (desktop) or double-tap (mobile) on the navbar logo navigates to `/admin/auth`. No cursor pointer style change on hover — the logo should look and behave like a static image to a casual visitor, not an interactive element.
  - Desktop: native `onDoubleClick` handler
  - Mobile: no native double-tap event exists in browsers — implement manually by tracking tap timestamps (two `touchend` events within a short window, e.g. 300ms, counts as a double-tap)
- **Form fields:**
  - Username/Email — single text input (backend accepts either), required
  - Password — masked by default; an eye icon reveals the value **only while actively pressed/held** (not a toggle): `onMouseDown`/`onTouchStart` switches the input to plain text, `onMouseUp`/`onMouseLeave`/`onTouchEnd`/`onTouchCancel` masks it again
- **Submit button:** labeled "Sign In", triggers the sign-in mutation

## Design / Visual Notes

- Simple, centered login card — no navbar/footer clutter competing for attention (or minimal chrome), styled with `THEME.md`'s tokens once finalized
- Floating label / border styling can reuse the same field conventions established in `admin/profile.md` for visual consistency across the app, even though this page isn't part of the admin panel functionally
- Eye icon: clear visual feedback for the press-and-hold state (e.g. icon swaps between open/closed eye) so it's obvious the reveal is momentary, not a toggle

## Edge Cases

- Double-tap on mobile conflicting with the browser's default double-tap-to-zoom gesture on some elements — may need `touch-action: manipulation` CSS on the logo to suppress that default behavior
- Submitting with empty fields — basic required-field validation, no need for password complexity rules here (this is login, not registration/account creation)
- Failed sign-in (wrong credentials) — relies entirely on the existing global error modal; no special-casing needed beyond what `API-CLIENT.md` already provides

## Open Questions / Ask Before Assuming

- The Auth State Store (`shared/auth/authStore.ts`) is defined minimally here out of necessity but hasn't been formally folded into `AUTH.md` or given its own doc — worth doing that cleanup pass once implemented, so it's not just living inside this page's doc
