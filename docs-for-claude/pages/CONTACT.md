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

## Implementation Notes

- Built with the same React Hook Form + Zod pattern as `pages/SIGN-IN.md` (the only other fully-public, non-autosave form in the app) — `FloatingInput` fields spread `register(...)` directly, `zodResolver` drives client-side validation matching the Validation Rules table above.
- **The card is vertically centered on the page** (`items-center justify-center` on the page's root flex container, `py-12` instead of a fixed `pt-16`/`pt-24` top offset) — an earlier version top-anchored it with `items-start` plus that top padding, which on short-content/tall-viewport combinations left it reading as glued to one edge rather than centered in the available space between `Header` and `Footer` (`shared/layout/Layout.tsx`'s `<main className="flex flex-1 flex-col">`).
- **`useForm({ mode: "onBlur", reValidateMode: "onChange" })`** — RHF's own default (`mode: "onSubmit"`) only validates on the first submit attempt, so a field's error never appeared just from filling it out and moving on; the Owner has to actually click Send once before seeing anything, even on an obviously-invalid field. `onBlur` validates each field the moment focus leaves it; `reValidateMode: "onChange"` (RHF's own default for that option) then keeps a field that's already showing an error updating live as it's corrected, rather than needing another blur.
- **Unlike Sign In, this mutation does *not* set `meta.suppressGlobalError`** — per the Functionality section above, API failures (most notably the cooldown `CannotSpam` error) are meant to surface through the shared global `ErrorModal`, not an inline page-level message. Sign In opts out of the global modal because a redirect-driven flow was tearing it down before it could be read; nothing like that applies here, so the default global-modal behavior is correct as-is.
- **`AutoGrowTextarea` extracted to `shared/components/`** for the Message field — it previously lived only inside `features/profile/components/ProfileMainTab.tsx` (hardcoded to the Summary field specifically: fixed `id`/`label`, callback-style `value`/`onChange` props). Generalized to accept `id`/`label` and standard `TextareaHTMLAttributes` (so `{...register("context")}` spreads onto it the same way `FloatingInput` already works with RHF) — Profile's Summary field updated to the same shared component, matching `STRUCTURE.md`'s "shared/ is for code used by 2+ features" rule now that a second consumer exists.
- Confirmation view uses a `MailCheck` icon (lucide-react) and copy covering both required points (sent confirmation + 5-minute cooldown note) from the Design section above; exact wording wasn't specified beyond those two points, so treat as easily adjustable copy, not a locked design decision.
- **Form heading: an icon instead of a text label.** Above the Title field sits a `Mail` icon (no visible "Contact" heading text — `<h1 className="sr-only">Contact</h1>` keeps an accessible name) with a slow traveling light around it, echoing Sign In's icon-above-the-form treatment but bigger and with a glow.
  - **The glow traces an SVG rect, not a CSS box around the icon.** First attempt sized a plain wrapper `<div>` to approximate the Mail glyph's ink bounds (lucide's `Mail` icon is a `rect(x:2 y:4 w:20 h:16 rx:2)` inside a 24x24 viewBox — narrower margins left/right than top/bottom, since an envelope is wider than tall) and reused `.state-glow`'s inset-mask technique on that div. It kept getting partly covered by the icon itself: lucide's ~2px stroke width extends beyond the path's nominal coordinates, so any wrapper sized tight enough to look close to the glyph also risked the icon's own stroke painting directly over the glow at some edge — moving the wrapper further out to avoid that reintroduced the original "too far from the icon" complaint, because widening a *box* uniformly no longer matches the glyph's actual (non-rectangular-margin) shape once it's not hugging tightly. Replaced with the same SVG stroke-dash "flowing border" technique used for the CV page's hexagon tab icons (`.hex-trace` in `index.css`) — draws a real `<rect>` matching (and just outside) the icon's own rect, with an animated `stroke-dasharray`/`stroke-dashoffset` (`.mail-trace`). Since it's a distinct SVG stroke rather than a CSS box positioned near the icon, there's no box-model guesswork and no possibility of the icon's own paint covering it.

## Edge Cases

- Submitting while within the cooldown window from a _previous session_ (e.g. visitor closed the tab and came back 2 minutes later) — same as any other cooldown hit, surfaces via the global error modal; the frontend has no memory of the previous send (nothing stored client-side), so this is naturally handled by the reactive approach without extra logic
- Network failure mid-submit — standard `ApiError`/global error modal handling, no special case needed

## Open Questions / Ask Before Assuming

- None currently outstanding.
