# Admin: Profile Page

Route: `/admin` and `/admin/profile` (same component, per `admin-layout.md`). Loads the full private profile via `GET /Account/me` and lets the Owner edit every field through the per-property `/Account/*` endpoints.

## Purpose

The Owner's own profile editor — the single source of truth for CV/public-profile data (name, contact info, skills, experience, etc.). Defaults to **Preview mode** (read-only); a toggle switches to **Edit mode**.

## Data / API

- `GET /Account/me` (protected) → `PrivateUserReadModel` — loaded once on page mount, used for both Preview and Edit
- Scalar/grouped field updates (fire on blur, see Functionality):
  - `PUT /Account/name` — `{ firstName, lastName, middleName? }` (grouped: fires once leaving the Name field group)
  - `PUT /Account/address` — `{ country, region, municipality, city, street, postalCode }` (grouped: fires once leaving the Address field group)
  - `PUT /Account/email` — `{ email }`
  - `PUT /Account/phone-number` — `{ phoneNumber }`
  - `PUT /Account/birth-date` — `{ birthDate }`
  - `PUT /Account/gender` — `{ gender }`
  - `PUT /Account/summary` — `{ summary }`
  - `PUT /Account/profession` — `{ profession }`
  - `PUT /Account/profile-picture` — `{ profilePictureUrl }` — see `FILE-UPLOAD.md` (separate doc, not yet created) for how the URL is obtained before this fires
- Array/list updates (**whole-list replace**, not per-item CRUD):
  - `PUT /Account/education` — `{ education: EducationDto[] }`
  - `PUT /Account/experience` — `{ experience: JobDto[] }`
  - `PUT /Account/certificates` — `{ certificates: CertificateDto[] }`
  - `PUT /Account/languages` — `{ languages: LanguageDto[] }`
  - `PUT /Account/skills` — `{ skills: SkillDto[] }`
  - `PUT /Account/contacts` — `{ contacts: ContactDto[] }`
  - **Important:** every add/edit/delete on these sections sends the **entire current array** back, not just the changed item. Build the new full array client-side (with the edit/delete/add applied) before calling PUT.
  - **No `id` field exists on any of these DTOs.** Track items by their **array index** for edit/delete targeting — acceptable here since this is a single-user app with no concurrent-edit risk, but don't assume a stable backend identity exists.

## Functionality & Interactions

### Preview / Edit toggle

- Defaults to **Preview** (read-only rendering of current data) on page load
- Toggle switches to **Edit** mode, enabling all the field-level interactions below

### Tabs

Top of the page: **Main**, **Education**, **Experience**, **Certificates**, **Languages**, **Skills**, **Contacts**. Main is the default active tab.

### Main tab — field behavior

- All fields validate live, on typing — error message displayed under the field
- **Individual fields** (Email, Phone, Summary, Profession, Gender, Birth Date): PUT fires on blur, only after passing validation
- **Grouped fields** (Name: firstName/middleName/lastName; Address: all 6 fields): PUT fires once when focus leaves the _entire group_ (not per individual field within it) — e.g. tabbing from Last Name to the next field outside the Name group triggers one `PUT /Account/name` with all three current values
- **Profile picture:** clicking the upload button opens a file picker; selected image is shown as a **live local preview immediately** (before upload completes — e.g. via `URL.createObjectURL`), then uploaded to the 3rd-party service (see `FILE-UPLOAD.md`). On successful upload, swap the local preview for the real hosted URL and fire `PUT /Account/profile-picture` with that URL. If `profilePictureUrl` is null/absent, render a default placeholder avatar instead of a broken image.

### Array tabs — shared "list editor" pattern

Education, Experience, Certificates, Languages, Skills, and Contacts all use the same interaction pattern, just with different visible columns and expand-form fields (see table below):

1. **Default view:** compact table-like list, one row per item, showing only the 1-2 key summary fields (not all data)
2. **Hover on a row:** reveals Edit and Delete icon buttons (no other actions)
3. **Delete:** requires a confirmation step (dialog/modal — "Are you sure?") before actually removing the item and firing the PUT with the item excluded from the array
4. **Edit:** row expands in place, revealing all fields for that item as editable inputs
5. **Add new:** a "+" button adds a new blank item, expanded immediately in edit form (same as clicking Edit on an existing row, just with empty fields)
6. **Save:** a green checkmark button confirms the current expanded item (new or edited) and fires the relevant whole-list PUT with that item's data merged into the full current array (using array index to know which position to update/insert)

**Per-tab column/field breakdown:**

| Tab          | Summary columns (collapsed row)                                           | Expand-form fields (edit/add)                                                                                                     |
| ------------ | ------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Education    | School Name, School Type                                                  | `schoolName`, `schoolType`, `degree`, `fieldOfStudy`, `startDate`, `endDate` (nullable — ongoing)                                 |
| Experience   | Position (`title`), Company                                               | `title`, `company`, `description`, `startDate`, `endDate` (nullable — ongoing)                                                    |
| Certificates | Certificate Name (`title`)                                                | `title`, `issuer`, `dateObtained`, `credentialId`, `credentialUrl`                                                                |
| Languages    | Language Name, Type (Native / Other — derived from `isNative`)            | `languageName`, `isNative` (toggle), `readingLevel`, `writingLevel`, `speakingLevel` (nullable — relevant mainly when not native) |
| Skills       | Skill Name, Skill Type, Skill Category                                    | `name`, `type` (Tech/Soft — matches `pages/cv.md`'s enum), `category`, `level` (int)                                              |
| Contacts     | Network icon (per `pages/cv.md`'s icon-mapping convention) + Profile Name | `network`, `profileName`, `fullUrl`                                                                                               |

## Design / Visual Notes

**Field styling (applies to all text/select/date inputs on this page):**

- Floating labels
- Rounded/cornered borders, colorized `accent` on focus; subtle `accent`-colorized glow shadow on hover/focus (see `shared/components/FloatingInput.tsx`, built for `sign-in.md`, reused here)
- **Invalid state overrides the above:** border turns `danger` (not `accent`), and the hover/focus glow shadow is dropped entirely — a glowing border reads as an inviting/positive affordance, wrong signal for a field that needs correcting
- Validation error text rendered directly under the field in `danger`, with a little breathing room (not glued to the field's bottom border) and a max-width so long messages don't run edge-to-edge

**Birth Date:** custom-built calendar picker matching the site theme (not the browser's native date input) — must support quick month AND year navigation (not just prev/next month arrows one click at a time — jumping years should be fast, not 90 clicks away)

**Gender:** toggle switch between two icons (male/female), the active one colorized, inactive one dimmed/neutral. Stored values are lowercase `"male"` / `"female"`.

**Summary field:** textarea, auto-grows in height as content is typed, manual resize handle disabled (`resize: none`)

**Array tabs:** compact table-like rows, hover-reveal actions (not always-visible icons — keeps the collapsed view clean), green checkmark save affordance, "+" add button styled consistently with the rest of the futuristic/accent design language

## Validation Rules

| Field                                           | Required  | Rules                                                                                                                                                                                                                                                                       |
| ----------------------------------------------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| First Name                                      | Yes       | Latin letters only (readability for non-Bulgarian visitors), 3–20 chars                                                                                                                                                                                                     |
| Middle Name                                     | No        | If provided: Latin letters only, 3–20 chars                                                                                                                                                                                                                                 |
| Last Name                                       | Yes       | Latin letters only, 3–20 chars                                                                                                                                                                                                                                              |
| Country / Region / Municipality / City / Street | Yes (all) | 2–100 chars each                                                                                                                                                                                                                                                            |
| Postal Code                                     | Yes       | Digits and dashes (`-`) only, 2–100 chars                                                                                                                                                                                                                                   |
| Email                                           | Yes       | Valid email format (proper regex, not just "contains @"), max 100 chars                                                                                                                                                                                                     |
| Phone Number                                    | No        | Any international format — validate client-side with `libphonenumber-js` (`isValidPhoneNumber`), matching the backend's use of the C# `PhoneNumbers` library (both are ports of Google's libphonenumber, so validation logic stays consistent between frontend and backend) |
| Summary                                         | Yes       | Max 5000 chars                                                                                                                                                                                                                                                              |
| Profession                                      | Yes       | Max 100 chars                                                                                                                                                                                                                                                               |
| Gender                                          | Yes       | One of: `male`, `female` (toggle, not free text)                                                                                                                                                                                                                            |
| Birth Date                                      | Yes       | Must be a real past date (not in the future); minimum age ≈ 90 years (i.e. date must fall between `today - 90 years` and `today`)                                                                                                                                           |

Array-item field validation (Education/Experience/Certificates/Languages/Skills/Contacts individual fields) not yet specified — see Open Questions.

## Array-Item Validation Rules

**Education**
| Field | Required | Rules |
|---|---|---|
| School Name | Yes | Max 100 chars |
| School Type | Yes | Free text, letters only, max 100 chars |
| Degree | Yes | Max 30 chars |
| Field of Study | Yes | Max 50 chars |
| Start Date | Yes | Cannot be in the future |
| End Date | No | Ongoing if absent; cannot be before Start Date |

**Experience**
| Field | Required | Rules |
|---|---|---|
| Title (Position) | Yes | Max 50 chars |
| Company | Yes | Max 50 chars |
| Description | Yes | Rich text (TipTap) — must contain actual typed content (empty check via `isRichTextEmpty`, same as Post/Project descriptions), max 10,000 chars |
| Start Date | Yes | Cannot be in the future |
| End Date | No | Ongoing if absent; cannot be before Start Date |

**Revised:** Description was originally a plain single-line text input, which couldn't hold bullet points or line breaks — the CV page's Employment History tab needed those to render a real job description properly, so this field was upgraded to the same TipTap `RichTextEditor` used for Post/Project descriptions (`features/profile/components/ProfileArrayTabs.tsx`'s `ExperienceTab`). `JobDto.description` is now HTML, same convention as `PostReadModel.context` / `ProjectReadModel.description` — anywhere it's displayed (CV page's Employment History) renders it via `dangerouslySetInnerHTML`, not as plain text.

**Certificates**
| Field | Required | Rules |
|---|---|---|
| Title | Yes | Max 100 chars |
| Issuer | Yes | Max 50 chars |
| Date Obtained | Yes | Cannot be in the future |
| Credential ID | Yes | Free text, max 5000 chars |
| Credential URL | Yes | Must be a valid URL format |

**Languages**
| Field | Required | Rules |
|---|---|---|
| Language Name | Yes | Free text, letters only |
| Is Native | Yes | Toggle, defaults to `false` for new entries |
| Reading / Writing / Speaking Level | Conditional | Required (dropdown, CEFR scale: A1/A2/B1/B2/C1/C2) when `isNative` is `false`. When `isNative` is `true`, these three fields are disabled/hidden and sent as `null`. |

**Skills**
| Field | Required | Rules |
|---|---|---|
| Name | Yes | Max 50 chars |
| Type | Yes | Toggle between Tech / Soft, themed icons (matches the enum convention from `pages/cv.md`) — defaults to **Soft** for new entries |
| Category | Yes | Free text — **this is the actual entry point where the category normalization rule from `pages/cv.md` must be implemented** (trim + Title Case, so `" category "` / `"CATEGORY"` / `"c a t e g o r y"` all become `"Category"` before being sent to the backend). Apply the normalization on blur/submit, not just live-typed as-is. |
| Level | Yes | Integer, 1–10. Not displayed anywhere in the read-only CV view (per `cv.md`), but still editable here. |

**Contacts**
| Field | Required | Rules |
|---|---|---|
| Network | Yes | Free text, max 30 chars — must match an existing icon filename per `pages/cv.md`'s icon-mapping convention (no dropdown lock-in currently; typo risk accepted knowingly) |
| Profile Name | Yes | Max 30 chars |
| Full URL | Yes | Must be a valid URL format |

## Edge Cases

- `GET /Account/me` failing entirely (network error, etc.) — Preview mode has nothing to show; needs a clear error state, not a silently blank page
- Deleting the only remaining item in an array section — should work the same as any other delete (empty list is valid), no special-casing needed
- Leaving a grouped field (Name/Address) mid-edit with one sub-field invalid — the group PUT should NOT fire until every field in that group passes validation; show which specific sub-field is failing

## Open Questions / Ask Before Assuming

- **`SkillDto.type` shape mismatch, needs live verification:** `openapi.json` types this field as a plain `string`, but `pages/cv.md` documents it as the numeric enum `1 | 2` (`Tech = 1`, `Soft = 2`). Implemented per `cv.md`'s more specific description (`features/profile/types/profileTypes.ts`'s `SkillType = 1 | 2`) since that's the doc that actually explains this field's meaning, but this hasn't been confirmed against a real backend response yet — verify once the API is reachable, and fix the type (and the Tech/Soft toggle in `ProfileArrayTabs.tsx`) if it turns out the backend actually sends something else (e.g. the string labels themselves).
- **Category normalization simplified:** implemented trim + Title Case (`" category "` / `"CATEGORY"` → `"Category"`), but not the more unusual example from `cv.md` of collapsing spaced-out single letters (`"c a t e g o r y"` → `"Category"`) — that heuristic seemed too fragile/false-positive-prone to implement blindly (could mangle legitimate short multi-word categories). Flag if that exact behavior is actually needed.
