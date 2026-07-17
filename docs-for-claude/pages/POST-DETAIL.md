# Post Detail Page

## Purpose

Standalone view of a single post, reached via the Home feed's "View post" button or a direct/shared link (`/posts/:id`). Audience: anonymous visitors (no auth required) — same public audience as Home.

## Data / API

- `GET /Posts/{id}` (public, per `AUTH.md`'s Endpoint Auth Reference) — fetched fresh on this route via `usePost(id)` (`features/posts/api/usePost.ts`), the same hook the admin Post Editor already uses. Always fetches independently rather than trusting Home's already-loaded list, since this route must work as a standalone shareable link (see `pages/HOME.md`).
- `PostReadModel` shape — see `pages/HOME.md` (same model, no separate type needed).

## Functionality & Interactions

- Route: `posts/:id`, public, sibling of the other top-level public routes in `app/router.tsx` (not under `/admin`).
- "Back to posts" link at the top, returns to `/`.
- Share button: copies this post's direct URL (`{origin}/posts/{id}`) to the clipboard and shows the shared success Toast ("Link copied") — same `notificationController.showSuccess` used by the global save-toast, and the same behavior as the Home feed card's share button (`features/posts/components/PostCard.tsx`).
- Loading: simple centered "Loading post..." text (this is a single-item fetch, not a list — no skeleton grid needed here unlike Home).
- Not found / error: centered "This post couldn't be found." message (covers both a real 404 and a fetch error — the API doesn't need to distinguish these client-side, both mean "can't show this post").

## Design / Visual Notes

- Single centered card, `max-w-2xl`, same glassmorphism/border treatment as `PostCard` (`THEME.md`'s Effects section): `border-2 border-accent` if pinned, otherwise `border border-border-default` (no hover-colorization here — hover-to-colorize is a list-affordance for "this is clickable," not meaningful on the page you're already on).
- Full `context` HTML rendered directly (`dangerouslySetInnerHTML`) — unlike the feed card's stripped-to-text preview, this is the full post, not a preview, so the original TipTap formatting (headings, lists) should render as authored. Since `context` is only ever authored by the Owner (single-user app, no third-party input), this doesn't carry the usual dangerouslySetInnerHTML/XSS risk of untrusted content.
- Gallery images (if any) rendered as a simple responsive image grid below the content — no lightbox/carousel for now, out of scope unless asked.
- Thumb (if present) shown as a wide banner image (`h-72 object-cover`) above the title, wider than the feed card's thumb since this is the full-page view.

## Edge Cases

- No thumb: content starts directly at the title/meta row, no broken-image placeholder.
- No gallery: gallery grid section simply isn't rendered.
- Invalid/nonexistent `id`: falls into the same not-found message as a fetch error (see above) — no distinct "invalid ID format" client-side check, the backend 404 covers it.
