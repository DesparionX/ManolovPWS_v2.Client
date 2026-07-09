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
- `GET /Projects/{id}` (public) — called fresh when "View Project" is clicked, opening the full project detail route (same reasoning as Posts: must work as a standalone shareable link)

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

- Cards: "futuristic" aesthetic — exact visual treatment depends on `THEME.md`'s still-open accent color / border-radius decisions; once those are locked in, apply here too for consistency with Home's card style
- Visible per-card: project thumb, project name, short description (2-line clamp — same `line-clamp` approach as Home's post preview, for consistency and future-proofing), "View Project" button
- Description truncation: `line-clamp-2` (CSS), not character counting — matches the reasoning already established in `pages/home.md`
- Section headings for each state group — visual weight/style TBD alongside `THEME.md` decisions, but should make the grouping scannable at a glance

## Edge Cases

- **A state group with zero projects:** don't render an empty section heading with nothing under it — hide groups that have no projects rather than showing an empty "Frozen" heading with no cards
- **No projects at all:** TBD — should this reuse the same "Oooops!" placeholder pattern from Home, or something project-specific? (flagging rather than assuming, since the tone/copy should probably differ from the Posts placeholder)

## Open Questions / Ask Before Assuming

- Empty-state placeholder copy/design for "no projects at all" (see Edge Cases)
- Futuristic card visual treatment depends on `THEME.md`'s accent color / border-radius decisions being finalized
