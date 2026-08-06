import { useState, useSyncExternalStore } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { LogOut } from "lucide-react";
import { authStore } from "../auth/authStore";
import { useSignOut } from "../../features/auth";
import { Container } from "../components/Container";
import { NAV_LINKS } from "./navLinks";

const YEAR = new Date().getFullYear();

// Desktop: unchanged classic footer. Mobile: no footer bar/text/background
// at all anymore — "by Manolov" moved up into Header.tsx, and this reduces
// to just a floating nav burger, fixed to the bottom-right corner, that
// never hides (not tied to scroll at all, unlike Header.tsx's own bar).
// Tapping it slides the nav icons out to its left inside their own blurred
// pill — there's no bar background left behind the burger to blur against,
// so the icons need their own backdrop to stay legible over whatever page
// content happens to be underneath. The burger itself gets a solid opaque
// background instead (see below) rather than a blur, per Owner feedback.
export function Footer() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const isAuthenticated = useSyncExternalStore(
    authStore.subscribe,
    authStore.isAuthenticated,
  );
  const signOut = useSignOut();

  function handleSignOut() {
    signOut.mutate(undefined, {
      onSettled: () => {
        setOpen(false);
        navigate("/");
      },
    });
  }

  return (
    <footer className="border-t border-border-default bg-bg-base/90">
      {/* Desktop: unchanged, in normal document flow. */}
      <div className="hidden md:block">
        <Container>
          <div className="flex justify-center py-6 text-sm text-text-primary">
            <span>by Manolov - {YEAR}</span>
          </div>
        </Container>
      </div>

      {/* Mobile: floating burger, bottom-right, always visible. Icons
          expand to its left (`max-w-72` from `max-w-0`) inside a pill that
          gets its own border/bg/blur only once open — kept `border-
          transparent` at max-w-0 rather than just omitting the border
          class, since a real border color on a zero-width box still
          renders as a visible hairline seam next to the burger. max-w-72
          (not max-w-56 as originally): bigger icons (h-10) + wider gap
          (gap-2) between them need more room than the original h-9/gap-1
          sizing did, or the row would just get clipped by max-width before
          reaching Sign Out. */}
      <div
        className={`fixed right-4 bottom-4 z-30 flex items-center md:hidden ${
          open ? "gap-2" : "gap-0"
        }`}
      >
        <div
          className={`flex items-center gap-2 overflow-hidden rounded-lg border bg-bg-surface/80 py-1 backdrop-blur-md transition-[max-width,padding-left,padding-right,border-color] duration-300 ${
            open ? "max-w-72 border-border-default px-2" : "max-w-0 border-transparent px-0"
          }`}
        >
          {NAV_LINKS.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/"}
                title={link.label}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors duration-300 ${
                    isActive
                      ? "text-accent"
                      : "text-text-secondary hover:text-text-primary"
                  }`
                }
              >
                <Icon className="h-6 w-6" />
              </NavLink>
            );
          })}

          {isAuthenticated && (
            <button
              type="button"
              aria-label="Sign out"
              title="Sign out"
              onClick={handleSignOut}
              disabled={signOut.isPending}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-text-secondary transition-colors duration-300 hover:text-accent disabled:cursor-not-allowed disabled:opacity-50"
            >
              <LogOut className="h-6 w-6" />
            </button>
          )}
        </div>

        {/* Bigger than the old header burger (h-9 → h-12) now that it's a
            standalone floating control rather than one icon among several in
            a bar. Solid, opaque `bg-bg-base` (not the translucent .../80
            used elsewhere) plus its existing border — per Owner feedback,
            unlike the icon pill above which stays translucent/blurred. */}
        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          className="flex h-12 w-12 shrink-0 flex-col items-center justify-center gap-1.5 rounded-lg border border-border-default bg-bg-base"
        >
          <span
            className={`h-0.5 w-6 bg-text-primary transition-transform duration-300 ${
              open ? "translate-y-2 rotate-45" : ""
            }`}
          />
          <span
            className={`h-0.5 w-6 bg-text-primary transition-opacity duration-300 ${
              open ? "opacity-0" : ""
            }`}
          />
          <span
            className={`h-0.5 w-6 bg-text-primary transition-transform duration-300 ${
              open ? "-translate-y-2 -rotate-45" : ""
            }`}
          />
        </button>
      </div>
    </footer>
  );
}
