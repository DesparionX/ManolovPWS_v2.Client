import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Container } from "../shared/components/Container";
import { useCv, CVHeader, CVSidebar, CVTabs } from "../features/cv";

const ARROW_BUTTON_CLASS =
  "absolute top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-border-default bg-bg-surface text-accent shadow-sm transition-colors duration-300 hover:border-accent md:hidden";

export function CVPage() {
  const { data: cv, isLoading, isError } = useCv();
  const [mobileView, setMobileView] = useState<"history" | "info">("history");

  return (
    <Container>
      <div className="py-10">
        {isLoading && (
          <p className="py-16 text-center text-text-secondary">
            Loading CV...
          </p>
        )}

        {!isLoading && (isError || !cv) && (
          <p className="py-16 text-center text-danger">
            Couldn't load the CV. Try refreshing the page.
          </p>
        )}

        {!isLoading && cv && (
          <div className="flex flex-col items-center gap-10 rounded-xl border border-border-default/50 bg-bg-surface/60 p-6 shadow-xl backdrop-blur-md">
            <CVHeader cv={cv} />

            {/* Mobile-only: History (CVTabs) and General Info (CVSidebar)
                are two slides of a horizontal pager, sliding between each
                other instead of an instant show/hide — a `w-[200%]` flex
                track holding both, `overflow-hidden` on its parent, and
                `translate-x-0` / `-translate-x-1/2` toggled by mobileView.
                History is first (shows by default). Rendered separately
                from — and in addition to — the desktop layout below, since
                the two need fundamentally different container structures
                (sliding track vs. plain side-by-side); duplicating
                CVSidebar/CVTabs here is the same tradeoff Nav.tsx/
                Footer.tsx's mobile bar already make for the site's own nav.

                The two arrow buttons live OUTSIDE the `overflow-hidden`
                track, as siblings of it, not descendants — they were
                inside it at first, and their intentional half-outside-the-
                edge positioning (`translate-x-1/2`/`-translate-x-1/2`) got
                clipped by that same `overflow-hidden` (needed to hide the
                other, off-screen slide), leaving only half the icon
                visible. Positioned against this outer `relative` wrapper
                instead, they're never inside anything that clips them. */}
            <div className="relative w-full md:hidden">
              {mobileView === "history" && (
                <button
                  type="button"
                  onClick={() => setMobileView("info")}
                  aria-label="View General Info"
                  className={`${ARROW_BUTTON_CLASS} right-0 translate-x-1/2`}
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              )}
              {mobileView === "info" && (
                <button
                  type="button"
                  onClick={() => setMobileView("history")}
                  aria-label="Back to History"
                  className={`${ARROW_BUTTON_CLASS} left-0 -translate-x-1/2`}
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
              )}
              <div className="overflow-hidden">
                <div
                  className={`flex w-[200%] transition-transform duration-300 ease-in-out ${
                    mobileView === "history" ? "translate-x-0" : "-translate-x-1/2"
                  }`}
                >
                  {/* pl-2: the hexagon badges' glow (.hex-trace/.hex-frame-glow
                      in index.css) bleeds a few px past their own SVG via
                      drop-shadow, and this pane's left edge sits flush
                      against the slide track's overflow-hidden clip
                      boundary — with zero buffer the first hexagon's glow
                      got cut off on its left side. Only needed here (the
                      mobile pager); desktop's CVTabs render has no
                      overflow-hidden ancestor to clip against. */}
                  <div className="w-1/2 shrink-0 pr-3 pl-2">
                    <CVTabs cv={cv} />
                  </div>
                  <div className="w-1/2 shrink-0 pl-3">
                    <CVSidebar cv={cv} />
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop: unconditional side-by-side, unaffected by
                mobileView or any of the above. */}
            <div className="hidden w-full gap-10 md:flex md:flex-row">
              <CVSidebar cv={cv} />
              <CVTabs cv={cv} />
            </div>
          </div>
        )}
      </div>
    </Container>
  );
}
