# Admin: Inbox Page

Route: `/admin/inbox` (per `admin-layout.md`). Owner-only view of all contact messages.

## Purpose

View, read, and delete messages sent via the public Contact page. No replies, no editing — matches the backend's deliberately minimal Message model.

## Data / API

- `GET /Inbox/messages` (protected) — returns `MessageReadModel[]`, the full list
- `PUT /Inbox/messages/{id}` (protected) — no request body; marks the message as read server-side, returns the updated `MessageReadModel`
- `DELETE /Inbox/messages/{id}` (protected) — removes the message, requires confirmation (same pattern as `admin/posts.md`/`admin/projects.md`)

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
- **Row summary (collapsed):** sender name, title, a short preview of `context` (line-clamped, same pattern as Home's post preview), sent date, and a visual unread indicator (e.g. bold text or a dot) when `isUnread` is true
- **Expand-in-place on click** (not a separate route/detail page) — reuses the same "list editor" interaction pattern established in `admin/profile.md`'s array sections: click a row, it expands to show full details inline. No navigation, no new route needed for a feature this simple.
- **Marking as read:** the moment a message is opened (expanded), fire `PUT /Inbox/messages/{id}` immediately — no separate "mark as read" button. Only fire it if the message is currently unread (mirrors the backend handler's own idempotency guard — no need to re-call this on every re-open of an already-read message).
- **Delete:** requires confirmation before calling `DELETE /Inbox/messages/{id}`, same pattern as every other delete action in the admin panel
- **Expanded view shows `senderMetadata`** (IP address, User-Agent) — useful for spotting spam/abuse patterns, deliberately not hidden
- **Unread count / badge:** computed client-side from the already-fetched list (`messages.filter(m => m.isUnread).length`) — no separate count endpoint needed. This same computed value drives **two** UI locations that must stay in sync:
  1. The Inbox item in `admin-layout.md`'s inner nav
  2. The icon near the logout button in the main app Header (`STRUCTURE.md`'s `shared/layout`)

  Both should read from the **same shared TanStack Query cache entry** (same query key) rather than each fetching independently — this keeps them trivially consistent and avoids duplicate network requests. The Header's query should only run when `authStore.isAuthenticated()` is true (per `AUTH.md`) — no point calling a protected endpoint while signed out.

## Design / Visual Notes

- Same borderless-list-with-divider styling established in `admin/posts.md`/`admin/projects.md`, for visual consistency
- Unread messages visually distinguished from read ones (bold, a colored dot, or similar) — exact treatment TBD alongside `THEME.md`
- Expanded message view: sender name/email, title, full context (with line breaks preserved, same rendering approach as `contact.md`), sent date, sender metadata (IP/User-Agent), delete action

## Edge Cases

- No messages at all — empty state, consistent with the empty-state pattern used in `admin/posts.md`/`admin/projects.md`
- Deleting a currently-expanded message — collapse/remove it from view immediately after confirmed deletion, don't leave a stale expanded panel referencing a now-deleted message

## Open Questions / Ask Before Assuming

- None currently outstanding.
