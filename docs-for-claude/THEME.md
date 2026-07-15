# Theme & Visual Design System

Design tokens and visual conventions for the whole app. Read before styling any component — these values should be used via Tailwind config/CSS variables, not re-invented or hardcoded per page.

## Mode

- **Dark mode primary.** This is not a "supports dark mode" toggle — dark is the only/default visual identity for now. Light mode is not in scope unless decided later.

## Color Palette (proposed — confirm or adjust)

Based on the glassmorphism/blurred-card direction already set in `pages/home.md` (blurred backgrounds, greyish borders that colorize on hover):

| Token                            | Value                                 | Usage                                             |
| -------------------------------- | ------------------------------------- | ------------------------------------------------- |
| `bg-base`                        | `#0a0a0f` (near-black, slightly cool) | Page background                                   |
| `bg-surface`                     | `#15151d`                             | Card/panel backgrounds (before blur applied)      |
| `border-default`                 | `#2a2a35` (thin greyish)              | Default card border                               |
| `border-hover` / `border-accent` | accent color, see below               | Hover/pinned border colorization                  |
| `text-primary`                   | `#f2f2f5`                             | Main text                                         |
| `text-secondary`                 | `#9a9aa8`                             | Dates, meta info, secondary text                  |
| `accent`                         | `#22D3EE` (electric cyan)             | Hover borders, links, buttons, pinned-post border |

**Chosen:** electric cyan. Reads as futuristic/HUD-like on the near-black background without being a screen-burning neon, distinct from both the old site's red/orange identity and the generic corporate-blue look most dev portfolios default to — fits the "professional, futuristic, developer/gamer" brief directly.

## Typography

- **Proposed:** a clean sans-serif for UI text (e.g. Inter, or a similar system-adjacent font) — flag if you have a specific font in mind, especially for the CV page which may want something more distinctive
- Type scale: use Tailwind's default scale (`text-sm` through `text-4xl`+) rather than custom sizes, unless a specific page needs something bespoke

## Spacing & Layout

- Use Tailwind's default spacing scale (4px base unit) — no custom spacing tokens unless a specific need arises
- Max content width: TBD — needs a decision once we build the layout shell (e.g. `max-w-3xl` for a feed-style single column vs wider for dashboard-like pages)

## Effects

- **Glassmorphism cards:** `backdrop-blur` + semi-transparent `bg-surface` + `border-default`, per the Home page card style
- **Border colorization:** `border-default` → `border-accent` on hover (transition, not instant snap — e.g. `transition-colors duration-200`)
- **Pinned emphasis:** thicker border width (not just color) — e.g. `border-2` vs `border`, still using `border-accent`
- Border radius: TBD — needs a decision (sharp/minimal vs rounded-xl soft cards) — affects overall visual personality

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

- **Font choice** — defaulting to Inter-style sans-serif unless you specify otherwise
- **Border radius personality** — sharp/minimal vs soft/rounded
- **Max content width** for feed-style pages
