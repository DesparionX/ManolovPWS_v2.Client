# Auth Rules

Conventions for authentication/authorization on the frontend. Read this before touching login, protected routes, token handling, or API calls that require auth.

## Token Handling

- Access token is returned in the sign-in response body — never in a cookie
- Refresh token is stored in an HttpOnly cookie, set by the backend
- Never read, store, or touch the refresh token in JavaScript — it should be invisible to frontend code entirely
- Store the access token in memory first (e.g. React context / TanStack Query cache) — not localStorage or sessionStorage
- On page reload, memory is cleared — use the refresh-token flow (cookie-based) to silently re-establish an access token rather than persisting it client-side

## Requests

- Use `credentials: "include"` for: sign-in, refresh-token, and sign-out requests (so the HttpOnly cookie is sent/received)
- Send the access token as a `Bearer` token in the `Authorization` header for all protected requests
- Centralize this logic (e.g. an API client wrapper or TanStack Query default fetcher) — don't repeat auth header logic per-request

## Refresh Flow

- On 401 from a protected request, attempt a silent refresh (call refresh-token endpoint) before failing the request
- On refresh failure, treat the user as logged out and redirect to sign-in
- Avoid infinite refresh loops — a failed refresh should not retry itself

## Protected Routes

- Gate protected routes based on presence of a valid access token in memory/context
- On app load, attempt a silent refresh before deciding whether to show protected or public routes (avoids flashing a login screen for an already-authenticated user)

## Roles / Claims

- (To be filled in once backend Identity module's role/claims shape is confirmed via openapi.json)
- Do not hardcode role names — derive from the token/claims payload once shape is known

## ⚠️ OpenAPI Spec Does NOT Reflect Real Auth Requirements

- `openapi.json` has a `security: Bearer` block on every single operation, including public ones like `sign-in` and `GET /Posts`
- This is a Scalar/Swagger UI convenience (lets a JWT be pasted once and reused across manual test calls) — it is NOT a reflection of actual `[Authorize]` usage in the controllers
- Never infer whether an endpoint is protected from the OpenAPI spec's `security` field
- Endpoint auth requirements are confirmed explicitly, endpoint-by-endpoint, in the reference table below — ask if an endpoint isn't listed yet, don't guess from the spec

## Endpoint Auth Reference

Confirmed with the project owner directly (not derived from the spec):

**Public (no auth):**

- `GET /Posts`, `GET /Posts/{id}`
- `GET /Projects`, `GET /Projects/{id}`
- `GET /CV`
- `POST /Auth/register`, `POST /Auth/sign-in`, `POST /Auth/refresh-token`

**Protected (requires valid access token):**

- All `/Account/*` endpoints
- All `/Admin/*` endpoints
- All mutating `Posts`/`Projects` endpoints (`POST`, `PUT`, `DELETE`)
- `POST /Auth/sign-out`
- `GET /Users` — owner-only (returns full user list)

**Conditional / dual-response (special handling required):**

- `GET /Users/{id}` — allows anonymous calls, but response shape depends on caller identity:
  - Called by the Owner (authenticated) → returns the user's **private** profile
  - Called by anyone else (including anonymous) → returns the user's **public** profile
  - Implication for frontend: do not gate this route behind auth. Always attach the access token if one exists in memory (so the Owner gets the private view), but the request must still succeed without one. The response shape itself, not the request, determines which view is shown — check response fields to decide which UI to render.

## Open Questions / Ask Before Assuming

- Exact shape of the refresh-token endpoint response
- Whether roles/claims are in the access token (JWT) or require a separate `/me` call
- Session/token expiry duration, if relevant to UI (e.g. "session expiring soon" warnings)
- Exact shape difference between private vs public `GET /Users/{id}` response (need both schemas to type this correctly)
