# Admin: Projects Page

Route: `/admin/projects` (per `admin-layout.md`). Simple management table for all projects — view, edit, delete, and create new. Same pattern as `admin/posts.md`, minus pin/unpin (projects don't have that concept).

## Purpose

Owner-only listing of every project, sorted newest-first, with quick access to edit or delete each one, plus a way to create a new project.

## Data / API

- `GET /Projects` (same endpoint the public Projects page uses — called here with the Owner's auth context)
- Sorted client-side by `uploadedDate`, newest first (equivalent of Posts' `publishedDate` for this resource)
- `DELETE /Projects/{id}` — removes the project, requires confirmation (see Functionality)
- "+" button navigates to the Project Editor page (create mode) — own doc, not yet created (`project-editor.md`)
- Clicking a row's Edit icon navigates to the same Project Editor page, in edit mode, with the project's `id`
- **Confirmed routing:** `/admin/projects/new` (create) and `/admin/projects/:id` (edit) both render the same Project Editor component — same pattern as `admin/posts.md`. Mode is decided by whether a valid `id` is present: if present, fetch `GET /Projects/{id}` and prefill; if absent (`/new`), render empty/default fields.

## Functionality & Interactions

- Table lists all projects, one row per project, showing **only the name** (no borders between rows — thin divider line separates entries, matching `admin/posts.md`)
- **Hover on a row** reveals two icon actions: Edit, Delete (no Pin — projects don't have that field)
- **Delete:** requires a confirmation step before calling `DELETE /Projects/{id}` (same pattern as Posts and Profile array items)
- **Edit:** navigates to the Project Editor route with the project's `id`
- **"+" button:** fixed at the bottom of the table, navigates to the Project Editor route in create mode
- After a successful delete, the table should reflect the change without a full page reload

## Design / Visual Notes

- **Confirmed:** each row shows a small `state` badge/tag (Finished / InDevelopment / Frozen / Abandoned) alongside the project name, since name-only would otherwise hide this useful info entirely
- **Row hover colorization is state-based**, not a single generic accent color — each state gets its own hover tint (e.g. Finished → a "success"-leaning tone, Abandoned → a muted/dimmed tone), giving an at-a-glance visual read of project health across the whole table. Exact color mapping per state TBD alongside `THEME.md`, but the mechanism (hover tint driven by `state`) is confirmed.
- Same borderless-table-with-divider styling as `admin/posts.md`, for visual consistency across both admin list pages
- Hover reveals Edit/Delete icons only (two, not three — no pin state to show)
- Exact colors/icon set pending `THEME.md` decisions

## Edge Cases

- No projects exist yet — same empty-state treatment as `admin/posts.md`

## Open Questions / Ask Before Assuming

- None currently outstanding.
