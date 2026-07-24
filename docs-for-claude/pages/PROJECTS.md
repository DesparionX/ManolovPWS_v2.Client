# Projects Page

## Purpose

Public page showcasing all projects, grouped by their current state. Audience: anonymous visitors (no auth required).

## Data / API

- `GET /Projects` (public) — fetched once on page load, returns full `ProjectReadModel[]` array
- Client-side split into 4 groups based on the `state` field, rendered in this fixed order:
  1. `Finished`
  2. `InDevelopment`
  3. `Frozen`
  4. `Abandoned`
- `GET /Projects/{id}` (public) — called fresh when "View Project" is clicked, opening the full project detail route (same reasoning as Posts: must work as a standalone shareable link). Full detail page spec: `pages/PROJECT-DETAIL.md`.

`ProjectReadModel` shape (confirmed via `openapi.json` + `ProjectStateType` enum):

```ts
type ProjectState = "InDevelopment" | "Finished" | "Frozen" | "Abandoned";

interface ProjectReadModel {
  id: string;
  ownerId: string;
  name: string;
  description: string;
  state: ProjectState;
  liveUrl: string | null;
  gitHubUrl: string | null;
  uploadedDate: string; // date-only
  updatedDate: string | null;
  gallery: string[];
  thumb: string; // NOT nullable, unlike Posts.thumb — every project has a thumb
  stack: string[]; // tech stack tags, e.g. ["React", "PostgreSQL"]
}
```

## Functionality & Interactions

- Visitors browse grouped project cards; clicking "View Project" opens the full project detail (own route, fresh `GET /Projects/{id}` fetch)
- Each state group renders under a clear section heading (e.g. "Finished", "In Development", etc.) so grouping is visually obvious, not just ordering
- Full project detail page includes: name, full `description` (untruncated), `gallery` (all images, not just thumb), `stack` tags, `uploadedDate`/`updatedDate`, and two external links:
  - GitHub link — only rendered if `gitHubUrl` is not null
  - Live preview link — only rendered if `liveUrl` is not null
  - If neither is present, show neither button (no placeholder/disabled state needed)

## Design / Visual Notes

- Cards: same glassmorphism treatment as Home's `PostCard` — thin, low-opacity neutral border (`border-border-default/50`, no hover-colorization), `rounded-xl`, `bg-bg-surface/60` + `backdrop-blur-md`
- **Per-state animated border glow:** each card is wrapped in `.state-glow` (`index.css`, generalized from the Home feed's pinned-post glow — a slow-traveling comet around the card's edge, `border-angle-spin`, 6s loop, respects `prefers-reduced-motion`), colored via an inline `--glow-color` custom property sourced from `PROJECT_STATE_GLOW_COLORS` (`features/projects/types/projectTypes.ts`). Color-per-state mapping finalized in `THEME.md`'s Project State Colors section: `Finished` → `success` green, `InDevelopment` → `accent` cyan, `Frozen` → `frozen` indigo, `Abandoned` → `danger` red.
- Visible per-card: project thumb, project name, short description (2-line clamp — same `line-clamp` approach as Home's post preview, for consistency and future-proofing), "View Project" button
- Description truncation: `line-clamp-2` (CSS), not character counting — matches the reasoning already established in `pages/HOME.md`
- **Each state group gets its own glassed panel**, not just a bare heading + grid: `rounded-xl border border-border-default/50 bg-bg-surface/40 backdrop-blur-md` wrapping that state's cards, with the section label sitting directly on the panel's top border (`absolute -top-3 left-6 bg-bg-surface px-3`, same "legend cuts into the border line" technique already used for the admin nav's collapse toggle and the Post/Project Detail back-buttons) — reads as a distinct grouped region per state, not just a plain label above a shared background.
- Section heading label: `text-sm font-semibold`, fixed render order (Finished, In Development, Frozen, Abandoned) via `STATE_ORDER` in `pages/ProjectsPage.tsx`, labels from the existing `PROJECT_STATE_LABELS` map (`features/projects/types/projectTypes.ts`)
- **Not building here:** infinite/client-side scroll reveal like Home's feed — not called for in this doc, and portfolios are expected to have far fewer entries than a blog feed, so all groups just render in full

## Edge Cases

- **A state group with zero projects:** don't render an empty section heading with nothing under it — hide groups that have no projects rather than showing an empty "Frozen" heading with no cards
- **No projects at all:** resolved — reuses the exact same placeholder pattern as Home's "Oooops!" (same `Frown` icon, same title), with project-specific body copy ("We have no projects yet or DB is dead.") instead of copy-pasting Home's post-specific wording. Confirmed: visual/tonal consistency with Home was preferred over a bespoke project-specific design.

## Open Questions / Ask Before Assuming

None currently outstanding — empty-state design and card visual treatment are both resolved above.
