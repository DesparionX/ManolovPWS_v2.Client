# Auth Rules

Conventions for authentication/authorization on the frontend. Read this before touching login, protected routes, token handling, or API calls that require auth.

## App Model: Single-User (Owner-Only)

- This app has exactly one registered user — the Owner (Manolov). Registration of additional users is blocked backend-side.
- There is no general "sign up" flow to build — `POST /Auth/register` exists but isn't a public-facing feature
- The login page is intentionally not linked anywhere in the public UI — it's reached via a secret/obscure route only the Owner knows
- Because of this: **never redirect to the login page automatically** on auth failure (see Failure / Redirect Behavior below) — doing so would expose its existence to public visitors
- Role/permission checks still matter for gating Owner-only UI (e.g. admin controls), but there's no concept of "different users see different things" beyond public-vs-Owner

## Token Handling

- Access token is returned in the sign-in response body — never in a cookie
- Refresh token is stored in an HttpOnly cookie, set by the backend
- Never read, store, or touch the refresh token in JavaScript — it should be invisible to frontend code entirely
- Store the access token in memory first (e.g. React context / TanStack Query cache) — not localStorage or sessionStorage
- On page reload, memory is cleared — use the refresh-token flow (cookie-based) to silently re-establish an access token rather than persisting it client-side
- Confirmed shape (`POST /Auth/sign-in` response, `SignInApiResponse`):
  ```ts
  {
    accessToken: {
      token: string;
      expiresAtUtc: string;
    } // ISO date-time
    user: {
      id: string; // uuid
      userName: string;
      email: string;
      firstName: string;
      middleName: string | null;
      lastName: string;
      profilePictureUrl: string | null;
    }
  }
  ```
- Use `accessToken.expiresAtUtc` to proactively trigger a silent refresh before expiry (rather than waiting for a 401), if/when we want smoother UX than reactive-only refresh

## Requests

- Use `credentials: "include"` for: sign-in, refresh-token, and sign-out requests (so the HttpOnly cookie is sent/received)
- Send the access token as a `Bearer` token in the `Authorization` header for all protected requests
- Centralize this logic (e.g. an API client wrapper or TanStack Query default fetcher) — don't repeat auth header logic per-request
- `POST /Auth/refresh-token` response contains a new `AccessToken`:
  ```ts
  {
    token: string;
    expiresAtUtc: string;
  } // ISO date-time — same shape as sign-in's accessToken
  ```
  Replace the in-memory access token with this on every successful refresh

## Refresh Flow

- On 401 from a protected request, attempt a silent refresh (call refresh-token endpoint) before failing the request
- On refresh failure, treat the session as ended — do NOT redirect to sign-in (see Failure / Redirect Behavior below)
- Avoid infinite refresh loops — a failed refresh should not retry itself

## Failure / Redirect Behavior

- On `401` or `403` (including a failed silent refresh): redirect to the **home page**, never to the login page
- Do not surface "you need to log in" messaging on public-facing routes — since there's only ever one legitimate user (the Owner) and the login route is deliberately secret, exposing its existence defeats the point
- The Owner reaches login only via the secret route they already know — the app should never link to it, hint at it, or auto-redirect to it

## Protected Routes

- Gate protected routes based on presence of a valid access token in memory/context
- On app load, attempt a silent refresh before deciding whether to show protected or public routes (avoids flashing a login screen for an already-authenticated user)

## Roles / Claims

- The frontend does **not** decode or read roles/claims from the JWT. Since this is a single-user app, the backend handles all permission checks — the token is opaque to the frontend beyond storing it and attaching it as a Bearer header
- Don't add JWT decoding logic (e.g. `jwt-decode`) or role/permission-based conditional rendering based on token contents — if a UI element needs to be gated, gate it on "is there a valid access token" (i.e. is the Owner signed in), not on decoded role names
- If a request the Owner isn't allowed to make comes back `401`/`403`, that's the backend's permission system working correctly — handle it via the generic error/redirect flow (see Failure / Redirect Behavior), not by trying to pre-empt it with client-side role checks

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
  - Called by the Owner (authenticated) → returns the user's **private** profile (`PrivateUserReadModel`)
  - Called by anyone else (including anonymous) → returns the user's **public** profile (`PublicUserReadModel`)
  - Implication for frontend: do not gate this route behind auth. Always attach the access token if one exists in memory (so the Owner gets the private view), but the request must still succeed without one. The response shape itself, not the request, determines which view is shown — check response fields to decide which UI to render.
  - **Known spec limitation:** `[ProducesResponseType<T>]` only supports one type per status code, so `openapi.json` documents this endpoint as returning `PrivateUserReadModel` only. This file is the actual source of truth for this endpoint's dual behavior — don't assume from the spec.
  - Confirmed `PublicUserReadModel` shape:
    ```ts
    interface PublicUserReadModel {
      id: string; // uuid
      userName: string;
      email: string;
      firstName: string;
      middleName: string | null;
      lastName: string;
      country: string | null;
      city: string | null;
      summary: string | null;
      profession: string | null;
      profilePictureUrl: string | null;
      birthDate: string; // date-only, e.g. "1998-04-12"
      gender: string;
      contacts: ContactDto[];
      skills: SkillDto[];
      languages: LanguageDto[];
      experience: JobDto[];
      educationHistory: EducationDto[];
      certificates: CertificateDto[];
    }
    ```
    Note: `ContactDto`, `SkillDto`, `LanguageDto`, `JobDto`, `EducationDto`, `CertificateDto` shapes not yet confirmed — check `openapi.json` schemas or ask before typing these

## Open Questions / Ask Before Assuming

- None currently outstanding for auth. (`ContactDto`, `SkillDto`, `LanguageDto`, `JobDto`, `EducationDto`, `CertificateDto` exist in `openapi.json` already — just not yet typed into the frontend; pull from the spec when we build the Users/CV feature)
