# Page Doc Template

Copy this structure for every new file under `docs-for-claude/pages/`. Delete sections that genuinely don't apply to a given page rather than leaving them empty.

---

# <Page Name>

## Purpose

What this page is for, in a sentence or two. Who's the audience (public visitor vs Owner)?

## Data / API

- Which endpoint(s) this page calls (reference `openapi.json` operation, e.g. `GET /Posts`)
- Auth requirement (per `AUTH.md`'s Endpoint Auth Reference — public, protected, or conditional)
- Any client-side data shaping/derivation needed beyond what the API returns

## Functionality & Interactions

- User-facing behavior: what can they do here, what happens on each action
- Loading / empty / error states
- Any client-side validation (React Hook Form + Zod schema, if applicable)

## Design / Visual Notes

- Layout description, or reference to a screenshot/screen recording if provided
- Key visual/interactive details (animations, hover states, responsive behavior)
- If this page is being ported from the old Angular version, note that and link/attach the reference material

## Edge Cases

- Anything unusual to handle (e.g. empty states, permission edge cases, race conditions)
