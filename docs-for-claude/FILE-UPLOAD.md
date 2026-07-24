# File Upload (Images)

Shared subsystem for uploading images directly from the frontend to Cloudinary — no backend file service exists, so this is entirely client-side. Used by: `admin/profile.md` (profile picture), `admin/post-editor.md` (thumb + gallery), `admin/project-editor.md` (thumb + gallery).

## Provider: Cloudinary

Chosen specifically because of its **unsigned upload preset** workflow — uploads go straight from the browser to Cloudinary's API using only a preset name, no API secret and no signature generation required, which fits the "no backend file service" constraint directly. Other providers (ImageKit, Uploadcare, etc.) generally expect a signed request, which would've forced building a backend endpoint just to generate signatures.

## Setup (one-time, done in the Cloudinary dashboard — not code)

- Create a Cloudinary account, note the **Cloud Name**
- Create an **unsigned upload preset** (e.g. `portfolio_unsigned`)
- On the preset itself, restrict **Allowed formats** (under the "Optimize and Deliver" tab in Cloudinary's console — not "General") to `jpg,jpeg,png`
- **Max file size is enforced client-side only, not on the Cloudinary preset.** Cloudinary's console doesn't expose a preset-level file-size field for raw unsigned uploads via `fetch`/`FormData` (the `maxFileSize` option in their docs applies specifically to their own pre-built Upload Widget, which we're not using). This is acceptable here, not just a fallback: every upload flow in this app sits behind the `/admin` route guard, so only the authenticated Owner can ever trigger an upload — there's no public/adversarial surface that a missing server-side size limit would expose.
- Store `Cloud Name` and the preset name as Vite env vars: `VITE_CLOUDINARY_CLOUD_NAME`, `VITE_CLOUDINARY_UPLOAD_PRESET`

## Location in codebase

Per `STRUCTURE.md`'s `shared/` conventions:

```
shared/file-upload/
├── uploadImage.ts     # core upload function
└── types.ts           # UploadResult, etc.
```

## Core Function

```ts
// shared/file-upload/uploadImage.ts
async function uploadImage(file: File, folder: string): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append(
    "upload_preset",
    import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
  );
  formData.append("folder", folder);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
    { method: "POST", body: formData },
  );

  if (!res.ok) throw new Error("Image upload failed");
  const data = await res.json();
  return data.secure_url; // this is the URL stored via the relevant PUT endpoint
}
```

- **Transport:** `multipart/form-data` via the browser's native `FormData` — the standard, simplest approach for actual `File` objects from an `<input type="file">`, no base64 encoding needed
- **`folder` parameter** — confirmed flat structure, no per-post/per-project subfolders:
  - `manolovpws/profile` — profile picture
  - `manolovpws/posts` — post thumbs AND galleries (shared, not split further)
  - `manolovpws/projects` — project thumbs AND galleries (shared, not split further)
  - **Why flat, not nested per-entity:** in Create mode, thumb/gallery uploads happen _before_ the post/project exists (image picked → uploaded immediately, before the "Create" submit fires `POST` and a real `id` is assigned) — so there's no id yet to name a subfolder after. Cloudinary auto-creates folders on upload with no manual step, but _moving_ an asset into a different folder afterward, or bulk-deleting a folder's contents, both require signed Admin API calls (need the API secret) — which we don't have, by design. So even a "temp folder → move once id exists" approach isn't achievable without a backend. Flat folders with Cloudinary's auto-generated unique filenames (no collision risk) is the achievable option given this constraint.
  - **Confirmed:** `folder` is on Cloudinary's official allowed-parameters list for unsigned upload calls (alongside `upload_preset`, `public_id`, `tags`, etc.), so passing it dynamically per upload — rather than fixing it on the preset itself — works as designed.
- Return value is just `secure_url` (the hosted HTTPS URL) — nothing else from Cloudinary's response is needed; this URL is what gets sent to the relevant backend `PUT` endpoint (e.g. `PUT /Account/profile-picture`, `PUT /Posts/{id}/thumb`)

## Live Preview Pattern (used by every consumer of this service)

1. User selects a file → immediately show a **local preview** via `URL.createObjectURL(file)` (instant, no network wait)
2. Call `uploadImage(file, folder)` in the background
3. On success → swap the local preview for the real `secure_url`, then fire the relevant backend `PUT` with that URL
4. On failure → keep showing the local preview isn't safe (it's not a real persisted URL) — revert to the previous image (or empty/default state) and show an error message

## Validation (client-side, before upload attempt)

| Rule               | Value                   |
| ------------------ | ----------------------- |
| Allowed file types | `.jpg`, `.jpeg`, `.png` |
| Max file size      | 10 MB                   |

File type restriction is enforced both client-side and on the Cloudinary preset (Allowed formats). File size is client-side only — see the Setup section above for why that's an acceptable boundary here (Owner-only, authenticated upload surface).

## Multi-image (Gallery) Handling

Post/Project gallery fields (max 15 images each, per `admin/post-editor.md` / `admin/project-editor.md`) call `uploadImage` once per file — no special batch endpoint on Cloudinary's side needed for this scale. Uploads can run in parallel (`Promise.all`), with per-image progress/preview shown independently, rather than blocking on one-at-a-time sequential uploads.

## Known Limitations

- **No cleanup/delete capability from the frontend.** Deleting a Cloudinary asset (e.g. when a post/project is deleted, or when a thumb/gallery image is replaced with a new one) requires a signed Admin API call — not possible from pure frontend code with an unsigned preset. This means: deleting a post/project via `admin/posts.md` / `admin/projects.md` removes the backend record, but the associated Cloudinary images remain, orphaned, forever (consuming free-tier storage over time). Same for replacing a thumb — the old image stays uploaded even after being replaced.
- **Mitigation for now:** periodic manual cleanup via the Cloudinary dashboard. A proper fix would require a small backend endpoint (even just for deletion) using the API secret server-side — worth reconsidering if orphaned storage becomes a real problem, but out of scope for the current frontend-only approach.

## Edge Cases

- Upload fails partway through a multi-image gallery batch (e.g. 3 of 5 succeed, 2 fail) — surface which ones failed, let the Owner retry just those, don't discard the successful ones
- Very large file selected — reject before attempting upload (per the 10MB rule), not after a slow failed network attempt
- Network failure mid-upload — clear error state, no silent failure; the field should not fire its backend `PUT` if the upload itself never completed

## Open Questions / Ask Before Assuming

- None currently outstanding.
