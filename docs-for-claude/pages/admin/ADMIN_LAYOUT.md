# Admin Layout & Routing

Defines the shared shell for the entire `/admin` area. This isn't a single page — it's a protected nested layout that wraps the admin child pages (`profile.md`, `posts.md`, `projects.md`, `inbox.md`), each documented separately.

## Purpose

Owner-only management area. Persistent inner navigation on the left, page content on the right. No role branching — this is a single-user app, so every item is visible unconditionally to the Owner (see `AUTH.md`'s App Model section).

## Routes

- `/admin` and `/admin/profile` — both render the same Profile content directly (no redirect between them; two paths, one component). Own doc: `profile.md`
- `/admin/posts` — own doc: `posts.md`
- `/admin/projects` — own doc: `projects.md`
- `/admin/inbox` — own doc: `inbox.md`
- `/admin/inbox/:id` — a single message's full content, own doc: `MESSAGE-DETAIL.md`. Doesn't appear in the inner nav (only reached via a Read action on the Inbox list), but is still a real nested route under this same protected layout.

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
- **Inbox nav item shows the unread count** (small badge, e.g. "3"), same number as the badge on the main Header's logout-adjacent icon (see `STRUCTURE.md`'s `shared/layout` notes and `inbox.md`) — both read from the same shared query, so they always agree
- **Mobile-only: the inner nav shows icons only by default; the active tab's label expands into view alongside its icon.** Inactive tabs stay icon-only. This is separate from (and not to be confused with) the desktop-only manual collapse toggle (the small chevron button, `md:flex`-only) — that toggle still controls all tabs uniformly regardless of which is active, exactly as before; the per-tab active-expands-label behavior only exists below the `md` breakpoint, where there's no manual toggle at all.
  - **The expand is an animated width transition, not an instant show/hide.** Toggling `display` (`hidden` ↔ visible) can't be transitioned smoothly by CSS, so the label instead sits permanently in the layout with `overflow-hidden whitespace-nowrap` and animates `max-width` between `max-w-0` (inactive) and a fixed cap (active) — same technique, and same reason, as the icon's own gap (`gap-0` ↔ `gap-2` on the parent `Link`) animating alongside it, so the icon doesn't jump sideways the instant the label appears. **Deliberately max-width only, no opacity fade mixed in** — an earlier version animated both together, which read as the label cross-fading into place rather than growing out from behind the icon; dropping opacity (relying purely on the `overflow-hidden` clip) makes it a clean directional left-to-right wipe instead.
  - **Only the expanding (newly active) tab animates — the outgoing tab collapses instantly.** Both the label's `max-width` and the `Link`'s own `gap-0`/`gap-2` use a conditional `duration-300`/`duration-0` (300ms when `active`, 0ms when not) rather than one shared duration for both directions — otherwise switching tabs visibly played two competing animations at once (the old tab visibly shrinking back down while the new one grew), rather than reading as one clean transition into the newly selected tab. Desktop's own collapse-toggle animation is unaffected — it always keeps `duration-300` there (`md:duration-300`), regardless of `active`, exactly as before.
  - **Mobile-only: the nav row is horizontally centered** (`justify-center`, overridden back to `justify-start` at `md:`) — it was left-aligned by default (flex's own default), which read oddly once only some tabs show a label and the row's total content width varies by which tab is active.

## Design / Visual Notes

- Visual style TBD alongside `THEME.md` decisions, same design language as the rest of the app — no separate "admin theme"
- Since this is Owner-only, no need to soften/hide destructive actions the way a multi-user app might (e.g. delete buttons can be direct rather than deeply confirmed) — but still worth a confirm step for delete since mistakes are still costly for a solo owner. Confirmation-dialog conventions to be decided per child page as needed (e.g. `posts.md`, `projects.md`).

## Child Pages

- `docs-for-claude/pages/admin/profile.md`
- `docs-for-claude/pages/admin/posts.md`
- `docs-for-claude/pages/admin/projects.md`
- `docs-for-claude/pages/admin/inbox.md`
- `docs-for-claude/pages/admin/MESSAGE-DETAIL.md`
- `docs-for-claude/pages/sign-in.md` — not a child of this layout (see Routes exception above), listed for cross-reference since it's the entry point into `/admin`

## Open Questions / Ask Before Assuming

- None currently outstanding.
