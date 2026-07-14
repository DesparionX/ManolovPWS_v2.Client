# Admin: Post Editor

Routes: `/admin/posts/new` (create) and `/admin/posts/:id` (edit) — **same component**, per `admin/posts.md`. Mode is driven by an `isEditing` boolean (true when a valid `id` is present in the route and the post was successfully loaded).

## Purpose

Single form for both creating a new post and editing an existing one. Behavior differs meaningfully between the two modes — see Functionality.

## Data / API

- **Edit mode:** `GET /Posts/{id}` on mount to load and prefill the form
- **Create mode:** no initial fetch — form starts empty; the backend assigns the `id` on creation, so nothing is fetched beforehand
- Endpoints used depend on mode (see Functionality):
  - Create: `POST /Posts` — `{ title, context, thumb, gallery, isPinned }`
  - Edit (per-field, on blur):
    - `PUT /Posts/{id}/title` — `{ newTitle }`
    - `PUT /Posts/{id}/context` — `{ newContext }`
    - `PUT /Posts/{id}/thumb` — `{ newThumb }`
    - `PUT /Posts/{id}/gallery` — `{ newGallery }`
    - `PUT /Posts/{id}/pin` — no body, toggles server-side (see Functionality for when this fires)

`PostReadModel` fields and their editor treatment:
| Field | Editable? | Input type |
|---|---|---|
| `id` | No | Label only (edit mode; not shown in create mode — doesn't exist yet) |
| `authorId` | No | Label only (edit mode only) |
| `title` | Yes | Text input |
| `context` | Yes | Rich text editor (TipTap) — outputs HTML |
| `thumb` | Yes | Single image upload — depends on `FILE-UPLOAD.md` (not yet created) |
| `gallery` | Yes | Multi-image upload — depends on `FILE-UPLOAD.md` |
| `isPinned` | Yes | Toggle |
| `publishedDate` | No | Label only (edit mode only; not applicable on create — backend sets it) |
| `updatedDate` | No | Label only (edit mode only) |

## Functionality & Interactions

**Mode is driven by `isEditing`:**

- `isEditing === false` (Create mode): all fields editable inline, but nothing saves automatically. A **Submit/Create button** collects the whole form and fires `POST /Posts` once. On success, navigate to `/admin/posts/{newId}` — the page re-mounts in edit mode with the real id, and blur-autosave takes over from that point on.
- `isEditing === true` (Edit mode): standard blur-autosave, same principle as `admin/profile.md` — each field's `PUT` fires on blur, only after passing validation. No manual save button needed for these fields.

**Field-specific behavior:**

- `title`: text input, validates on typing (max 50 chars), PUT fires on blur (edit mode) or included in the create payload
- `context`: TipTap rich text editor — no practical max length. In edit mode, fires `PUT /Posts/{id}/context` on blur (i.e. when focus leaves the editor). Its underlying value is HTML.
- `thumb` / `gallery`: depend on the image upload subsystem (`FILE-UPLOAD.md`) — selecting/uploading an image updates local state immediately (live preview), and in edit mode fires the corresponding PUT once the upload completes and a URL is available
- `isPinned`: toggle control. In edit mode, every toggle interaction calls `PUT /Posts/{id}/pin` directly (it's a pure toggle server-side, so one call = one flip — no need to compare against a previous value first). In create mode, it's just a boolean included in the `POST /Posts` payload.

**Unsaved changes guard (create mode only):** if any field has been touched/filled in and the Owner tries to navigate away before submitting, show a confirmation dialog with two options:

- **Stay** — do nothing, remain on the page, form data untouched
- **Discard** — proceed with the navigation, losing the in-progress form data

This only applies while `isEditing === false` and the form is "dirty" (at least one field has a value). Once submitted (or in edit mode generally, where every field already autosaves), no guard is needed — there's nothing unsaved to lose.

## Design / Visual Notes

- Reuses the same field styling conventions established in `admin/profile.md`: floating labels, cornered borders colorized on focus, colorized shadow on hover, validation errors under each field
- Label-only fields (`id`, `authorId`, `publishedDate`, `updatedDate`) styled distinctly from editable fields — visually read-only (e.g. muted text, no border/focus states) so it's unambiguous they can't be edited
- Create mode's Submit button should be clearly primary/prominent, since it's the one manual save action on an otherwise autosave-driven page
- TipTap toolbar styling TBD alongside `THEME.md`

## Validation Rules

| Field      | Required | Rules                                                                                                                                                              |
| ---------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `title`    | Yes      | Free text, max 50 chars                                                                                                                                            |
| `context`  | Yes      | Rich text (TipTap) — must contain actual typed content; reject an effectively-empty value (e.g. just an empty `<p></p>`), not just an empty string. No max length. |
| `thumb`    | No       | Single image, via `FILE-UPLOAD.md`                                                                                                                                 |
| `gallery`  | No       | Max 15 images, via `FILE-UPLOAD.md`                                                                                                                                |
| `isPinned` | Yes      | Boolean, defaults to `false` for new posts                                                                                                                         |

## Edge Cases

- Navigating to `/admin/posts/:id` with an invalid/nonexistent `id` — `GET /Posts/{id}` will fail; show an error state, don't silently fall back to create mode
- Leaving the create form (navigating away) with unsaved data — handled by the Stay/Discard guard described above
- Submitting create form with `thumb`/`gallery` still uploading — Submit should be disabled/blocked until any in-flight uploads complete
- Attempting to add a 16th gallery image — block the upload/add action once 15 is reached, rather than accepting it and failing later

## Open Questions / Ask Before Assuming

- None currently outstanding.
