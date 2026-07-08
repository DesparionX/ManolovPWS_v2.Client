# Home Page

## Purpose

Public landing page — displays all posts, feed-style. Pinned posts appear on top. Audience: anonymous visitors (no auth required).

## Data / API

- `GET /Posts` (public) — fetched once on page load, returns the full `PostReadModel[]` array (no pagination currently — see Functionality notes below)
- Client-side split into two lists based on the `isPinned` boolean field: pinned posts first, then the rest
- `GET /Posts/{id}` (public) — called fresh when "View post" is clicked, even though the list already has the full `PostReadModel` for that post. This is deliberate: the detail route must work as a standalone shareable link (someone opening a shared post URL directly won't have the list loaded), so it always fetches independently rather than relying on in-memory list data.

`PostReadModel` shape (confirmed via `openapi.json`):

```ts
interface PostReadModel {
  id: string;
  authorId: string;
  title: string;
  context: string; // plain text for now — see Future Considerations
  thumb: string | null;
  gallery: string[];
  publishedDate: string; // date-only
  updatedDate: string | null;
  isPinned: boolean;
}
```

## Functionality & Interactions

- Guests can scroll and read posts; clicking "View post" opens the full post (own route, fresh `GET /Posts/{id}` fetch)
- Share button: copies the post's direct URL to clipboard (no share sheet / platform icons — kept simple). Show a brief confirmation (e.g. toast/tooltip "Link copied") on click.
- **Endless scrolling is client-side only, not real pagination.** `GET /Posts` returns the entire dataset in one call — there's no `page`/`cursor` param on the backend yet. "Infinite scroll" here means: fetch everything once, then progressively reveal/render more posts client-side as the user scrolls (e.g. render N at a time, load more into view on scroll-near-bottom), purely for perceived performance/UX — not because the server is paging data.
  - **Known limitation:** this doesn't scale indefinitely — if the post count grows large, this approach means downloading the entire post list upfront regardless of how many the user actually scrolls to. Acceptable for now; if the backend later adds real pagination, this page's data-fetching logic will need to be revisited (noted here so it isn't forgotten).

## Design / Visual Notes

- Layout: Facebook-feed style, compact cards, endless scroll (see above)
- Visible per-post: title, published date, thumb (if present), and a preview of `context`
  - Context preview: clamp to ~3 lines (use CSS `-webkit-line-clamp` / `line-clamp` rather than a character-count substring — this stays correct regardless of content length or formatting, which matters once `context` becomes rich text — see Future Considerations)
- Card styling: blurred background, thin greyish border that colorizes on hover
- Pinned posts: same style, but thicker colorized border (always-on, not just hover) to visually distinguish from regular posts
- Loading state: animated skeleton cards, filling the full viewport height (not a fixed count — however many fit)

## Edge Cases

- **No posts returned:** render a single fake/placeholder "post" instead of an empty feed:
  - Title: "Oooops !"
  - Thumb: an illustration of a confused/wondering person
  - Context: "We have no posts yet or DB is dead."
  - No "View post" button on this placeholder (it isn't a real post)

## Future Considerations (not building now, but affects current decisions)

- `context` will eventually be rich text (bold, line breaks, etc. via an editor) instead of plain text. Decided now: use CSS line-clamp for the 3-line preview (not substring/character counting) specifically so this transition doesn't require reworking the truncation logic later.
- If `GET /Posts` gains real backend pagination, this page's "load everything, fake scroll client-side" approach will need to be replaced with real incremental fetching.
