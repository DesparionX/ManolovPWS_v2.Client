import { useState, type CSSProperties } from "react";
import { Frown, ChevronLeft, ChevronRight } from "lucide-react";
import { Container } from "../shared/components/Container";
import {
  useProjects,
  ProjectCard,
  PROJECT_STATE_LABELS,
  PROJECT_STATE_GLOW_COLORS,
  type ProjectState,
} from "../features/projects";

const STATE_ORDER: ProjectState[] = [
  "Finished",
  "InDevelopment",
  "Frozen",
  "Abandoned",
];

// Same circular, half-stuck-to-the-edge button ProjectDetailPage's own back
// button uses (neutral gray, not accent-colored by default) — explicitly
// requested to match that one, not CVPage's own accent-colored pager arrows.
// Mobile-only: `fixed` (not `absolute`) and vertically centered against the
// VIEWPORT rather than the panel — per Owner feedback, the arrows should
// stay put on screen while the page scrolls, not travel with the panel.
// `top-1/2 -translate-y-1/2` resolves against whichever containing block
// `position` puts it in, so the same classes give "centered on the panel"
// on desktop (absolute) and "centered on the screen" on mobile (fixed) for
// free — only `position` itself needs to differ between the two.
const ARROW_BUTTON_CLASS =
  "fixed md:absolute top-1/2 z-30 md:z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-border-default bg-bg-surface text-text-secondary shadow-sm transition-colors duration-300 hover:border-accent hover:text-accent";

function SkeletonCard() {
  return (
    <div className="animate-pulse overflow-hidden rounded-xl border border-border-default/50 bg-bg-surface/60 backdrop-blur-md">
      <div className="h-48 w-full bg-bg-base/50" />
      <div className="space-y-3 p-5">
        <div className="h-5 w-3/4 rounded bg-bg-base/50" />
        <div className="h-3 w-full rounded bg-bg-base/50" />
        <div className="h-3 w-5/6 rounded bg-bg-base/50" />
      </div>
    </div>
  );
}

function EmptyPlaceholder() {
  return (
    <div className="mx-auto w-full max-w-xl overflow-hidden rounded-xl border border-border-default/50 bg-bg-surface/60 p-10 text-center shadow-md backdrop-blur-md">
      <Frown className="mx-auto mb-4 h-12 w-12 text-text-secondary" />
      <h2 className="mb-2 text-lg font-semibold text-text-primary">
        Oooops !
      </h2>
      <p className="text-sm text-text-secondary">
        We have no projects yet or DB is dead.
      </p>
    </div>
  );
}

export function ProjectsPage() {
  const { data: projects, isLoading, isError } = useProjects();
  const [index, setIndex] = useState(0);

  const groups = STATE_ORDER.map((state) => ({
    state,
    items: (projects ?? []).filter((p) => p.state === state),
  })).filter((group) => group.items.length > 0);

  // Clamped rather than trusted as-is — if the category count ever shrinks
  // (e.g. the last item of the last-viewed category gets deleted) a stale
  // index could otherwise point past the end of a now-shorter groups array.
  const currentIndex = Math.min(index, Math.max(groups.length - 1, 0));

  function goPrev() {
    setIndex((i) => (i - 1 + groups.length) % groups.length);
  }

  function goNext() {
    setIndex((i) => (i + 1) % groups.length);
  }

  return (
    <Container>
      <div className="py-10">
        {isLoading && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {!isLoading && isError && (
          <p className="py-16 text-center text-danger">
            Couldn't load projects. Try refreshing the page.
          </p>
        )}

        {!isLoading && !isError && groups.length === 0 && <EmptyPlaceholder />}

        {!isLoading && !isError && groups.length > 0 && (
          <div className="relative">
            {/* Arrows are siblings of the overflow-hidden track below, not
                descendants of it — inside it, their own positioning would
                get clipped by the same overflow-hidden that's there to hide
                the other, off-screen category slides (the exact bug already
                hit and fixed once on CVPage's own mobile pager — see
                pages/CV.md). Desktop (`md:absolute`): positioned against
                this same `relative` wrapper, half-outside the panel's own
                edge (`md:-translate-x-1/2`/`md:translate-x-1/2`) — the
                panel spans edge-to-edge with no horizontal margin of its
                own (see below), so `left-4`/`right-4` line up exactly with
                its actual border. Mobile (`fixed`, no translate): per Owner
                feedback, pinned to the viewport instead so they stay put on
                screen while the page scrolls, not travelling with the
                panel — no half-outside-a-border bleed there either, since
                there's no border for a viewport-fixed button to straddle,
                and that same bleed math would otherwise push the button a
                couple px past the actual screen edge (the exact clipping
                bug already hit once on the Post/Project detail pages' back
                buttons — see pages/PROJECT-DETAIL.md). Only shown when
                there's actually more than one category to page through. */}
            {groups.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={goPrev}
                  aria-label="Previous category"
                  className={`${ARROW_BUTTON_CLASS} left-4 md:-translate-x-1/2`}
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  aria-label="Next category"
                  className={`${ARROW_BUTTON_CLASS} right-4 md:translate-x-1/2`}
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </>
            )}
            {/* py-4 lives on THIS element (the actual clip boundary), not
                the outer wrapper above — padding on an ancestor OUTSIDE
                overflow-hidden doesn't create clearance inside the clipped
                box; the box's own edges stay flush with its first child's
                regardless of how far down/over the page the whole unit
                sits. Padding here, by contrast, IS inside the clipped area
                (overflow clips at the padding edge, not the content edge)
                — gives the category label's -top-3 bleed room on top.
                Vertical only (py, not p) — horizontal clearance lives on
                each individual SLIDE below instead, not here. Real bug,
                fixed: horizontal padding on this shared wrapper (which
                wraps the WHOLE multi-slide track, not just the current
                slide) sat *outside* each slide's own box but *inside* the
                overall clip boundary — exactly the sliver of "peek room"
                where the very start of the next slide (positioned right
                after the current one) became visible, since clipping
                happens at this element's own edge, not each slide's. Top/
                bottom don't have this problem (slides sit side by side
                horizontally, not stacked, so there's no adjacent slide
                above/below to peek into) — only left/right needed to move. */}
            <div className="overflow-hidden py-4">
              <div
                className="flex transition-transform duration-300 ease-in-out"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
              >
                {groups.map((group) => (
                  // px-4 here (not on the shared overflow-hidden wrapper —
                  // see above) gives the panel's glow/drop-shadow room on
                  // the left/right without exposing the adjacent slide.
                  // No margin on the panel itself (unlike an even earlier
                  // version, which used mx-2 on the panel directly) — the
                  // panel still spans this slide's full content width
                  // edge-to-edge, so it reads as one frame that travels the
                  // complete width when paged, and the arrows above (fixed
                  // to the outer wrapper's own left-4/right-4, matching this
                  // px-4) land exactly on the panel's actual border.
                  <div key={group.state} className="w-full shrink-0 px-4">
                    {/* No plain CSS border anymore — the frame's visible
                        border is now drawn entirely in SVG (below), same
                        convention as the CV hexagons/Contact page's Mail
                        icon: a real stroke that a glow layer can travel
                        along and hide behind, which a CSS `border` can't
                        support. */}
                    <section
                      className="relative rounded-xl bg-bg-surface/40 p-6 pt-8 backdrop-blur-md"
                      style={
                        {
                          "--glow-color": PROJECT_STATE_GLOW_COLORS[group.state],
                        } as CSSProperties
                      }
                    >
                      {/* Real bug, fixed: the svg MUST have an explicit
                          size (h-full w-full) — inset-* alone sets its
                          position (via top/right/bottom/left) but an <svg>
                          is a *replaced* element, and replaced elements
                          don't stretch to fill from inset offsets the way a
                          plain div would. Without an explicit size it fell
                          back to the browser's default replaced-element
                          size (300×150px) — a tiny fixed box floating in
                          the corner of the actual panel, completely
                          independent of the panel's real (large,
                          responsive) size, which is what made the glow
                          render as a small broken-looking fragment instead
                          of tracing the whole frame.
                          Real bug, fixed: both rects trace the panel's TRUE
                          edge or just outside it (see below) — an earlier
                          version inset them *inward*, which visually read
                          as a second, disconnected "frame" floating inside
                          the real one (the one the arrows sit on) rather
                          than the real frame's own glow. Clipping clearance
                          for the glow's outward bleed comes from each
                          slide's own px-4/the track's py-4 (see above) —
                          the frame itself stays exactly where the arrows
                          and the section's own visible edge are. */}
                      <svg
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
                      >
                        {/* The panel's actual visible border — solid,
                            always-there, at the panel's TRUE edge
                            (x=0/y=0/100%/100%, rx=12 matching the section's
                            own rounded-xl). No plain CSS `border` class on
                            the section anymore — this rect *is* the
                            border now, same convention as the CV hexagons. */}
                        <rect
                          x="0"
                          y="0"
                          width="100%"
                          height="100%"
                          rx="12"
                          ry="12"
                          fill="none"
                          strokeWidth="2"
                          className="stroke-border-default"
                        />
                        {/* Glow layer: traces a slightly LARGER rect, a few
                            px *outside* the border above, rather than the
                            same path — per Owner feedback, reversing the
                            previous "hide it behind the border, Mail-icon
                            style" version: the glow should only ever be
                            visible from outside the frame, never hidden
                            behind/under it. Thinner than that previous pass
                            too (strokeWidth 4 → 2). rx bumped 12 → 14 to
                            stay roughly concentric with the border it's
                            now offset from.
                            max-md:hidden — mobile-only, moved back onto
                            each individual ProjectCard instead (see
                            ProjectCard.tsx), per Owner feedback. Desktop is
                            unaffected, keeps this frame-level glow exactly
                            as before. */}
                        <rect
                          x="-3"
                          y="-3"
                          width="calc(100% + 6px)"
                          height="calc(100% + 6px)"
                          rx="14"
                          ry="14"
                          fill="none"
                          strokeWidth="2"
                          pathLength={100}
                          className="category-trace max-md:hidden"
                        />
                      </svg>
                      {/* Thicker/darker text-shadow (stacked, near-black,
                          up to 12px blur) — same "faux-stroke via stacked
                          shadows" convention as MessageDetailPage's field
                          legends, needed for the same reason: this label
                          sits directly on the panel's own border/glow, and
                          needs to stay legible against whatever's animating
                          underneath it. */}
                      <h2 className="absolute -top-3 left-6 px-3 text-base font-semibold text-text-primary [text-shadow:0_0_1px_rgba(0,0,0,1),0_0_2px_rgba(0,0,0,1),0_0_3px_rgba(0,0,0,1),0_0_4px_rgba(0,0,0,1),0_0_6px_rgba(0,0,0,1),0_0_9px_rgba(0,0,0,1),0_0_12px_rgba(0,0,0,0.9)]">
                        {PROJECT_STATE_LABELS[group.state]}
                      </h2>
                      <div className="grid items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {group.items.map((project) => (
                          <ProjectCard key={project.id} project={project} />
                        ))}
                      </div>
                    </section>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </Container>
  );
}
