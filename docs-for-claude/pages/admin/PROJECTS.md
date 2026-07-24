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
- **Finalized:** the state badge is a solid-tint pill (`bg-{color}/15 text-{color}`) using the real per-state color mapping from `THEME.md`'s Project State Colors section (`PROJECT_STATE_BADGE_CLASSES` in `features/projects/types/projectTypes.ts`) — `Finished` → `success` green, `InDevelopment` → `accent` cyan, `Frozen` → `frozen` indigo, `Abandoned` → `danger` red. This replaces the earlier placeholder (`STATE_HOVER_CLASS`, a hover-only left-border tint using only pre-existing tokens) now that real per-state colors were decided — the hover-tint mechanism itself was removed in favor of the always-visible colored badge, which communicates state at a glance without requiring a hover.
- **List is centered**, not full-width: wrapped in a `mx-auto max-w-xl` column (same "centered narrow column" convention as the Post/Project Editor forms), and each row's content (name + badge, then the Edit/Delete icons) is horizontally centered within that column rather than spread edge-to-edge with `justify-between`.
- Same borderless-table-with-divider styling as `admin/posts.md`, for visual consistency across both admin list pages
- Hover reveals Edit/Delete icons only (two, not three — no pin state to show)

## Edge Cases

- No projects exist yet — same empty-state treatment as `admin/posts.md`

## Open Questions / Ask Before Assuming

- None currently outstanding.
