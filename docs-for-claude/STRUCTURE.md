# Project Structure & Naming Conventions

Defines where code lives and how it's named. Read before creating any new file or folder.

## Top-Level Layout

```
src/
├── app/              # App-level wiring: entry point, router, global providers
├── pages/            # Route-level components — one per route, composes features together
├── features/         # Feature-based modules (see below)
├── shared/           # Cross-cutting code used by 2+ features
├── assets/           # Static assets (images, fonts, etc.)
└── index.css         # Tailwind directives only
```

## `app/`

- `main.tsx` — entry point (ReactDOM root, global providers: QueryClientProvider, RouterProvider)
- `App.tsx` — top-level app shell if needed (layout wrapper, not business logic)
- `router.tsx` — route definitions (React Router)
- `providers/` — any additional app-wide context providers, if they grow beyond a couple

## SPA Shell & Layout Architecture

- This is a Single Page Application — one persistent shell, no full page reloads between routes
- `App.tsx` holds the persistent layout: header/nav + footer live here, wrapping a React Router `<Outlet />` where page content swaps
- Only the `<Outlet />` content re-renders on navigation — header/nav/footer should not remount per route (avoids re-fetching/re-animating global chrome unnecessarily)
- Navigation: responsive nav — full nav on `md`+ , collapses to a hamburger/mobile menu below `md` (see `THEME.md` for breakpoint values)
- Mobile-first responsive approach applies to the shell itself, not just individual pages

## `shared/layout/`

Add this to the `shared/` structure for shell-level components used app-wide:

```
shared/layout/
├── Header.tsx
├── Footer.tsx
├── Nav.tsx / MobileNav.tsx
└── Layout.tsx        # Wraps Header + <Outlet /> + Footer, used in App.tsx
```

## `pages/`

- One file per route, e.g. `HomePage.tsx`, `BlogPage.tsx`, `ProjectDetailPage.tsx`
- Pages compose feature components together + handle route-level concerns (params, page-level layout)
- Pages should stay thin — actual logic/UI belongs in the relevant `features/` module, not inlined here

## `features/<feature-name>/`

Kebab-case folder per feature (e.g. `features/blog-posts/`, `features/projects/`, `features/cv/`). Each feature folder contains only what it needs from:

```
features/<feature-name>/
├── components/       # Feature-specific UI components (PascalCase files)
├── hooks/             # Feature-specific hooks (useXyz.ts)
├── api/               # TanStack Query hooks + fetch functions for this feature's endpoints
├── types/             # TS types/interfaces for this feature's data (hand-written, per AUTH.md/CLAUDE.md convention)
└── index.ts           # Public exports — what other parts of the app are allowed to import from this feature
```

- Nothing outside a feature folder should reach into its internals directly — only import via its `index.ts`
- Not every feature needs every subfolder — omit what isn't used (e.g. a simple feature might not need `hooks/`)

## `shared/`

For code used by 2+ features, or truly global concerns:

```
shared/
├── components/        # Reusable UI primitives (Button, Modal, Toast, etc.)
├── hooks/              # Generic reusable hooks (useDebounce, useMediaQuery, etc.)
├── api/                # Centralized API client (base fetch wrapper, auth header injection, refresh-flow interceptor — see AUTH.md)
└── types/              # Shared/global types (e.g. ErrorDto)
```

- The centralized API client described in `AUTH.md` lives in `shared/api/` — all feature-level `api/` folders build on top of it, never duplicate its logic

## Naming Conventions

| What                                | Convention              | Example                         |
| ----------------------------------- | ----------------------- | ------------------------------- |
| Folders                             | kebab-case              | `blog-posts/`                   |
| Component files                     | PascalCase              | `PostCard.tsx`                  |
| Hook files                          | camelCase, `use` prefix | `usePostList.ts`                |
| Other files (utils, types, api fns) | camelCase               | `formatDate.ts`, `postTypes.ts` |
| Component names                     | PascalCase              | `function PostCard()`           |
| Types/interfaces                    | PascalCase              | `interface PostReadModel`       |

## Assumptions Made (confirm or correct)

- `App.css` deleted; `index.css` kept for Tailwind's `@tailwind base/components/utilities` directives only — no other global custom CSS unless you decide otherwise later
