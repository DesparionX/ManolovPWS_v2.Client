# Admin: Posts Page

Route: `/admin/posts` (per `admin-layout.md`). Simple management table for all posts — view, pin/unpin, edit, delete, and create new.

## Purpose

Owner-only listing of every post, sorted newest-first, with quick access to pin/unpin, edit, or delete each one, plus a way to create a new post.

## Data / API

- `GET /Posts` (same endpoint the public Home page uses — no separate "admin" listing endpoint exists, since posts have no draft/hidden state; this call is just made with the Owner's auth context here)
- Sorted client-side by `publishedDate`, newest first
- `PUT /Posts/{id}/pin` — **toggles** pin state server-side (no request body; calling it again unpins). Confirmed via testing — the spec doesn't document this behavior since the endpoint takes no body.
- `DELETE /Posts/{id}` — removes the post, requires confirmation (see Functionality)
- "+" button navigates to the Post Editor page (create mode) — own doc, not yet created (`post-editor.md`)
- Clicking a row's Edit icon navigates to the same Post Editor page, in edit mode, with the post's `id`
- **Confirmed routing:** `/admin/posts/new` (create) and `/admin/posts/:id` (edit) both render the same Post Editor component. The component itself decides its mode based on whether a valid `id` is present in the route — if present, fetch `GET /Posts/{id}` and prefill the form; if absent (`/new`), render empty/default fields.

## Functionality & Interactions

- Table lists all posts, one row per post, showing **only the title** (no borders between rows — instead a thin divider line separates entries)
- **Hover on a row** reveals three icon actions: Edit, Delete, Pin/Unpin (colorized icons, exact styling TBD alongside `THEME.md`) — icons hidden otherwise, keeping the default view clean
- **Pin/Unpin:** clicking the pin icon calls `PUT /Posts/{id}/pin` immediately (toggle — no confirmation needed, it's non-destructive and instantly reversible by clicking again)
- **Delete:** clicking the delete icon requires a confirmation step (dialog/modal — same pattern as Profile's array-item deletes) before calling `DELETE /Posts/{id}`
- **Edit:** navigates to the Post Editor route with the post's `id`, loading existing data into the same create/edit form
- **The whole row is clickable, same action as Edit** — added since mobile has no hover, so hover-revealed icons alone would be effectively unreachable there (no way to see, and awkward to blindly tap, an invisible target). Pin/Unpin and Delete each call `stopPropagation()` on their own click so tapping them doesn't also trigger the row's navigate-to-Edit.
- **Mobile: row actions also reveal on press-and-hold, and stay revealed after releasing** — `shared/hooks/useLongPressReveal.ts` (shared with Projects/Inbox/Profile's array-tab lists), not plain CSS `:active` (which would revert the instant a finger lifts, before there's time to actually reach Edit/Delete). The row also gets `select-none` so the hold doesn't trigger the native text-selection callout, and once revealed the icons take their eventual hover colors (accent/danger) immediately rather than staying secondary-gray — there's no hover-then-preview-color step on a touchscreen.
- **Tapping anywhere outside the revealed row dismisses it** — since the reveal deliberately stays stuck open after release (previous bullet), it needs its own way to close again besides pressing-and-holding a different row. `useLongPressReveal.ts` tags each row with a `data-long-press-id` attribute and listens for `pointerdown` on `document`, clearing the reveal whenever the event's target isn't inside the currently-revealed row's own attribute-tagged element. Shared by the same four list types as the reveal itself.
- **"+" button:** fixed at the bottom of the table, navigates to the Post Editor route in create mode (no `id` — fresh empty form)
- After a successful pin/unpin or delete, the table should reflect the change without a full page reload (refetch or optimistically update the list)

## Design / Visual Notes

- Borderless table — rows separated by a thin, subtle divider line rather than boxed/bordered cells. **The divider is shorter than the row itself** (`w-4/5`, centered via `mx-auto`), not a full-bleed `divide-y` border edge-to-edge — a manually-rendered `<div>` between rows (via `Fragment`-wrapped `.map()`, one per gap, none before the first or after the last row) rather than a wrapper-level `divide-y` utility, since that always spans the full container width with no way to inset it. Same convention now shared across Posts/Projects/Inbox.
- **Row content (pin icon + title) is horizontally centered**, not left-aligned — a `grid-cols-[1fr_auto_1fr]` row (empty spacer div, centered content, action icons pinned right via `justify-end` in the trailing column) rather than a plain `flex justify-between`, matching the centered-content convention Projects' row already used. Applies to both mobile and desktop.
- Hover state reveals the action icons (Edit/Delete/Pin) — smooth transition in, not an abrupt snap
- Pinned posts — some visual indicator in the admin table too (e.g. a filled vs. outline pin icon) so it's clear at a glance which posts are currently pinned, without needing to hover
- "+" button — same visual treatment/positioning convention we should carry consistently across admin list pages (Posts and Projects both), sits at the bottom of the table
- Exact colors/icon set pending `THEME.md` decisions

## Edge Cases

- No posts exist yet — table should show an empty state (not a broken/empty table with just a "+" button floating with no context)
- Deleting the currently-pinned post — no special handling needed beyond the normal delete confirmation; it simply disappears from both admin and public views

## Open Questions / Ask Before Assuming

- None currently outstanding.
