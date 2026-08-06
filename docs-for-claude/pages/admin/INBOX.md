# Admin: Inbox Page

Route: `/admin/inbox` (per `admin-layout.md`). Owner-only list of all contact messages. Full message content lives on its own route — see `MESSAGE-DETAIL.md`.

## Purpose

List, open (read), and delete messages sent via the public Contact page. No replies, no editing — matches the backend's deliberately minimal Message model.

## Data / API

- `GET /Inbox/messages` (protected) — returns `MessageReadModel[]`, the full list
- `DELETE /Inbox/messages/{id}` (protected) — removes the message, requires confirmation (same pattern as `admin/posts.md`/`admin/projects.md`)
- `PUT /Inbox/messages/{id}` (marking as read) is **not** called from this page — it fires from `MESSAGE-DETAIL.md`'s page instead, the moment a message is actually opened

`MessageReadModel` shape (confirmed via `openapi.json`):

```ts
interface MessageReadModel {
  id: string;
  senderName: string;
  senderEmail: string;
  senderMetadata: { ipAddress: string; userAgent: string };
  title: string;
  context: string; // plain text, may contain \n line breaks — see contact.md
  sentDate: string; // ISO date-time
  isUnread: boolean;
}
```

## Functionality & Interactions

- List sorted by `sentDate`, newest first (same convention as `admin/posts.md`/`admin/projects.md`)
- **Table/list view, same borderless-list-with-divider pattern as `admin/posts.md`/`admin/projects.md`** — a row shows only the message **title** and, next to it, **who it's from** (`senderName`), plus a visual unread indicator (a dot) when `isUnread` is true. No preview text, no date, no sender email in the row — those live on the detail page only.
- **The whole row is clickable** — same action as the Read icon (navigates to `/admin/inbox/{id}`, see `MESSAGE-DETAIL.md`). Posts/Projects rows are clickable the same way now too (same reasoning: hover-revealed-only icons are unreachable on touch devices).
- **Per-row actions (hover-revealed, matching Posts/Projects exactly):**
  - **Read** (`Eye` icon) — same navigation as clicking the row itself; kept as an explicit icon too (not just the row) for clarity and for touch devices, where hover-revealed-only affordances are awkward. Its click handler calls `stopPropagation()` so it doesn't double-fire the row's own click. Does not itself call any endpoint — marking as read happens on the detail page.
  - **Delete** (`Trash2` icon) — opens `ConfirmDialog`; on confirm, calls `DELETE /Inbox/messages/{id}`. Also calls `stopPropagation()`, so clicking Delete doesn't also trigger the row's navigate-to-Read behavior.
- **Mobile: row actions also reveal on press-and-hold, and stay revealed after releasing** — `shared/hooks/useLongPressReveal.ts` (shared with Posts/Projects/Profile's array-tab lists), not plain CSS `:active` (which would revert the instant a finger lifts, before there's time to actually reach Read/Delete). The row also gets `select-none` so the hold doesn't trigger the native text-selection callout, and once revealed the icons take their eventual hover colors (accent/danger) immediately rather than staying secondary-gray — there's no hover-then-preview-color step on a touchscreen.
- **Tapping anywhere outside the revealed row dismisses it** — see `posts.md`'s equivalent bullet for the mechanism (`data-long-press-id` + a document-level `pointerdown` listener in `useLongPressReveal.ts`); same behavior here.
- **No expand-in-place.** An earlier version expanded a row inline to show full details (reusing `admin/profile.md`'s array-tab interaction pattern). Replaced with a real route per Owner feedback — reads more consistently with how Posts/Projects work, and gives a message its own shareable/bookmarkable/back-navigable URL.
- **Unread count / badge:** computed client-side from the already-fetched list (`messages.filter(m => m.isUnread).length`) — no separate count endpoint needed. This same computed value drives **two** UI locations that must stay in sync:
  1. The Inbox item in `admin-layout.md`'s inner nav
  2. The icon near the logout button in the main app Header (`STRUCTURE.md`'s `shared/layout`)

  Both should read from the **same shared TanStack Query cache entry** (same query key) rather than each fetching independently — this keeps them trivially consistent and avoids duplicate network requests. The Header's query should only run when `authStore.isAuthenticated()` is true (per `AUTH.md`) — no point calling a protected endpoint while signed out. This cache entry gets invalidated (kept fresh) globally whenever `MESSAGE-DETAIL.md`'s page reads a message — see that doc's Functionality section for the mechanism.

## Design / Visual Notes

- Same borderless-list-with-divider styling established in `admin/posts.md`/`admin/projects.md`, for visual consistency — row actions fade in on hover (`opacity-0 group-hover:opacity-100`), same as those pages. **Divider between rows is shorter than the row itself** (`w-4/5`, centered) rather than a full-bleed `divide-y` edge, and **row content (unread dot + title) is horizontally centered** via the same `grid-cols-[1fr_auto_1fr]` row structure as Posts/Projects, not left-aligned — see the Implementation Notes below.
- Unread messages: a small solid accent dot to the left of the row, plus bolder title text
- No "New" action — unlike Posts/Projects, messages aren't created by the Owner, only received

## Implementation Notes

- **`features/inbox/api/useMessages.ts`** is the single hook this page, `AdminLayout.tsx`'s nav badge, and `shared/layout/Header.tsx`'s sign-out-area badge all call — same query key (`queryKeys.inbox.all`), so every location always agrees without extra fetches. The hook gates on `authStore.isAuthenticated()` via `useSyncExternalStore` (reactive, not a one-time check) since `Header` renders on every route, including signed-out public pages, and `/Inbox/messages` is protected. **`MESSAGE-DETAIL.md`'s page does *not* use this hook** — it fetches its own data via its own query (`useReadMessage`, keyed by id), by explicit design rather than reading from this list's cache.
- Row structure/action styling copied directly from `PostsPage.tsx`'s row markup (`group`, hover-revealed action buttons, `grid-cols-[1fr_auto_1fr]` centered layout, `Fragment`-wrapped shortened divider between rows) rather than reusing `ListEditor` — that component is built around editable array items with add/save/validate, which never fit Inbox's read-only list/delete flow even before the detail route existed.

## Edge Cases

- No messages at all — empty state, consistent with the empty-state pattern used in `admin/posts.md`/`admin/projects.md`
- Deleting a message currently open on its detail page (e.g. two tabs, or deleted then browser back) — see `MESSAGE-DETAIL.md`'s Edge Cases

## Open Questions / Ask Before Assuming

- None currently outstanding.
