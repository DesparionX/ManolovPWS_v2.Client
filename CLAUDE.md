# ManolovPWS Client - Agent Instructions

This is the React frontend for ManolovPWS_v2, a portfolio app. Backend is a separate .NET API repo (Clean Architecture, modular monolith).

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
- **Known gap (temporary):** some endpoints (e.g. `GET /Users/{id}`) currently return `200 OK` with no response schema in the spec, because backend actions aren't yet decorated with `[ProducesResponseType]`. This is being fixed incrementally on the backend. Until an endpoint's schema is present, don't assume its shape — ask, or wait for the spec to be regenerated
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

## Project Docs

- Per-page requirements/specs: `docs-for-claude/pages/`
- Auth flow details: `docs-for-claude/AUTH.md`
- API contract: `docs-for-claude/openapi.json`
- Check the relevant doc before starting work on a page or feature; ask if one doesn't exist yet
