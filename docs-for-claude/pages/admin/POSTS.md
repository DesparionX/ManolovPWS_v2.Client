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
- **"+" button:** fixed at the bottom of the table, navigates to the Post Editor route in create mode (no `id` — fresh empty form)
- After a successful pin/unpin or delete, the table should reflect the change without a full page reload (refetch or optimistically update the list)

## Design / Visual Notes

- Borderless table — rows separated by a thin, subtle divider line rather than boxed/bordered cells
- Hover state reveals the action icons (Edit/Delete/Pin) — smooth transition in, not an abrupt snap
- Pinned posts — some visual indicator in the admin table too (e.g. a filled vs. outline pin icon) so it's clear at a glance which posts are currently pinned, without needing to hover
- "+" button — same visual treatment/positioning convention we should carry consistently across admin list pages (Posts and Projects both), sits at the bottom of the table
- Exact colors/icon set pending `THEME.md` decisions

## Edge Cases

- No posts exist yet — table should show an empty state (not a broken/empty table with just a "+" button floating with no context)
- Deleting the currently-pinned post — no special handling needed beyond the normal delete confirmation; it simply disappears from both admin and public views

## Open Questions / Ask Before Assuming

- None currently outstanding.
