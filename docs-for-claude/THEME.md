# Theme & Visual Design System

Design tokens and visual conventions for the whole app. Read before styling any component — these values should be used via Tailwind config/CSS variables, not re-invented or hardcoded per page.

## Mode

- **Dark mode primary.** This is not a "supports dark mode" toggle — dark is the only/default visual identity for now. Light mode is not in scope unless decided later.

## Color Palette

Based on the glassmorphism/blurred-card direction already set in `pages/home.md` (blurred backgrounds, greyish borders that colorize on hover):

| Token                            | Value                                 | Usage                                                                                                                                               |
| -------------------------------- | ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `bg-base`                        | `#0a0a0f` (near-black, slightly cool) | Page background                                                                                                                                     |
| `bg-surface`                     | `#15151d`                             | Card/panel backgrounds (before blur applied)                                                                                                        |
| `border-default`                 | `#2a2a35` (thin greyish)              | Default card border                                                                                                                                 |
| `border-hover` / `border-accent` | accent color, see below               | Hover/pinned border colorization                                                                                                                    |
| `text-primary`                   | `#f2f2f5`                             | Main text                                                                                                                                           |
| `text-secondary`                 | `#9a9aa8`                             | Dates, meta info, secondary text                                                                                                                    |
| `accent`                         | `#22D3EE` (electric cyan)             | Hover borders, links, buttons, pinned-post border                                                                                                   |
| `accent-dark`                    | `#0E7490` (deep cyan-blue)            | Primary submit-button fill (e.g. Sign In) — a calmer, darker accent shade for large solid-fill buttons                                              |
| `danger`                         | `#F87171` (muted coral-red)           | Form validation errors, the global ErrorModal (border + Dismiss button — not accent, an error is not an info state), destructive-action affordances |
| `success`                        | `#4ADE80` (clean green)               | The global success Toast (border + text) — confirms a save/create/delete actually completed                                                         |
| `frozen`                         | `#818CF8` (indigo/periwinkle)         | Project state indicator for `Frozen` only — see Project State Colors below                                                                        |

**Chosen:** electric cyan. Reads as futuristic/HUD-like on the near-black background without being a screen-burning neon, distinct from both the old site's red/orange identity and the generic corporate-blue look most dev portfolios default to — fits the "professional, futuristic, developer/gamer" brief directly.

**Added while polishing `SignInPage`:** `accent-dark` — a deeper shade of the same cyan-blue hue (not a new/unrelated color), used for the submit button fill. Full-brightness `accent` reads great as a thin border/text highlight but felt too loud as a large solid button fill; the darker shade keeps the same family/identity while sitting back visually. Text on it switched to `text-primary` (white) instead of `bg-base` (near-black), since the darker fill no longer has enough contrast for dark text.

**Added while wiring the theme:** `danger` wasn't in the original palette — needed one while styling `SignInPage`'s field validation, and reusing `accent` (cyan) for errors would read as a positive/interactive color, not a warning. Picked a standard muted red rather than guessing something bespoke; flag if you'd rather a different shade or want it tied to the accent hue instead.

**Added while building the admin panel:** `success` — the global Toast originally used neutral `bg-surface`/`text-primary` (per `API-CLIENT.md`'s original design). Confirmed after real usage that blur-autosave saves across Profile/Post/Project Editor need a visible confirmation, not just silence — see `API-CLIENT.md`'s updated Mutation Pattern section. A plain neutral toast didn't read as "success" clearly enough once it was actually firing on every save, so it needed its own color, distinct from `accent` (interactive) and `danger` (error). Standard clean green, not tied to the accent hue — success is conventionally its own color family, not a variant of the brand accent.

**Added while finalizing the public Projects page:** `frozen` — needed a 4th distinct color to finalize the per-`ProjectState` color mapping (see Project State Colors below); `accent`, `success`, and `danger` already covered three of the four states well semantically, but nothing in the existing palette fit "paused/on ice" for `Frozen` without reusing an already-meaningful color. A cool indigo/periwinkle reads as "cold/paused" without clashing with the cyan accent or being confused for an error or success state.

## Project State Colors

Finalizes `pages/PROJECTS.md`'s previously-placeholder per-state color mapping (`pages/admin/PROJECTS.md`'s `STATE_HOVER_CLASS` note, and `ProjectCard`'s border-glow effect on the public Projects page) — reuses existing tokens for 3 of 4 states, `frozen` is the only new one:

| `ProjectState` | Color               | Reasoning                                            |
| -------------- | -------------------- | ----------------------------------------------------- |
| `Finished`      | `success` (green)    | Done, successfully — matches the color's existing "completed" meaning from the save Toast |
| `InDevelopment` | `accent` (cyan)       | Actively being worked on — the brand's primary interactive color, reused for "active"    |
| `Frozen`        | `frozen` (indigo)     | Paused, not actively worked on — deliberately distinct from both "good" (success) and "bad" (danger) states |
| `Abandoned`     | `danger` (coral-red)  | Discontinued/dead — reuses the existing "something's wrong" color                        |

Used in two places, both driven by `features/projects/types/projectTypes.ts`'s exported maps (not hardcoded per-component):

- **Public Projects page card border:** a slow-traveling comet-style glow around each card's edge (`shared/components/Select.tsx`... no — `.state-glow` class in `index.css`, generalized from the Home feed's pinned-post glow effect to accept any color via a `--glow-color` CSS custom property), colored via `PROJECT_STATE_GLOW_COLORS`.
- **Admin Projects list badge:** a solid-tint pill badge (`bg-{color}/15 text-{color}`) next to each project's name, colored via `PROJECT_STATE_BADGE_CLASSES` — replaces the old placeholder hover-only border tint now that real colors are decided.

## Typography

- **Chosen: [Space Grotesk](https://fonts.google.com/specimen/Space+Grotesk).** Geometric sans-serif with slightly unconventional letterforms (double-story `g`, squared-off curves) — reads as modern/technical without tipping into gimmicky sci-fi display type, so it stays legible and credible for body text, forms, and the CV page, not just headings. Pairs well with the electric-cyan accent and near-black background — same "professional, futuristic, developer/gamer" brief the accent color was chosen for. Used for both UI text and headings; distinctive enough that the CV page doesn't need a separate face.
- Type scale: use Tailwind's default scale (`text-sm` through `text-4xl`+) rather than custom sizes, unless a specific page needs something bespoke
- **Base font-size scales up on large screens:** root `font-size` is `16px` by default, bumped to `18px` from `2xl` (1536px+) up. Since Tailwind's type scale is `rem`-based, this scales everything proportionally rather than needing per-size overrides. Added because the same CSS pixel sizes read noticeably smaller on QHD+ monitors than on FHD at a typical viewing distance/browser zoom.

## Spacing & Layout

- Use Tailwind's default spacing scale (4px base unit) — no custom spacing tokens unless a specific need arises
- **Max content width: `max-w-5xl` (1024px)**, centered with auto margins from `md:` up — enough room to breathe without stretching edge-to-edge on wide desktop screens. Below `md`, no max-width constraint, just `px-4` side padding — mobile should read as close to full-width, not artificially narrowed. Applies app-wide by default; a specific page (e.g. a dashboard-like admin view) can opt into a wider container later if content genuinely needs it, but don't widen by default.

## Effects

- **Glassmorphism cards:** `backdrop-blur` + semi-transparent `bg-surface` + `border-default`, per the Home page card style
- **Border colorization:** `border-default` → `border-accent` on hover (transition, not instant snap — e.g. `transition-colors duration-200`)
- **Pinned emphasis:** thicker border width (not just color) — e.g. `border-2` vs `border`, still using `border-accent`
- **Border radius: soft/rounded.** `rounded-xl` (12px) for cards/panels, `rounded-lg` (8px) for buttons/inputs/smaller controls, `rounded-full` for avatars, pills, and tag/badge chips

## Buttons & Loading State

- **Every action button** (anything that triggers an async/API call — form submits, sign-out, future save/delete/pin actions in the admin panel) **must show a spinning loader in place of its contents while the action is pending**, in addition to being disabled. Implemented once via `shared/components/Button.tsx` — a thin wrapper around `<button>` taking an `isLoading` prop; pass a `useMutation`'s `isPending` straight through. While `isLoading`, the button disables itself automatically and swaps its children for a spinning `Loader2` icon (`lucide-react`, `animate-spin`) — content isn't shown alongside the spinner, it's replaced by it, so icon-only buttons (e.g. the header's sign-out icon) don't end up with two icons side by side.
- **Excluded: navigation.** Plain links/buttons that just navigate (`Nav`/`MobileNav` links, the header logo's hidden sign-in trigger) don't have a "pending API result" state and shouldn't get this treatment — it's specifically for buttons whose click starts a mutation/request.
- All new buttons that fire a mutation should use `shared/components/Button.tsx` rather than a bare `<button>`, so this behavior stays consistent app-wide instead of being reimplemented per form.

## Cursor

- **Plain/read-only text uses the normal arrow pointer, not the text-select I-beam.** Browsers default `cursor: auto` to an I-beam whenever hovering text content, which reads as "this is editable" everywhere — misleading for the vast majority of the site's text (post/project body copy, CV content, labels, etc.), none of which is actually editable by a visitor. Set site-wide via `cursor: default` on `body` (`index.css`), with `cursor: text` explicitly restored for elements that genuinely are editable: `input`, `textarea`, and `[contenteditable="true"]` (TipTap's `RichTextEditor`, in the admin Post/Project editors). Interactive elements like buttons/links keep their own native `pointer` cursor regardless — that's a direct rule on the element itself, not something inherited from `body`, so it isn't affected by this.

## Background & Scrollbars

- **Background is pinned to the viewport, not the document.** It's a `position: fixed` full-viewport layer (`shared/layout/AppBackground.tsx`, `-z-10`, `pointer-events-none`) rendered once at the app root — it never scrolls with page content. "Static" here means *fixed relative to the viewport*, not *motionless*: the layer itself has its own independent animation (see below), which is fine since that animation isn't tied to scroll position.
- **Animated background: circuit grid + drifting glow orbs.** A faint cyan grid (`linear-gradient` lines, ~6% opacity, 48px cells — circuit-board texture) plus two large, heavily-blurred cyan radial-gradient "orbs" (`.glow-orb`) that slowly drift and breathe via a 24s `ease-in-out` loop (`orb-drift` keyframe, opposite phase/direction on each orb so they don't move in lockstep). Reads as ambient HUD/reactor lighting rather than a literal decoration — subtle enough (low opacity, heavy blur) not to fight card content or text contrast. Respects `prefers-reduced-motion` (animation disabled entirely for users who request it).
- **All scrollbars hidden.** Applies app-wide — the page itself and any inner scrollable container (modals, dropdowns, admin inner-nav, etc.). Scrolling still works via wheel/touch/keyboard; only the visible scrollbar UI is suppressed (`scrollbar-width: none` for Firefox, `::-webkit-scrollbar { display: none }` for Chromium/Safari).

## Navigation & Footer

- **Header spans the full viewport width**, not the `max-w-5xl` content container — logo sits flush against the left edge (`px-4`/`md:px-8` padding only, no centered max-width wrapper), nav links + logout icon + mobile toggle flush against the right edge. The `max-w-5xl` container is for page *content*, not the header/footer chrome bar itself.
- **Header:** logo (`assets/logo.png`, real asset, not a text placeholder) pinned left; nav links (`Home / Projects / CV / Contact`, per `pages/cv.md`'s navbar spec) grouped right, alongside the conditional logout icon and the mobile hamburger toggle — sticky with a blurred `bg-base` backdrop.
- **Desktop header hover — glass shine sweep.** Hovering anywhere on the **whole header bar** (logo included, not just the nav links — `.header-shine` overlay spans the full `.site-header`) sweeps a soft horizontal band of light (white blended with accent cyan) left-to-right across the **entire header's width**, like a reflection passing over glass. `transition: left 0.3s ease-in-out` on the band itself (not a one-shot keyframe animation) — the practical effect: moving the pointer away mid-hover smoothly sweeps the band back rather than cutting it off, matching the original effect from Manolov's previous site. Gated on `@media (hover: hover) and (pointer: fine)` so it only fires for actual mouse/trackpad input — touch taps don't leave it "stuck" mid-hover. Disabled under `prefers-reduced-motion`.
- **Footer:** `by Manolov - {year}`, centered, in `text-primary`. Background is `bg-base` at 90% opacity (`bg-bg-base/90`) — dark, not fully transparent, just a slight see-through hint of the animated background behind it.

## Responsive Breakpoints

Using Tailwind's default breakpoints (no custom values):

| Breakpoint | Min width | Target device               |
| ---------- | --------- | --------------------------- |
| (default)  | 0px       | Mobile                      |
| `sm`       | 640px     | Large mobile / small tablet |
| `md`       | 768px     | Tablet                      |
| `lg`       | 1024px    | Laptop                      |
| `xl`       | 1280px    | Desktop                     |
| `2xl`      | 1536px    | Large screens               |

- Mobile-first: write base (unprefixed) styles for mobile, layer `md:`/`lg:` etc. on top — don't design desktop-first and retrofit down
- Every page doc's Design section should call out responsive behavior explicitly if it differs meaningfully across breakpoints (e.g. nav collapsing to hamburger, feed going from 1 column to multi-column)

## Open Questions / Ask Before Assuming

None currently outstanding — accent color, font, border radius, and max content width are all decided above.
