# Admin: Project Editor

Routes: `/admin/projects/new` (create) and `/admin/projects/:id` (edit) — **same component**, per `admin/projects.md`. Same `isEditing`-driven mode pattern as `admin/post-editor.md`.

## Purpose

Single form for both creating a new project and editing an existing one.

## Data / API

- **Edit mode:** `GET /Projects/{id}` on mount to load and prefill the form
- **Create mode:** form starts empty; backend assigns `id` on creation
- Endpoints used depend on mode:
  - Create: `POST /Projects` — `{ name, description, projectState, liveUrl, gitHubUrl, galleryPictures, projectStack, thumbUrl }`
  - Edit (per-field, on blur):
    - `PUT /Projects/{id}/name` — `{ newName }`
    - `PUT /Projects/{id}/description` — `{ newDescription }`
    - `PUT /Projects/{id}/state` — `{ newState }`
    - `PUT /Projects/{id}/thumb` — `{ newThumb }`
    - `PUT /Projects/{id}/gallery` — `{ newGallery }`
    - `PUT /Projects/{id}/github-url` — `{ newUrl }`
    - `PUT /Projects/{id}/live-url` — `{ newUrl }`
    - `PUT /Projects/{id}/stack` — `{ newStack }`

`ProjectReadModel` fields and their editor treatment:
| Field | Editable? | Input type |
|---|---|---|
| `id` | No | Label only (edit mode; not shown in create mode) |
| `ownerId` | No | Label only (edit mode only) |
| `name` | Yes | Text input |
| `description` | Yes | Rich text editor (TipTap) — outputs HTML |
| `state` | Yes | Dropdown (`Finished` / `InDevelopment` / `Frozen` / `Abandoned`) |
| `liveUrl` | Yes | Text input, optional, valid URL format |
| `gitHubUrl` | Yes | Text input, optional, valid URL format |
| `gallery` | Yes | Multi-image upload — depends on `FILE-UPLOAD.md` |
| `thumb` | Yes | Single image upload — depends on `FILE-UPLOAD.md`. Required (not nullable, unlike Posts' thumb). |
| `stack` | Yes | Tag input (see Design notes) |
| `uploadedDate` | No | Label only (edit mode only) |
| `updatedDate` | No | Label only (edit mode only) |

## Functionality & Interactions

**Mode driven by `isEditing`**, identical pattern to `admin/post-editor.md`:

- Create mode: all fields editable, no autosave — a Submit/Create button fires `POST /Projects` once with the full form. On success, navigate to `/admin/projects/{newId}`, remounting in edit mode.
- Edit mode: blur-autosave per field, same principle as `admin/profile.md` and `admin/post-editor.md`.

**Field-specific behavior:**

- `name`: text input, validates on typing (max 50 chars), same convention as Post's `title`
- `description`: TipTap rich text editor, no practical max length, same convention as Post's `context`
- `state`: dropdown, fires PUT on change (not blur — a select's "change" event is the natural trigger, there's no meaningful intermediate typing state to wait out)
- `liveUrl` / `gitHubUrl`: both optional; validate as proper URL format when non-empty; PUT fires on blur
- `thumb` / `gallery`: same file-upload-dependent behavior as Post Editor — live preview, PUT fires once upload completes and URL is available
- `stack`: tag input — see Design notes for interaction details; PUT fires when the tag set changes (i.e. after an add or remove action, not on every keystroke)

**Unsaved changes guard (create mode only):** identical mechanism to `admin/post-editor.md` — if any field has been touched/filled and the Owner tries to navigate away before submitting, show a confirmation dialog: **Stay** (do nothing, remain on page) or **Discard** (proceed with navigation, losing in-progress data). Only applies while `isEditing === false` and the form is dirty.

## Design / Visual Notes

- Same field styling conventions as `admin/profile.md` / `admin/post-editor.md`: floating labels, colorized focus borders, hover shadow, validation errors under fields
- Label-only fields (`id`, `ownerId`, `uploadedDate`, `updatedDate`) styled as visually read-only, same convention as Post Editor
- **Stack tag input:** single-word tags only (e.g. "C#", "PostgreSQL") — typing a space or comma commits the current word as a tag and wraps it into a pill/chip. Each tag shows a small "×" icon on hover for removal — no confirmation needed for removing a tag (low-stakes, easily re-added)
- `state` dropdown options should read as human-friendly labels (e.g. "In Development" for `InDevelopment`) even though the underlying value sent to the API is the PascalCase enum string
- TipTap toolbar styling TBD alongside `THEME.md`, consistent with Post Editor

## Validation Rules

| Field         | Required | Rules                                                                                                                                    |
| ------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `name`        | Yes      | Free text, max 50 chars                                                                                                                  |
| `description` | Yes      | Rich text (TipTap) — must contain actual typed content; reject an effectively-empty value, same rule as Post's `context`. No max length. |
| `state`       | Yes      | One of `Finished` / `InDevelopment` / `Frozen` / `Abandoned` (dropdown, not free text)                                                   |
| `liveUrl`     | No       | Valid URL format when provided                                                                                                           |
| `gitHubUrl`   | No       | Valid URL format when provided                                                                                                           |
| `gallery`     | No       | Max 15 images, via `FILE-UPLOAD.md`                                                                                                      |
| `thumb`       | Yes      | Single image, via `FILE-UPLOAD.md` — required, unlike Post's optional `thumb`                                                            |
| `stack`       | Yes      | At least 1 tag required; each tag is a single word (see Design notes for the tag-input interaction)                                      |

## Edge Cases

- Invalid/nonexistent `id` on `/admin/projects/:id` — show an error state, same as Post Editor
- Leaving the create form with unsaved data — handled by the Stay/Discard guard described above
- Submitting create form while `thumb`/`gallery` uploads are in flight — block Submit until complete, same as Post Editor
- Attempting to add a 16th gallery image — same 15-image cap as Post Editor
- Duplicate/empty tags in `stack` — prevent adding an empty-string tag or an exact duplicate of an existing tag
- Attempting to remove the last remaining `stack` tag — blocked (the × control is disabled/hidden when only one tag remains), since at least 1 is required

## Open Questions / Ask Before Assuming

- None currently outstanding.
