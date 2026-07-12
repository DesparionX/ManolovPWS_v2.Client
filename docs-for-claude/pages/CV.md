# CV Page

## Purpose

Public interactive CV/resume page. Rebuilt from the old Angular version (screenshot reference provided) — same structural/interaction identity, new color scheme (see `THEME.md`), one new section (Projects) added to the tab list. Audience: anonymous visitors (no auth required); single-user app, so there's no `/cv/:id` — the route is just this one fixed CV.

## Data / API

- `GET /CV` (public) — fetched once on page load, returns `PublicCVReadModel`
- No pagination/params — single fixed resource

`PublicCVReadModel` shape (confirmed via `openapi.json`):

```ts
interface PublicCVReadModel {
  profilePictureUrl: string | null;
  fullName: string;
  gender: string;
  address: { country: string; city: string } | null;
  profession: string;
  summary: string;
  workExperience: JobDto[];
  projects: CVProjectReadModel[];
  education: EducationDto[];
  certificates: CertificateDto[];
  skills: SkillDto[];
  languages: LanguageDto[];
  contacts: ContactDto[];
}

interface JobDto {
  title: string;
  company: string;
  description: string;
  startDate: string;
  endDate: string | null; // null = ongoing, display as "Present"
}
interface CVProjectReadModel {
  name: string;
  description: string;
  state: ProjectState; // reuse enum from pages/projects.md
  liveUrl: string | null;
  gitHubUrl: string | null;
  stack: string[];
}
interface EducationDto {
  schoolName: string;
  schoolType: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string | null;
}
interface CertificateDto {
  title: string;
  issuer: string;
  dateObtained: string;
  credentialId: string;
  credentialUrl: string;
}
interface SkillDto {
  name: string;
  level: number;
  type: 1 | 2;
  category: string; // type: 1 = Tech, 2 = Soft; category assumed pre-normalized (Title Case) by backend
}
interface LanguageDto {
  languageName: string;
  readingLevel: string | null;
  writingLevel: string | null;
  speakingLevel: string | null;
  isNative: boolean;
}
interface ContactDto {
  network: string;
  profileName: string;
  fullUrl: string; // fullUrl → clickable link
}
```

## Functionality & Interactions

**Skills expand/collapse:** Tech skills are visible by default; a down-arrow button below the Skills section toggles visibility of the Soft skills group (hidden until expanded) — separate interaction from the tab expand/collapse system on the right side.

**Contacts (left sidebar):** each contact is now a real clickable link (`<a href={fullUrl}>`), opening in a new tab — old version was static text, this is the one explicit upgrade to that section.

- Icon per contact resolved from `contact.network`: icon file path convention is `{network}.png` (or matching extension) inside an icons folder in `assets` (e.g. `assets/icons/networks/{network.toLowerCase()}.png`) — so `network: "LinkedIn"` resolves to `linkedin.png`. Relies on network values and icon filenames staying in sync; if a network's icon file is missing, needs a fallback (generic link icon) rather than a broken image.

**Tabs (right side, main content):** Summary, Projects, Employment History, Education, Certificates — in that order. Behavior per the screenshot:

- Each tab is independently expandable/collapsible — **expanding one does NOT collapse the others** (not a single-open accordion; more like a checklist of independent toggles)
- `Summary` is expanded by default on page load; the rest start collapsed (matches reference screenshot)
- Tab content:
  - **Summary:** `profession` as heading, `summary` as body text
  - **Projects:** condensed list (not cards) — `name`, `description`, `stack` tags, state badge (reuse `ProjectState` styling/labels from `pages/projects.md` if applicable), GitHub link (if `gitHubUrl` present), live link (if `liveUrl` present)
  - **Employment History:** list of jobs — `title`, `company`, `description`, `startDate`–`endDate` (or "Present" if `endDate` is null)
  - **Education:** list — `schoolName`, `schoolType`, `degree`, `fieldOfStudy`, `startDate`–`endDate`
  - **Certificates:** list — `title`, `issuer`, `dateObtained`, `credentialUrl` as a clickable link (label could be `title` or "View Credential")

## Design / Visual Notes

Rebuilding the old Angular CV page's structure/interactions (see attached reference screenshot), new color scheme per `THEME.md` (not the old red/orange).

**Layout — unchanged from reference (structurally):**

- Navbar: kept as-is (Home / Projects / CV / Contact — "Projects" replaces the old app's "Portfolio" label); logo kept structurally, will be re-designed by Manolov separately
  - Exit/logout icon in the navbar only renders when the Owner is signed in — not shown to anonymous visitors
- Left sidebar: profile picture (framed — same bordered-square style as reference, or refined further, colorized via `THEME.md`'s accent once decided), full name, then Address / Contacts / Skills / Languages sections beneath, same overall order as before
- Right side: vertical tab list with hexagon-style icons + connecting line (same visual language as reference), expanded tab colorized/highlighted, collapsed tabs dimmed/neutral

**Changed from the reference:**

- **Removed entirely:** the thin meta line under the name (birth date, gender, nationality flag) — this data isn't in `PublicCVReadModel` currently. Instead, just the gender icon placed neatly after the last name.
- **Address section:** unchanged (still shows `address.country` / `address.city`, flag optional if easy to derive from country)
- **Skills section — reworked:**
  - No more progress/level bars (even though `level` exists in the data, it's not displayed)
  - Split into two groups by `SkillDto.type` (enum: `Tech = 1`, `Soft = 2`) — Tech displayed first, Soft second
  - Within each group, sub-group by `category` (a free-text string, e.g. "Frontend", "AI Tools") — categories sorted alphabetically. Backend/data-entry is responsible for normalizing category text (trimmed, Title Case, e.g. `" category "` / `"CATEGORY"` all become `"Category"`) — the frontend can trust `category` is already clean and use it directly as a grouping key without re-normalizing
  - Rendered as simple tags/list, not bars — exact tag styling TBD alongside `THEME.md`
  - **Collapsed by default:** only Tech skills visible initially; a down-arrow toggle reveals the Soft skills group below (matches reference screenshot's down-arrow behavior — see Functionality)
- **Languages section:** unchanged from reference (native badge for `isNative`, read/write/speak levels for the rest)
- **New tab:** Projects, inserted second in the tab order (after Summary, before Employment History)

## Edge Cases

- Any CV section with an empty array (e.g. no certificates yet) — assumption: hide that tab entirely rather than showing it empty. Flag if you'd rather show a collapsed/disabled tab instead.
- `profilePictureUrl` is nullable — need a fallback avatar/placeholder if absent
- Ongoing job/education (`endDate: null`) → render as "Present", not blank

## Open Questions / Ask Before Assuming

- None currently outstanding. Fallback icon behavior for a `ContactDto.network` with no matching file in the icons folder should default to a generic link icon rather than a broken image — implement defensively even though this shouldn't normally happen if data entry stays disciplined.
