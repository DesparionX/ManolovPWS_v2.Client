# ManolovPWS Client - Agent Instructions

This is the React frontend for ManolovPWS_v2, a portfolio app. Backend is a separate .NET API repo (Clean Architecture, modular monolith).

**App model:** single-user (Owner-only). There is exactly one registered account. No public sign-up flow, and the login page is intentionally not linked anywhere public — see `docs-for-claude/AUTH.md` for the resulting auth/redirect conventions this implies.

## Stack

- React
- TypeScript
- Vite
- React Router
- TanStack Query
- React Hook Form
- Zod
- Tailwind CSS
- ESLint
- Prettier

## Backend Contract

- Backend: .NET API (separate repo, not accessible here)
- API contract source of truth for request/response shapes: `docs-for-claude/openapi.json`
- Do not invent endpoints or response shapes
- Ask before changing API assumptions
- If the spec seems outdated or incomplete, ask — don't guess
- **Known limitation:** `GET /Users/{id}` is documented in the spec as returning only `PrivateUserReadModel`, but actually returns either `PrivateUserReadModel` or `PublicUserReadModel` depending on caller identity (the spec can't express this — see `docs-for-claude/AUTH.md` for the real behavior)
- **Auth requirements are NOT taken from the spec.** The `security: Bearer` field in `openapi.json` is a Scalar UI convenience, not a real reflection of `[Authorize]` usage. Endpoint-level auth is set exclusively via what's confirmed in `docs-for-claude/AUTH.md` — see that file's Endpoint Auth Reference before assuming an endpoint is public or protected

## Auth

- Full rules live in `docs-for-claude/AUTH.md` — read it before touching anything auth-related
- Never store or read the refresh token in JavaScript

## Code Rules

- Keep components small, feature-based folder structure
- Keep API logic centralized (not scattered across components)
- Prefer typed request/response models generated or derived from the OpenAPI contract
- Do not add Redux
- Ask before adding large libraries, changing state management approach, or changing routing strategy

## Environment Variables

- All env vars are prefixed `VITE_` (Vite's requirement for client-exposed variables) — see `.env.example` at the repo root for the current full list
- `.env.local` holds real local values, gitignored, never committed. `.env.example` is committed and kept in sync whenever a new variable is introduced — update it alongside any code that adds a new env var.
- **`VITE_`-prefixed variables are bundled into shipped client JS and are visible to anyone via dev tools — this is not a secret store.** Never put a genuine API secret behind a `VITE_` prefix; only values safe to be public (base URLs, unsigned Cloudinary preset names, etc.) belong here.
- On Vercel/Netlify, the same variable names are set via the platform's dashboard (not a committed file) — values differ per environment (e.g. local API URL vs. deployed API URL)

## Project Docs

- Folder structure & naming conventions: `docs-for-claude/STRUCTURE.md` — read before creating any new file/folder
- Visual design system (colors, typography, responsive breakpoints): `docs-for-claude/THEME.md` — read before styling any component
- Image upload subsystem (Cloudinary, no backend file service): `docs-for-claude/FILE-UPLOAD.md` — read before touching any image upload feature (profile picture, post/project thumb/gallery)
- API client, TanStack Query setup, and global error/success notification pattern: `docs-for-claude/API-CLIENT.md` — read before writing any data-fetching code
- Per-page requirements/specs: `docs-for-claude/pages/`
- Auth flow details: `docs-for-claude/AUTH.md`
- API contract: `docs-for-claude/openapi.json`
- Check the relevant doc before starting work on a page or feature; ask if one doesn't exist yet
