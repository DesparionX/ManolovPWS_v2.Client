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
  type: "Tech" | "Soft"; // string, not the domain enum's underlying int — see note below
  category: string; // category assumed pre-normalized (Title Case) by backend
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

**Corrected after a real bug:** `SkillDto.type` was originally documented here as the numeric enum `1 | 2` (guessed from the backend's `SkillType { Tech = 1, Soft = 2 }` domain enum). Confirmed directly against the backend source: `SkillDto.Type` is a `string` — the API layer takes the string, normalizes it, and parses/validates it against the enum's **names**, not its underlying int. Sending `1`/`2` as JSON numbers failed model binding server-side (surfaced as a generic "One or more validation errors occurred." with no field-level detail, which is itself what led to fixing `parseErrors` in `API-CLIENT.md` to actually expose ASP.NET Core's field-level validation errors instead of just the generic title). The correct values are the literal strings `"Tech"` / `"Soft"` — used across `features/profile/types/profileTypes.ts`'s `SkillType`, the admin Profile Skills tab, and this page's `SkillsSection`.

## Functionality & Interactions

**Skills expand/collapse:** Tech skills are visible by default; a down-arrow button below the Skills section toggles visibility of the Soft skills group (hidden until expanded) — separate interaction from the tab expand/collapse system on the right side.

**Contacts (left sidebar):** each contact is now a real clickable link (`<a href={fullUrl}>`), opening in a new tab — old version was static text, this is the one explicit upgrade to that section.

- Icon per contact resolved from `contact.network`: icon file path convention is `{network}.png` inside `public/icons/networks/` (e.g. `network: "LinkedIn"` → `/icons/networks/linkedin.png`) — lives in `public/` (not `src/assets/`) specifically so files can be dropped in later without a rebuild/import change, referenced by plain URL string rather than a static import. **Current state:** no icon files exist yet (no brand/network icons available — the installed lucide-react version has none, e.g. no LinkedIn/Discord/etc.), so every contact currently falls back to a generic `Link` icon via the `<img>`'s `onError` handler (`features/cv/components/ContactLink.tsx`). Once real PNGs are added to `public/icons/networks/`, they start rendering automatically — no code change needed.

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
- Identity header (picture, full name, gender icon) spans the top, centered above both columns — see "Header split out" below.
- Left sidebar (below the header): Address / Contacts / Skills / Languages sections, centered (not left-aligned like the reference — see below), same overall section order as before
- Right side: vertical tab list with hexagon-style icons + connecting line (same visual language as reference), expanded tab colorized/highlighted, collapsed tabs dimmed/neutral
- Picture frame: thick two-tone border — a diagonal gradient between `accent` and `accent-dark` (`bg-linear-to-br from-accent to-accent-dark` as padding around the image, not a literal CSS `border`), matching the reference's light/dark two-shade frame using the theme's existing two blue tones instead of introducing a new color
- Whole page content (header + both columns) sits inside one glassmorphism card (`border-border-default/50 bg-bg-surface/60 backdrop-blur-md`), same convention as the admin panel's card

**Changed from the reference:**

- **Removed entirely:** the thin meta line under the name (birth date, gender, nationality flag) — this data isn't in `PublicCVReadModel` currently. Instead, just the gender icon placed neatly after the last name.
- **Header split out:** picture, full name, and gender icon are their own row (`features/cv/components/CVHeader.tsx`) centered above *both* columns, not inside the left sidebar — confirmed after initial build, since the reference screenshot's identity block reads as page-level, not sidebar-scoped.
- **Address section:** unchanged (still shows `address.country` / `address.city`), flag moved to the right of the text (was left). **Revised the flag rendering itself:** originally used a Unicode flag emoji computed from the country's ISO alpha-2 code (`shared/utils/countryFlag.ts`) — reported back as literally showing the two letters ("BG") instead of a flag image, because Windows' default emoji font doesn't include flag glyphs and falls back to the regional-indicator letters as plain text. Switched to an actual flag image from flagcdn.com (`https://flagcdn.com/24x18/{alpha2}.png`), keyed off the same alpha-2 lookup (`getCountryAlpha2`, the emoji function is kept for any future text-only use but no longer used here) — renders consistently regardless of OS/font. This is a soft external dependency (flagcdn.com must be reachable); acceptable given it's a small, easily-reverted visual choice and a well-established free public service, but flag if you'd rather avoid the external call entirely.
- **Skills section — reworked:**
  - No more progress/level bars (even though `level` exists in the data, it's not displayed)
  - Split into two groups by `SkillDto.type` (`"Tech"` / `"Soft"` — see the string-vs-enum-int correction note above) — Tech displayed first, Soft second
  - Within each group, sub-group by `category` (a free-text string, e.g. "Frontend", "AI Tools") — categories sorted alphabetically. Backend/data-entry is responsible for normalizing category text (trimmed, Title Case) — the frontend trusts `category` is clean, except for one client-side touch-up: a `/`-separated category (e.g. `"tools/cloud"`) gets spaced out and each segment capitalized (`formatCategory` in `SkillsSection.tsx`) → "Tools / Cloud", since a slash isn't a word boundary the backend's Title-Casing would split on
  - Rendered as simple tags/list, not bars — neutral pill chips (`rounded-full border border-border-default`), same visual language as the Project Detail page's stack tags, with an accent hover state (border + text color) on each chip
  - **Collapsed by default:** only Tech skills visible initially; a down-arrow toggle reveals the Soft skills group below (matches reference screenshot's down-arrow behavior — see Functionality)
- **Languages section:** unchanged from reference (native badge for `isNative`, read/write/speak levels for the rest) — CEFR level values are accent-colored, and the Read/Write/Speak groups get real spacing between them (`gap-x-4`) instead of a single trailing space
- **New tab:** Projects, inserted second in the tab order (after Summary, before Employment History)
- **Project/Job/Education titles colorize on hover** — each list item's own title (not the whole row/block) turns accent-colored when hovering anywhere on that item, via a `group`/`group-hover` pairing. Certificates don't get this treatment the same way since the certificate title *is* the link (see below) and already has its own hover color.
- **Certificates — link restructured:** the certificate title itself is now the clickable link to `credentialUrl` (default `text-primary`, turns accent on hover) instead of a separate "View Credential" link below it; issuer + date moved onto the same line as the title, separated with an em dash (`— {issuer} · {date}`).
- **Project description renders as real HTML, not stripped-to-text.** `CVProjectReadModel.description` is genuine HTML from the admin Project Editor's TipTap field. First pass used `stripHtmlToText` (matching Home's `PostCard` preview) to avoid showing literal `<p>`/`<ul>` tags as text — reasonable for a card *preview*, but wrong here: the CV tab shows the *full* description (like Project Detail does), so stripping it also threw away real bullet lists/paragraph breaks the Owner authored. Switched to `dangerouslySetInnerHTML` with the same list/heading styling `ProjectDetailPage` uses — safe for the same reason as everywhere else it's used: `description` is only ever authored by the Owner (single-user app), never third-party input.
- **Summary preserves manually-typed line breaks** (`whitespace-pre-wrap`) — `profile.summary` is plain text from a multi-line `<textarea>` (`AutoGrowTextarea`, not TipTap), so any `\n` the Owner typed is real, but a plain `<p>` collapses whitespace by default and silently ate them. Not rich text (no bullets/bold possible here), just respecting the newlines that already exist in the stored string.
- **Employment History (`JobDto.description`) is now rich text too.** Originally a plain single-line `FloatingInput` in the admin Profile editor's Experience tab, which couldn't hold bullet points or line breaks at all — upgraded to the same TipTap `RichTextEditor` Post/Project descriptions use (see `pages/admin/PROFILE.md`'s Experience section for the admin-side details). `job.description` is HTML now, same as `project.description`, and renders the same way here (`dangerouslySetInnerHTML` + the shared list/heading styling), not as plain text.
- **Implementation notes:**
  - `features/cv/types/cvTypes.ts` only defines `PublicCVReadModel`, `PublicAddress`, and `CVProjectReadModel` locally — `JobDto`/`EducationDto`/`CertificateDto`/`SkillDto`/`LanguageDto`/`ContactDto` are reused directly from `features/profile` (identical shapes, already typed there), and `ProjectState`/`PROJECT_STATE_LABELS`/`PROJECT_STATE_BADGE_CLASSES` from `features/projects`, rather than redefining duplicates.
  - **Hexagon tab icons are SVG polygons, not CSS `clip-path`.** First attempt used `clip-path: polygon(...)` on a plain `<div>`; a correctly-proportioned hexagon needs a box wider than tall (~1.15:1, e.g. `h-12 w-14` — a square box visibly squashes it), which was one issue, but the bigger one was the border/glow effect (next bullet): a `clip-path`'d shape has no real usable `border`/stroke, only a filled area, which doesn't support a clean traveling-highlight-along-the-edge effect. Switched to an inline SVG `<polygon>` (`HexBadge` in `CVTabs.tsx`) — same visual shape, but now has a real stroke to animate.
  - **Hexagon border: constant dark-gray outline + a brighter highlight traveling along it — not a filled glow.** The first glow attempt (`.hex-glow`, a second `clip-path`'d layer behind the badge filled with a rotating conic-gradient) looked like a radar sweep instead of a border highlight: a conic-gradient is a full filled area radiating from the center, and clip-path only offsets by bounding-box percentage, not a true geometric outward normal, so the "ring" it left visible around the hexagon's points vs. its flat edges was wildly uneven — thick on the flat top/bottom, nearly gone at the pointed corners. Replaced with two overlaid SVG `<polygon>` strokes on the same path: one constant `stroke-border-default` (always visible, never changes color, even when the tab is active/hovered — only the polygon's *fill* changes state, per explicit request) and one `stroke-accent` with `stroke-dasharray`/an animated `stroke-dashoffset` (`.hex-trace` in `index.css`) — a short bright dash that continuously travels around the actual outline path. This is the standard SVG "flowing border" technique and doesn't suffer the clip-path ring's unevenness, since a stroke follows the path itself rather than a bounding-box offset.
  - **Connecting line always spans hexagon-to-hexagon, including through expanded content.** Each tab is a `relative` wrapper (button + optional expanded content); the connector is `absolute`, `top-12` (hexagon's bottom) to `bottom-0` — since `bottom-0` resolves against the wrapper's own actual height, it automatically stretches through however much expanded content is present, rather than a fixed guessed length that fell short once a tab was opened. Consistent spacing between tabs comes from `pb-6` on every wrapper except the last (which also has no connector at all, since there's no next hexagon to reach).
  - **No inner line next to expanded content** — the earlier `border-l` down the left side of an expanded tab's content was removed per feedback; expanded content has no decorative line of its own, only the hexagon-to-hexagon connectors described above.
  - **Hexagon hover:** hovering a tab (`group/tab`) tints its hexagon's fill and colorizes the icon/label, even when collapsed — same treatment as the active/expanded state, so hover previews what "open" looks like.
  - Tab header text: static label for every tab except Summary, whose header is the dynamic `profession` string (matches the reference screenshot, where the first/expanded tab shows the job title, not a literal "Summary" label).

## Edge Cases

- Any CV section with an empty array (e.g. no certificates yet) — assumption: hide that tab entirely rather than showing it empty. Flag if you'd rather show a collapsed/disabled tab instead.
- `profilePictureUrl` is nullable — need a fallback avatar/placeholder if absent
- Ongoing job/education (`endDate: null`) → render as "Present", not blank

## Open Questions / Ask Before Assuming

- None currently outstanding. Confirmed: use a generic fallback icon for all contacts for now (no per-network icon files exist yet in the repo) — real icons can be dropped into `public/icons/networks/` later with no code change, per the Contacts note above.
