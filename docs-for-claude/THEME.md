# Theme & Visual Design System

Design tokens and visual conventions for the whole app. Read before styling any component — these values should be used via Tailwind config/CSS variables, not re-invented or hardcoded per page.

## Mode

- **Dark mode primary.** This is not a "supports dark mode" toggle — dark is the only/default visual identity for now. Light mode is not in scope unless decided later.

## Color Palette

Based on the glassmorphism/blurred-card direction already set in `pages/home.md` (blurred backgrounds, greyish borders that colorize on hover):

| Token                            | Value                                 | Usage                                                  |
| -------------------------------- | ------------------------------------- | ------------------------------------------------------ |
| `bg-base`                        | `#0a0a0f` (near-black, slightly cool) | Page background                                        |
| `bg-surface`                     | `#15151d`                             | Card/panel backgrounds (before blur applied)           |
| `border-default`                 | `#2a2a35` (thin greyish)              | Default card border                                    |
| `border-hover` / `border-accent` | accent color, see below               | Hover/pinned border colorization                       |
| `text-primary`                   | `#f2f2f5`                             | Main text                                              |
| `text-secondary`                 | `#9a9aa8`                             | Dates, meta info, secondary text                       |
| `accent`                         | `#22D3EE` (electric cyan)             | Hover borders, links, buttons, pinned-post border      |
| `danger`                         | `#F87171` (muted coral-red)           | Form validation errors, destructive-action affordances |

**Chosen:** electric cyan. Reads as futuristic/HUD-like on the near-black background without being a screen-burning neon, distinct from both the old site's red/orange identity and the generic corporate-blue look most dev portfolios default to — fits the "professional, futuristic, developer/gamer" brief directly.

**Added while wiring the theme:** `danger` wasn't in the original palette — needed one while styling `SignInPage`'s field validation, and reusing `accent` (cyan) for errors would read as a positive/interactive color, not a warning. Picked a standard muted red rather than guessing something bespoke; flag if you'd rather a different shade or want it tied to the accent hue instead.

## Typography

- **Chosen: [Space Grotesk](https://fonts.google.com/specimen/Space+Grotesk).** Geometric sans-serif with slightly unconventional letterforms (double-story `g`, squared-off curves) — reads as modern/technical without tipping into gimmicky sci-fi display type, so it stays legible and credible for body text, forms, and the CV page, not just headings. Pairs well with the electric-cyan accent and near-black background — same "professional, futuristic, developer/gamer" brief the accent color was chosen for. Used for both UI text and headings; distinctive enough that the CV page doesn't need a separate face.
- Type scale: use Tailwind's default scale (`text-sm` through `text-4xl`+) rather than custom sizes, unless a specific page needs something bespoke

## Spacing & Layout

- Use Tailwind's default spacing scale (4px base unit) — no custom spacing tokens unless a specific need arises
- **Max content width: `max-w-5xl` (1024px)**, centered with auto margins from `md:` up — enough room to breathe without stretching edge-to-edge on wide desktop screens. Below `md`, no max-width constraint, just `px-4` side padding — mobile should read as close to full-width, not artificially narrowed. Applies app-wide by default; a specific page (e.g. a dashboard-like admin view) can opt into a wider container later if content genuinely needs it, but don't widen by default.

## Effects

- **Glassmorphism cards:** `backdrop-blur` + semi-transparent `bg-surface` + `border-default`, per the Home page card style
- **Border colorization:** `border-default` → `border-accent` on hover (transition, not instant snap — e.g. `transition-colors duration-200`)
- **Pinned emphasis:** thicker border width (not just color) — e.g. `border-2` vs `border`, still using `border-accent`
- **Border radius: soft/rounded.** `rounded-xl` (12px) for cards/panels, `rounded-lg` (8px) for buttons/inputs/smaller controls, `rounded-full` for avatars, pills, and tag/badge chips

## Background & Scrollbars

- **Static background.** The page background is painted on `html`, not `body`, and never uses `background-attachment: scroll`-style movement — it stays visually pinned to the viewport rather than travelling with document content as the page scrolls. Matters most once `bg-base` gets any gradient/texture beyond a flat color; a flat color already looks static, but this is the correct baseline regardless.
- **All scrollbars hidden.** Applies app-wide — the page itself and any inner scrollable container (modals, dropdowns, admin inner-nav, etc.). Scrolling still works via wheel/touch/keyboard; only the visible scrollbar UI is suppressed (`scrollbar-width: none` for Firefox, `::-webkit-scrollbar { display: none }` for Chromium/Safari).

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
