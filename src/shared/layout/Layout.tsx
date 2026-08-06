import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { Footer } from "./Footer";

export function Layout() {
  return (
    <div className="flex min-h-svh flex-col">
      <Header />
      {/* pb-20 (mobile only): clears Footer.tsx's floating nav burger
          (h-12, bottom-4 — 48px + 16px, plus a little breathing room),
          which is `fixed`/out of flow on mobile, so nothing else would
          otherwise reserve room for it at the bottom of the viewport. Only
          needs to cover its bottom-right corner footprint now, not a
          full-width bar — smaller than before now that the bar itself no
          longer exists (mobile is just the corner burger + whatever it
          reveals). */}
      <main className="flex flex-1 flex-col pb-20 md:pb-0">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
