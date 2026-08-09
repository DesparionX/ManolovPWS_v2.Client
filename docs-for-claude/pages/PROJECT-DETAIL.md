# Project Detail Page

## Purpose

Standalone view of a single project, reached via the Projects page's "View Project" button or a direct/shared link (`/projects/:id`). Audience: anonymous visitors (no auth required) — same public audience as `pages/PROJECTS.md`.

## Data / API

- `GET /Projects/{id}` (public, per `AUTH.md`'s Endpoint Auth Reference) — fetched fresh on this route via `useProject(id)` (`features/projects/api/useProject.ts`), the same hook the admin Project Editor already uses. Always fetches independently rather than trusting the Projects list's already-loaded data, since this route must work as a standalone shareable link (same reasoning as `pages/POST-DETAIL.md`).
- `ProjectReadModel` shape — see `pages/PROJECTS.md` (same model, no separate type needed).

## Functionality & Interactions

- Route: `projects/:id`, public, sibling of the other top-level public routes in `app/router.tsx` (not under `/admin`).
- "Back to projects" circular icon button returns to `/projects` (not `/`, unlike Post Detail's back button — Projects has its own dedicated list route, Home is not that list).
- Shows: name, current state label (`PROJECT_STATE_LABELS[project.state]`), full `description` (untruncated HTML, same rendering approach as Post Detail), `stack` tags, full `gallery` (all images, not just thumb), GitHub link (only if `gitHubUrl` is not null), Live Preview link (only if `liveUrl` is not null — neither renders if both are null, per `pages/PROJECTS.md`), `uploadedDate`/`updatedDate`.
- No share button — not requested for Projects (unlike Posts), so not added here.
- **Gallery images open in a lightbox**, not a new tab/window: each gallery image is a button that opens `shared/components/Lightbox.tsx` — a full-screen overlay showing the image at full size, with a close ("×") button, Previous/Next navigation (only rendered when there's more than one image), left/right arrow-key and Escape-key support, and click-outside-the-image-to-close (the overlay itself closes on click; the image and nav buttons `stopPropagation` so clicking them doesn't bubble up and close it). Built as a generic shared component (not Project-specific) so Post Detail's gallery could reuse it later if asked, though it's only wired up here for now.
- Loading: simple centered "Loading project..." text.
- Not found / error: centered "This project couldn't be found." message (covers both a real 404 and a fetch error, same reasoning as Post Detail).

## Design / Visual Notes

- Single centered card, `max-w-2xl`, same glassmorphism treatment as `ProjectCard` and Post Detail: thin, dark, low-opacity border (`border-border-default/50`) — no pinned concept for projects, so no special border/glow case here.
- Title row: name centered, state label beneath it in smaller muted text — no left/right icons here (no pin, no share), so simpler than Post Detail's three-part row.
- "Back to projects" button: circular, sits on the card's left border (`-translate-x-1/2`, solid `bg-bg-surface` so it visually interrupts/blends with the border) **on desktop only now** — vertically positioned at half the thumb's height (`md:top-69` = outer `py-10` + this page's two-line title block + half of the still-fixed `h-72` thumb; this page's thumb wasn't changed when Home/Post Detail's thumbs became flexible-height, so that math still holds), or the header row otherwise (`md:top-16`).
  - **Mobile-only real bug, fixed: the button was clipped along its left edge.** The `-translate-x-1/2` bleed assumes a comfortable margin outside the `max-w-2xl` column to bleed into — true on desktop, where that column sits well inside `Container`'s own edges, but on mobile the column fills `Container`'s full available width, so the same bleed pushed the button ~2px past the actual viewport edge. Invisible before `body` got `overflow-x: hidden` (`index.css`, added for an unrelated reason — the Message Detail page's overflow bug, see `admin/message-detail.md`), hard-clipped into a visibly flat-edged circle since. Fixed with a responsive split: `left-1` (no bleed) below `md`, `md:left-0 md:-translate-x-1/2` (the original bleed) at `md` and up — there's no visible border for this button to straddle on mobile anyway (unlike, say, the CV/Projects pager arrows, which sit exactly on a panel's own visible border line), so simply keeping it fully on-screen there doesn't lose anything the desktop version's straddle was actually communicating.
  - **Superseded by a further mobile-only reversal per Owner feedback, applied here for consistency with Post Detail's identical button (see `pages/POST-DETAIL.md` for that page's own version of this same change).** Mobile now uses `fixed top-1/2 -translate-y-1/2 left-4` instead of `absolute left-1` at the thumb-relative/header-relative `top-*` — pinned to the viewport and centered on its vertical middle, same technique `pages/PROJECTS.md`'s pager arrows use, rather than sitting at a position computed from the thumb or header. `md:translate-y-0` cancels that centering translate back out at desktop, where `top-69`/`top-16` remain real, intentional positions rather than something to center around. Desktop is otherwise completely unaffected by this change — confirmed via `getBoundingClientRect()`, same `position: absolute` and same computed `top` as before.
- Stack tags: small pill badges (`rounded-full border border-border-default`), same visual language as `TagInput`'s chips in the admin Project Editor.
- GitHub/Live Preview links: since lucide-react's icon set doesn't include a literal GitHub brand mark in the installed version, `GitFork` is used as a stand-in (reads as "code repository" clearly enough) — swap for a proper brand icon later if one becomes available/desired. `Globe` represents the Live Preview link.
- `description` full HTML rendered directly (`dangerouslySetInnerHTML`), same reasoning as Post Detail: only ever authored by the Owner (single-user app), so no third-party-content XSS concern. `[&_p:empty]:min-h-lh` on this container too — see `POST-DETAIL.md`'s "blank lines weren't visible" bug for why (an empty `<p>` is how a manually-typed blank line saves, and without this it silently rendered at zero height).

## Edge Cases

- No gallery images: gallery grid section simply isn't rendered (mirrors Post Detail).
- Neither `gitHubUrl` nor `liveUrl` set: the whole links row isn't rendered — no empty/disabled button placeholders (per `pages/PROJECTS.md`'s explicit rule).
- Invalid/nonexistent `id`: falls into the same not-found message as a fetch error — no distinct client-side "invalid ID format" check.
