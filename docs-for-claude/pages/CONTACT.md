# Contact Page

## Purpose

Public page with a simple form for visitors to send the Owner a message. No auth required. No replies, no editing, no reply-to functionality — fire-and-forget, per the backend's design (see `docs-for-claude` backend `CLAUDE.md`'s Contact module notes).

## Data / API

- `POST /Contact/messages` (public) — request body (`NewMessageRequest`):
  ```ts
  {
    title: string;
    context: string;
    senderName: string;
    senderEmail: string;
  }
  ```
  Response: `MessageReadModel` (200/201) — full details in `pages/admin/inbox.md`, not needed by this page beyond confirming success.
- **`senderMetadata` (IP + User-Agent) is never sent by the client** — captured server-side from `HttpContext` for the anti-flood check. The frontend has no fields for it and should never attempt to read/send IP or User-Agent itself.
- Lives under its own `ContactController`, deliberately separate from `InboxController` (see `AUTH.md`'s Endpoint Auth Reference) — this endpoint is the only public action anywhere near the Contact/Inbox feature.

## Functionality & Interactions

- Simple form: Title, Message, Your Name, Your Email, Submit button
- **Cooldown handling: reactive, not proactive.** No client-side timer disabling the form after a send — the visitor can attempt to submit again anytime; if they're within the backend's 5-minute anti-flood window, the request fails and the error (`ContactAppErrors.CannotSpam`) surfaces through the existing global `ApiError` modal (per `API-CLIENT.md`) like any other failure. No special-cased cooldown UI needed.
- **On successful send:** replace the form with a confirmation view (not a toast, not a silent clear) — see Design notes. The confirmation explicitly tells the visitor they can't send another message for 5 minutes, and offers a button back to Home. Clicking that button navigates to `/` — not automatic/timed, the visitor chooses when to leave.

## Validation Rules

| Field                      | Required | Rules                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| -------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Title                      | Yes      | 3–50 chars                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| Message (`context`)        | Yes      | 3–10,000 chars. **Plain text only, no rich text/HTML** — deliberately simpler than Post/Project's TipTap fields, since this field accepts input from anonymous, potentially adversarial visitors (unlike Post/Project content, which only the authenticated Owner ever writes). Preserve line breaks visually (e.g. CSS `white-space: pre-wrap`, or split on `\n` into separate paragraphs with the text properly escaped) — never render via `dangerouslySetInnerHTML` or any raw-HTML injection path for this field. |
| Your Name (`senderName`)   | Yes      | 2–30 chars                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| Your Email (`senderEmail`) | Yes      | Valid email format — backend validates via .NET's `MailAddress`/mail library, so frontend validation should be reasonably strict (a proper email regex), not just checking for `@`                                                                                                                                                                                                                                                                                                                                     |

## Design / Visual Notes

- Reuses the same field styling conventions established in `admin/profile.md`: floating labels, cornered borders colorized on focus, colorized shadow on hover, validation errors under each field
- Confirmation view (post-submit): friendly, reassuring tone — not just a bare "Success" label. Should clearly state:
  1. The message was sent
  2. A note that another message can't be sent for 5 minutes (matches the backend's real constraint, sets accurate expectations rather than the visitor wondering why a second attempt might fail)
  3. A button (e.g. "Back to Home") that navigates to `/`
- Styling/exact copy TBD alongside `THEME.md`, consistent with the rest of the app's visual language

## Edge Cases

- Submitting while within the cooldown window from a _previous session_ (e.g. visitor closed the tab and came back 2 minutes later) — same as any other cooldown hit, surfaces via the global error modal; the frontend has no memory of the previous send (nothing stored client-side), so this is naturally handled by the reactive approach without extra logic
- Network failure mid-submit — standard `ApiError`/global error modal handling, no special case needed

## Open Questions / Ask Before Assuming

- None currently outstanding.
