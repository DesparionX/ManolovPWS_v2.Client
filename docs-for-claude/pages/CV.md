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

- Icon per contact resolved from `contact.network` via a `react-icons` lookup map — canonical list of supported networks and their icons lives in `pages/admin/profile.md`'s Network Options table (source of truth, since that's also where the Owner selects a network via dropdown). `ContactLink.tsx` looks up `network` in that same map; falls back to a generic `FaLink` icon for any value outside the curated list (shouldn't happen in practice, since Profile's dropdown constrains entry, but defensive regardless). **Supersedes the earlier `{network}.png`/`public/icons/networks/` approach** — no icon files to source or upload; these are SVG components that inherit `currentColor`, so they pick up the `accent` hover treatment automatically, same as everything else on this page.
- **Icon-only now, no visible label text — a further reversal, both mobile and desktop.** Went through two earlier versions: static text with no link at all, then a real link showing `contact.profileName` next to the icon, then reversed to show `contact.network` instead of `profileName`. Per Owner feedback, the label is gone entirely now — `ContactLink.tsx` renders just the icon (`h-6 w-6`, up from `h-4 w-4`, "a little bigger"), with `contact.network` moved to `title`/`aria-label` instead (hover tooltip + screen-reader text) so it's not lost, just not permanently visible. The link's `href` is still `contact.fullUrl` regardless — none of these changes ever touched the actual destination, only what renders/is exposed as the visible or accessible label.
- **All contacts sit in a single row** (`CVSidebar.tsx`, `flex items-center justify-center gap-4`) — was a vertical column (`flex-col`) of icon+label rows; once the label was removed, a row of compact icons reads better than a column did. No wrap — a personal contact list is short enough in practice that this hasn't needed reconsidering.

**Tabs (right side, main content):** Summary, Projects, Employment History, Education, Certificates — in that order. Behavior per the screenshot:

- Each tab is independently expandable/collapsible — **expanding one does NOT collapse the others** (not a single-open accordion; more like a checklist of independent toggles)
- `Summary` is expanded by default on page load; the rest start collapsed (matches reference screenshot)
- Tab content:
  - **Summary:** `profession` as heading, `summary` as body text
  - **Projects:** condensed list (not cards) — `name`, `stack` tags, state badge (reuse `ProjectState` styling/labels from `pages/projects.md` if applicable), a "View Project" link to the project's own detail page (`/projects/{id}` via `CVProjectReadModel.id`, always present), GitHub link (if `gitHubUrl` present), live link (if `liveUrl` present). **No `description`** — see Design / Visual Notes below for why, and for why this list isn't sorted chronologically like the other three.
  - **Employment History:** list of jobs — `title`, `company`, `description`, `startDate`–`endDate` (or "Present" if `endDate` is null). **Sorted most-recent-first by `startDate`** (`sortByDateDesc`, `shared/utils/sortByDateDesc.ts`).
  - **Education:** list — `schoolName`, `schoolType`, `degree`, `fieldOfStudy`, `startDate`–`endDate`. **Sorted most-recent-first by `startDate`**, same `sortByDateDesc` helper.
  - **Certificates:** list — `title`, `issuer`, `dateObtained`, `credentialUrl` as a clickable link (label could be `title` or "View Credential"). **Sorted most-recent-first by `dateObtained`**, same `sortByDateDesc` helper.

## Design / Visual Notes

Rebuilding the old Angular CV page's structure/interactions (see attached reference screenshot), new color scheme per `THEME.md` (not the old red/orange).

**Layout — unchanged from reference (structurally):**

- Navbar: kept as-is (Home / Projects / CV / Contact — "Projects" replaces the old app's "Portfolio" label); logo kept structurally, will be re-designed by Manolov separately
  - Exit/logout icon in the navbar only renders when the Owner is signed in — not shown to anonymous visitors
- Identity header (picture, full name, gender icon) spans the top, centered above both columns — see "Header split out" below.
- Left sidebar (below the header): Address / Contacts / Skills / Languages sections, centered (not left-aligned like the reference — see below), same overall section order as before
- Right side: vertical tab list with hexagon-style icons + connecting line (same visual language as reference), expanded tab colorized/highlighted, collapsed tabs dimmed/neutral
- Picture frame: thick two-tone border — a diagonal gradient (`bg-linear-to-br` as padding around the image, not a literal CSS `border`), same thickness/shape throughout. **Color reversed per Owner feedback, both mobile and desktop: gray, not accent.** Originally `from-accent to-accent-dark` (the theme's two blue tones, matching the reference's light/dark two-shade frame); now `from-text-secondary to-border-default` — reuses existing neutral-gray tokens rather than introducing a new color, no other property changed (`CVHeader.tsx`).
- Whole page content (header + both columns) sits inside one glassmorphism card (`border-border-default/50 bg-bg-surface/60 backdrop-blur-md`), same convention as the admin panel's card
- **Mobile-only: the two columns page between each other instead of stacking, with a horizontal slide transition.** Desktop shows the identity header, then both columns side by side, unconditionally, exactly as described above — rendered as its own separate, unconditional block (`hidden md:flex`), untouched by any of the mobile mechanics below. Below `md`, `CVPage.tsx` renders a _second_, structurally different block instead (`md:hidden`): a `w-[200%]` flex track holding both **History** (`CVTabs`, first — shows by default) and **General Info** (`CVSidebar`, second) side by side inside an `overflow-hidden` parent, sliding via `transition-transform` between `translate-x-0` (History) and `-translate-x-1/2` (General Info) — a real slide, not an instant `hidden`/visible swap. Local `useState<"history" | "info">` in `CVPage.tsx` drives which. This means `CVSidebar`/`CVTabs` each render twice in the JSX (once per block) — the same tradeoff `Nav.tsx`/`MobileNav.tsx` already make for the site's own nav, since a sliding track and a plain side-by-side pair need fundamentally different container structure, not just different classes on a shared one.
  - **The page toggle is a circular icon button, colored accent (blue), not the neutral secondary gray Post/Project's own back button uses** — same shape/size (`rounded-full border border-border-default bg-bg-surface h-9 w-9`, "almost stuck to the border" via `-translate-x-1/2`/`translate-x-1/2`), but `text-accent` by default rather than only on hover, per Owner feedback.
  - **Both arrows are siblings of the sliding track's `overflow-hidden` wrapper, not descendants of it — a real bug, not just a structural preference.** They were originally rendered _inside_ each slide (so each was only reachable while its own slide was active), but that put them inside the same element whose `overflow-hidden` exists specifically to clip the other, off-screen slide — and that clipping doesn't know the difference between "the sibling slide bleeding off-screen" (intended) and "this button's own deliberate half-outside-the-edge positioning" (not intended to be clipped), so the buttons ended up rendering half-cut-off. Fixed by positioning both against the outer `relative` wrapper instead (a parent of the `overflow-hidden` track, not a child), and conditionally rendering only the one matching the current `mobileView` — same visibility behavior as before (only one arrow reachable at a time), just no longer inside anything that clips it.
  - **Both arrows sit at the same `top-3`, level with each other.** An earlier version used `top-6` for History's arrow (hand-estimated to line up with the taller `h-12` hexagon badge vs. General Info's plain text heading) — visibly lower than General Info's `top-3` arrow when compared side by side, which Owner feedback flagged as inconsistent-looking even though each was individually "aligned with its own section's first item." Matching both to `top-3` was the actual fix, not more precise per-section alignment math.
  - **The History pane gets a small `pl-2` its desktop render doesn't need — a real bug, not a style choice.** The hexagon badges' glow (`.hex-trace`/`.hex-frame-glow` in `index.css`) bleeds a few px past their own SVG via `drop-shadow`, and on mobile this pane sits flush against the sliding track's `overflow-hidden` clip boundary with zero buffer, so the first hexagon's glow was getting cut off on its left side. `pl-2` on the History pane's own wrapper div in `CVPage.tsx` (not on `CVTabs.tsx`/`HexBadge` itself) gives it just enough room before the clip edge. Scoped to the mobile pager only — desktop's `CVTabs` render (the unconditional `hidden md:flex` block) has no `overflow-hidden` ancestor to clip against, so it never needed this.

**Changed from the reference:**

- **Removed entirely:** the thin meta line under the name (birth date, gender, nationality flag) — this data isn't in `PublicCVReadModel` currently. Instead, just the gender icon placed neatly after the last name.
- **Header split out:** picture, full name, and gender icon are their own row (`features/cv/components/CVHeader.tsx`) centered above _both_ columns, not inside the left sidebar — confirmed after initial build, since the reference screenshot's identity block reads as page-level, not sidebar-scoped.
- **Address section:** unchanged (still shows `address.country` / `address.city`), flag moved to the right of the text (was left). **Revised the flag rendering itself:** originally used a Unicode flag emoji computed from the country's ISO alpha-2 code (`shared/utils/countryFlag.ts`) — reported back as literally showing the two letters ("BG") instead of a flag image, because Windows' default emoji font doesn't include flag glyphs and falls back to the regional-indicator letters as plain text. Switched to an actual flag image from flagcdn.com (`https://flagcdn.com/24x18/{alpha2}.png`), keyed off the same alpha-2 lookup (`getCountryAlpha2`, the emoji function is kept for any future text-only use but no longer used here) — renders consistently regardless of OS/font. This is a soft external dependency (flagcdn.com must be reachable); acceptable given it's a small, easily-reverted visual choice and a well-established free public service, but flag if you'd rather avoid the external call entirely.
- **Skills section — reworked:**
  - No more progress/level bars (even though `level` exists in the data, it's not displayed)
  - Split into two groups by `SkillDto.type` (`"Tech"` / `"Soft"` — see the string-vs-enum-int correction note above) — Tech displayed first, Soft second
  - Within each group, sub-group by `category` (a free-text string, e.g. "Frontend", "AI Tools") — **categories keep add order, not alphabetical.** `groupByCategory` (`SkillsSection.tsx`) derives the category list via `[...new Set(skills.map(s => s.category))]`, which preserves first-insertion order rather than sorting; reversed from an earlier alphabetical-sort version per Owner feedback, since the admin panel already shows categories in a deliberate add order and alphabetizing them here disagreed with that. Relies on `skills` itself arriving in add order from the backend — the frontend doesn't re-derive or store an explicit order of its own. Backend/data-entry is responsible for normalizing category text (trimmed, Title Case) — the frontend trusts `category` is clean, except for one client-side touch-up: a `/`-separated category (e.g. `"tools/cloud"`) gets spaced out and each segment capitalized (`formatCategory` in `SkillsSection.tsx`) → "Tools / Cloud", since a slash isn't a word boundary the backend's Title-Casing would split on
  - Rendered as simple tags/list, not bars — neutral pill chips (`rounded-full border border-border-default`), same visual language as the Project Detail page's stack tags, with an accent hover state (border + text color) on each chip
  - **Every category is individually expandable/collapsible, own down-arrow toggle per category, animated (`SkillsSection.tsx`'s `CategoryGroup`).** Superseded an earlier version where only the whole Soft group (as one unit) was hidden behind a single reveal button, Tech always fully shown — that read as Soft being second-class rather than just another set of categories, per Owner feedback. Now Tech and Soft categories render in one flat list (Tech first, then Soft, same order as before), each with its own arrow. Same grid-template-rows (`0fr`/`1fr`) height-animation technique `CVTabs` uses for its own tab expand/collapse, not an instant show/hide. **All categories start collapsed** (not expanded) on load — a corrected default after the first pass shipped them all expanded by default, per Owner feedback. Each category's arrow is always `text-accent` (blue), not just on hover — the category label text itself keeps the hover-only accent treatment, only the arrow is unconditionally colored.
- **Languages section:** unchanged from reference (native badge for `isNative`, read/write/speak levels for the rest) — CEFR level values are accent-colored, and the Read/Write/Speak groups get real spacing between them (`gap-x-4`) instead of a single trailing space
- **New tab:** Projects, inserted second in the tab order (after Summary, before Employment History)
- **Project/Job/Education titles colorize on hover** — each list item's own title (not the whole row/block) turns accent-colored when hovering anywhere on that item, via a `group`/`group-hover` pairing. Certificates don't get this treatment the same way since the certificate title _is_ the link (see below) and already has its own hover color.
- **Certificates — link restructured:** the certificate title itself is now the clickable link to `credentialUrl` (default `text-primary`, turns accent on hover) instead of a separate "View Credential" link below it; issuer + date moved onto the same line as the title, separated with an em dash (`— {issuer} · {date}`).
- **Project description is no longer shown here at all.** Went through two earlier versions: first stripped to plain text (matching Home's `PostCard` preview, to avoid showing literal `<p>`/`<ul>` tags as text), then switched to rendering the real HTML via `dangerouslySetInnerHTML` (same styling `ProjectDetailPage` uses) once that stripping was found to be throwing away real bullet lists/formatting the Owner authored. Both were superseded — per Owner feedback, the description doesn't belong in this tab at all, full stop. `CVTabs.tsx`'s Projects tab now shows only the name/state badge, stack tags, and links.
- **A "View Project" link sits first among the row of links (before GitHub/Live Preview), linking to the project's own detail page — now built.** Was flagged as blocked (`CVProjectReadModel` had no `id`, confirmed against `openapi.json` at the time — matching by `project.name` against the full `/Projects` list was considered and rejected, since names aren't guaranteed unique and a wrong match would silently link to the wrong project). The Owner added `id` to the backend contract; `CVProjectReadModel.id` now exists and `CVTabs.tsx` uses it directly, building the route as a template string and passing it to react-router's `Link` component (`Eye` icon) rather than a plain `a` tag, since this is an internal route unlike the GitHub/Live external links next to it. Unconditional — every project has an `id`, so unlike GitHub/Live Preview this link doesn't need a null-check, and the whole links row is no longer gated on `gitHubUrl || liveUrl` being present (it always renders now, since View Project alone is reason enough). Confirmed working via Playwright against real data (not just `tsc`/`build`): both CV renders (mobile pager + desktop) produce a real link to the project's actual id, and the target route resolves.
- **Summary preserves manually-typed line breaks** (`whitespace-pre-wrap`) — `profile.summary` is plain text from a multi-line `<textarea>` (`AutoGrowTextarea`, not TipTap), so any `\n` the Owner typed is real, but a plain `<p>` collapses whitespace by default and silently ate them. Not rich text (no bullets/bold possible here), just respecting the newlines that already exist in the stored string.
- **Employment History (`JobDto.description`) is now rich text too.** Originally a plain single-line `FloatingInput` in the admin Profile editor's Experience tab, which couldn't hold bullet points or line breaks at all — upgraded to the same TipTap `RichTextEditor` Post/Project descriptions use (see `pages/admin/PROFILE.md`'s Experience section for the admin-side details). `job.description` is HTML now, same as `project.description`, and renders the same way here (`dangerouslySetInnerHTML` + the shared list/heading styling), not as plain text.
- **Implementation notes:**
  - `features/cv/types/cvTypes.ts` only defines `PublicCVReadModel`, `PublicAddress`, and `CVProjectReadModel` locally — `JobDto`/`EducationDto`/`CertificateDto`/`SkillDto`/`LanguageDto`/`ContactDto` are reused directly from `features/profile` (identical shapes, already typed there), and `ProjectState`/`PROJECT_STATE_LABELS`/`PROJECT_STATE_BADGE_CLASSES` from `features/projects`, rather than redefining duplicates.
  - **`shared/utils/sortByDateDesc.ts`** — a small generic `(items, getDate) => T[]` helper, shared between this page's Employment/Education/Certificates sorting and the admin Profile array tabs' own identical need (`admin/profile.md`'s Education/Experience/Certificates tabs) — both wanted the exact same "sort a copy by a date field, descending" logic, so it lives in `shared/` rather than being duplicated per-feature. Returns a new array; never mutates the input.
  - **Hexagon tab icons are SVG polygons, not CSS `clip-path`.** First attempt used `clip-path: polygon(...)` on a plain `<div>`; a correctly-proportioned hexagon needs a box wider than tall (~1.15:1, e.g. `h-12 w-14` — a square box visibly squashes it), which was one issue, but the bigger one was the border/glow effect (next bullet): a `clip-path`'d shape has no real usable `border`/stroke, only a filled area, which doesn't support a clean traveling-highlight-along-the-edge effect. Switched to an inline SVG `<polygon>` (`HexBadge` in `CVTabs.tsx`) — same visual shape, but now has a real stroke to animate.
  - **Hexagon border: constant dark-gray outline + a brighter highlight traveling along it — not a filled glow.** The first glow attempt (`.hex-glow`, a second `clip-path`'d layer behind the badge filled with a rotating conic-gradient) looked like a radar sweep instead of a border highlight: a conic-gradient is a full filled area radiating from the center, and clip-path only offsets by bounding-box percentage, not a true geometric outward normal, so the "ring" it left visible around the hexagon's points vs. its flat edges was wildly uneven — thick on the flat top/bottom, nearly gone at the pointed corners. Replaced with two overlaid SVG `<polygon>` strokes on the same path: one constant `stroke-border-default` (always visible, never changes color, even when the tab is active/hovered — only the polygon's _fill_ changes state, per explicit request) and one `stroke-accent` with `stroke-dasharray`/an animated `stroke-dashoffset` (`.hex-trace` in `index.css`) — a short bright dash that continuously travels around the actual outline path. This is the standard SVG "flowing border" technique and doesn't suffer the clip-path ring's unevenness, since a stroke follows the path itself rather than a bounding-box offset.
  - **The focused/expanded hexagon's fill no longer differs from the others** — it used to get a light accent tint (`fill-accent/15`) unconditionally, distinct from the plain `fill-bg-surface` the rest use; now every hexagon's fill is the same regardless of active state (hover still tints it, unchanged). The only remaining "this one's focused" color cue is the icon itself staying `text-accent` (already the case) — plus the trace glow below.
  - **Every hexagon's traveling highlight uses the Contact page's Mail icon glow** (`.hex-trace` in `index.css`, updated in place) — same technique as `.mail-trace`: a `filter: drop-shadow(0 0 3px var(--color-accent))` blur riding the stroke, a half-loop `stroke-dasharray` (`81 81`, half of the hexagon's own ~162-unit perimeter — reuses the existing `hex-trace-dash` keyframe unchanged, since it animates to the hexagon's own `-162` full-loop offset), and a 7s loop. Originally this treatment was exclusive to the focused hexagon only (via a separate `.hex-trace-focused` class, the rest keeping a thinner, glow-less, faster 5s version) — unified onto every hexagon per Owner feedback once the focused-only version was approved as the right direction. The enclosing `<svg>` needs `overflow-visible` for this — its `viewBox` is sized tightly to the hexagon itself, so the glow's blur would otherwise get clipped at the SVG's own edge.
  - **The active/expanded hexagon additionally gets its whole frame lit, not just a traveling segment** (`.hex-frame-glow` in `index.css`, replaces the old `.hex-trace-focused`) — same `stroke-accent` color and drop-shadow blur as `.hex-trace`, but no `stroke-dasharray` at all, so the entire outline is continuously lit instead of a highlight moving along it. Static (no animation) since there's no gap left to travel around. Still drawn at a thicker `strokeWidth` (`2.5` vs. the other hexagons' `1.5`) — "a bit thicker than the other hexagons," per feedback, not a token/CSS-variable-driven value.
  - **Connecting line always spans hexagon-to-hexagon, including through expanded content.** Each tab is a `relative` wrapper (button + optional expanded content); the connector is `absolute`, `top-12` (hexagon's bottom) to `bottom-0` — since `bottom-0` resolves against the wrapper's own actual height, it automatically stretches through however much expanded content is present, rather than a fixed guessed length that fell short once a tab was opened. Consistent spacing between tabs comes from `pb-6` on every wrapper except the last (which also has no connector at all, since there's no next hexagon to reach).
  - **No inner line next to expanded content** — the earlier `border-l` down the left side of an expanded tab's content was removed per feedback; expanded content has no decorative line of its own, only the hexagon-to-hexagon connectors described above.
  - **Hexagon hover:** hovering a tab (`group/tab`) tints its hexagon's fill and colorizes the icon/label, even when collapsed — same treatment as the active/expanded state, so hover previews what "open" looks like.
  - Tab header text: static label for every tab except Summary, whose header is the dynamic `profession` string (matches the reference screenshot, where the first/expanded tab shows the job title, not a literal "Summary" label).

## Edge Cases

- Any CV section with an empty array (e.g. no certificates yet) — assumption: hide that tab entirely rather than showing it empty. Flag if you'd rather show a collapsed/disabled tab instead.
- `profilePictureUrl` is nullable — need a fallback avatar/placeholder if absent
- Ongoing job/education (`endDate: null`) → render as "Present", not blank

## Open Questions / Ask Before Assuming

- None currently outstanding.
