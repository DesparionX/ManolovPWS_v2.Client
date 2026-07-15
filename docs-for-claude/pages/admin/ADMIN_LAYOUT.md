# Admin Layout & Routing

Defines the shared shell for the entire `/admin` area. This isn't a single page — it's a protected nested layout that wraps the admin child pages (`profile.md`, `posts.md`, `projects.md`, `inbox.md`), each documented separately.

## Purpose

Owner-only management area. Persistent inner navigation on the left, page content on the right. No role branching — this is a single-user app, so every item is visible unconditionally to the Owner (see `AUTH.md`'s App Model section).

## Routes

- `/admin` and `/admin/profile` — both render the same Profile content directly (no redirect between them; two paths, one component). Own doc: `profile.md`
- `/admin/posts` — own doc: `posts.md`
- `/admin/projects` — own doc: `projects.md`
- `/admin/inbox` — own doc: `inbox.md` (blocked — Contact module doesn't exist backend-side yet, build last)

All are real, bookmarkable, protected nested routes — not client-side tab state.

**Exception: `/admin/auth` is NOT part of this protected subtree**, despite sharing the `/admin` URL prefix. It's the sign-in page (own doc: `../sign-in.md`) and must be reachable while _unauthenticated_ — the opposite requirement of everything else under `/admin`. It's defined as a standalone sibling route in the router config, not nested inside this protected `AdminLayout` route object. Don't assume every `/admin/*` path is guarded — check `sign-in.md` for this one exception.

## Protection

- The entire `/admin` subtree **except `/admin/auth`** (see Routes exception above) is wrapped by a route guard requiring a valid access token in memory (per `AUTH.md`)
- Guard should attempt a silent refresh (per `AUTH.md`'s Refresh Flow) before deciding the session is invalid — avoids bouncing a genuinely-valid Owner session just because a hard page refresh cleared the in-memory token
- On failure (no valid session, refresh also fails): redirect to the **home page**, never to a login prompt or error page — consistent with `AUTH.md`'s Failure / Redirect Behavior (the login route stays secret even from failed admin access attempts)

## Layout Structure

- Left: persistent inner nav — Profile, All Posts, All Projects, Inbox. This is separate from (nested inside) the main app's outer Header/Nav from `STRUCTURE.md`'s SPA shell — both are visible simultaneously, outer nav for site-wide navigation, inner nav for admin sections
- Right: content area = React Router `<Outlet />`, swaps per child route
- Active inner-nav item highlighted based on current route (`/admin/posts` → "All Posts" highlighted, etc.) — treat `/admin` and `/admin/profile` as the same route for this purpose, so landing on bare `/admin` still highlights "Profile" rather than nothing

## Design / Visual Notes

- Visual style TBD alongside `THEME.md` decisions, same design language as the rest of the app — no separate "admin theme"
- Since this is Owner-only, no need to soften/hide destructive actions the way a multi-user app might (e.g. delete buttons can be direct rather than deeply confirmed) — but still worth a confirm step for delete since mistakes are still costly for a solo owner. Confirmation-dialog conventions to be decided per child page as needed (e.g. `posts.md`, `projects.md`).

## Child Pages

- `docs-for-claude/pages/admin/profile.md`
- `docs-for-claude/pages/admin/posts.md`
- `docs-for-claude/pages/admin/projects.md`
- `docs-for-claude/pages/admin/inbox.md` — not yet created, blocked on Contact module
- `docs-for-claude/pages/sign-in.md` — not a child of this layout (see Routes exception above), listed for cross-reference since it's the entry point into `/admin`

## Open Questions / Ask Before Assuming

- None currently outstanding.
