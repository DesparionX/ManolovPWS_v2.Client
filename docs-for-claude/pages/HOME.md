# Home Page

## Purpose

Public landing page — displays all posts, feed-style. Pinned posts appear on top. Audience: anonymous visitors (no auth required).

## Data / API

- `GET /Posts` (public) — fetched once on page load, returns the full `PostReadModel[]` array (no pagination currently — see Functionality notes below)
- Client-side split into two lists based on the `isPinned` boolean field: pinned posts first, then the rest
- `GET /Posts/{id}` (public) — called fresh when "View post" is clicked, even though the list already has the full `PostReadModel` for that post. This is deliberate: the detail route must work as a standalone shareable link (someone opening a shared post URL directly won't have the list loaded), so it always fetches independently rather than relying on in-memory list data. Full detail page spec: `pages/POST-DETAIL.md`.

`PostReadModel` shape (confirmed via `openapi.json`):

```ts
interface PostReadModel {
  id: string;
  authorId: string;
  title: string;
  context: string; // HTML from the admin Post Editor's TipTap rich-text field — see Future Considerations
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
  - Context preview: clamp to **9 lines** (`line-clamp-9`, use CSS `-webkit-line-clamp` / `line-clamp` rather than a character-count substring — this stays correct regardless of content length or formatting, which matters once `context` becomes rich text — see Future Considerations). Bumped up from an original `line-clamp-3` per Owner feedback — 3 lines read as barely more than the title itself; 9 gives a real preview. **Renders the real HTML (`dangerouslySetInnerHTML`), not stripped-to-text** — `line-clamp-9` only visually hides overflow (`-webkit-line-clamp` never touches the DOM/HTML string), so clamping actual rendered markup is exactly as safe as clamping plain text, and the preview no longer silently drops bullet lists/headings the Owner authored. Same styling hooks as the detail pages' rich-text blocks (`[&_h2]:...`/`[&_ol]:...`/`[&_ul]:...`, see `POST-DETAIL.md`), plus `[&_p:empty]:min-h-lh` so manually-typed blank lines actually show — see `POST-DETAIL.md`'s "blank lines weren't visible" bug for why that's needed.
- Card styling: blurred background, thin greyish border that colorizes on hover
- Pinned posts: same style, but thicker colorized border (always-on, not just hover) to visually distinguish from regular posts
- **Card header layout (`PostCard.tsx`), applies to both mobile and desktop:** title centered, published date directly below it (also centered) — not down at the bottom of the card with the actions. Pin badge (when pinned) sits absolutely positioned top-left; the Share button mirrors it top-right, in that same header row/block rather than down in the action row. Below the thumb/context preview, only the "View post" button remains in the action area, and it's centered (`flex justify-center`) now that Share isn't sharing that row with it anymore.
  - **Real bug, fixed: a long title overlapped the pin badge and share button instead of wrapping around them.** The `<h2>` had no width constraint, so a long title's box just grew to fit its own text (shrink-to-fit, the default for a block child inside a centered flex column) — nothing stopped that box from running under the absolutely-positioned icons at each corner. Fixed by giving the title `w-full truncate px-8`: `w-full` gives it an actual width to overflow against (truncate needs a real box edge, not shrink-to-fit content), and `px-8` reserves clearance wider than the icons' own inset so the ellipsis always lands clear of both, never underneath either one.
- **Thumb shows the whole image, flush against the card's edges, with a flexible height that follows the image's own aspect ratio.** Went through two versions: first a fixed `h-48 w-full object-contain` (whole image visible, but pillarboxed — blank space on the sides whenever the image's own aspect ratio was narrower than the box's, so it no longer touched the card's left/right edges). Reversed per Owner feedback: no fixed height and no `object-fit` at all now, just `w-full` — Tailwind Preflight already sets `<img>` height to `auto`, so the browser sizes the image purely off its own intrinsic aspect ratio. Width always spans edge-to-edge flush against the card (nothing constrains it independently), height follows proportionally, so the whole thumb is always visible with nothing cropped and no pillarboxing gap — a portrait image just makes for a taller card, a landscape one a shorter one, which is the intended tradeoff for always showing the complete image at its own proportions.
- Loading state: animated skeleton cards, filling the full viewport height (not a fixed count — however many fit)

## Edge Cases

- **No posts returned:** render a single fake/placeholder "post" instead of an empty feed:
  - Title: "Oooops !"
  - Thumb: an illustration of a confused/wondering person
  - Context: "We have no posts yet or DB is dead."
  - No "View post" button on this placeholder (it isn't a real post)
  - **Placeholder decision:** no illustration asset exists yet in `src/assets/` for "confused/wondering person" — using lucide-react's `Frown` icon as a stand-in until a real illustration is supplied. Swap it out once one exists; flag if you'd rather commission/pick the illustration now instead.

## Future Considerations (not building now, but affects current decisions)

- **Update:** `context` is now confirmed as TipTap-authored HTML (built alongside the admin Post Editor), not plain text — the note above about "eventually rich text" already happened.
- **Reversed: the 3-line card preview no longer strips tags to plain text first.** The original approach ran content through `stripHtmlToText` before clamping, on the assumption that showing literal `<p>`/`<ul>` tags as text would look broken — reasonable-sounding, but wrong in practice: it silently threw away real bullet lists/formatting the Owner authored, and turned out to be an unnecessary precaution anyway, since `line-clamp-3` only visually hides overflow rather than truncating the underlying HTML string (nothing about rendering real markup risked a malformed cut mid-tag). `stripHtmlToText` was deleted from `richTextUtils.ts` once nothing referenced it — `PostCard`/`ProjectCard` render `post.context`/`project.description` directly via `dangerouslySetInnerHTML`, same as the detail pages.
- If `GET /Posts` gains real backend pagination, this page's "load everything, fake scroll client-side" approach will need to be replaced with real incremental fetching.
