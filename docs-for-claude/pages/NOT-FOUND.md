# Not Found (404)

## Purpose

Friendly fallback for any URL that doesn't match a real route — public visitor and Owner alike. Applies mobile and desktop identically; no separate treatment needed, the layout is a single centered card that scales naturally at any width.

## Data / API

None — pure client-side routing fallback, no backend call.

## Functionality & Interactions

- Any unmatched path (`path: '*'` in `router.tsx`, last child under `Layout`) renders `NotFoundPage` instead of React Router's default unstyled error boundary
- One action: "Back to Home" link to `/`
- Nested under `Layout`, not `App` directly — Header/Footer/animated background still render around it, same chrome as every real page, rather than a bare unstyled fallback

## Design / Visual Notes

- Same glassmorphism card + icon + heading + subtext convention as `HomePage.tsx`'s `EmptyPlaceholder` ("Oooops!", no posts yet) — a big `404` numeral above the heading is the only addition, `Compass` icon (lost/navigation motif, distinct from `EmptyPlaceholder`'s `Frown`)
- Centered both horizontally and vertically within the available viewport height (`Container` given `flex flex-1 flex-col items-center justify-center` rather than a magic `min-h-[Npx]` guess — `Layout.tsx`'s `<main>` is already `flex flex-1`, so this stretches to fill whatever space Header/Footer leave and centers the card within it)
- "Back to Home" button reuses the same style as Post/Project cards' "View post"/"View Project" buttons (`rounded-lg border border-border-default px-4 py-2 text-sm ... hover:border-accent`) for visual consistency

## Edge Cases

- `/admin/<unmatched>` (a bad path under the admin prefix) also falls through to this same catch-all — `RequireAuth`'s children don't match it, and React Router bubbles up to the top-level `*` route the same as any other unmatched path.

## Not Built: 403 (Forbidden)

Deliberately **not** built, after confirming with the Owner. `AUTH.md` documents that unauthenticated access to `/admin/*` silently redirects to `/` (`RequireAuth.tsx`) specifically so a random visitor probing URLs never learns an admin panel/login exists at all — showing a "403 Forbidden" page instead would leak exactly that. Since nothing else in this single-Owner app has a legitimate "you don't have permission" scenario, a 403 page would have no route that ever reaches it — dead code. If a real need for one shows up later, it needs the same conversation again (whether it's worth the leak), not a silent revival.
