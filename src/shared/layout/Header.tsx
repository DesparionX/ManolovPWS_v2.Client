import { useRef, useSyncExternalStore } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Inbox as InboxIcon } from "lucide-react";
import { authStore } from "../auth/authStore";
import { useSignOut } from "../../features/auth";
import { useMessages } from "../../features/inbox";
import { useHideOnScroll } from "../hooks/useHideOnScroll";
import { Nav } from "./Nav";
import { Button } from "../components/Button";
import logo from "../../assets/logo.png";

const DOUBLE_TAP_WINDOW_MS = 300;
const YEAR = new Date().getFullYear();

export function Header() {
  const navigate = useNavigate();
  const isAuthenticated = useSyncExternalStore(
    authStore.subscribe,
    authStore.isAuthenticated,
  );
  const signOut = useSignOut();
  const lastTapRef = useRef(0);
  const { data: messages } = useMessages();
  const unreadCount = messages?.filter((m) => m.isUnread).length ?? 0;
  // 0 guard: mobile-only hide-on-scroll-down should retract immediately on
  // any downward movement, not wait past a threshold — unlike the default
  // (used nowhere else currently), which exists for chrome that shouldn't
  // flicker hidden the instant a page barely scrolls at all.
  const headerHidden = useHideOnScroll(0);

  function goToAdminEntry() {
    navigate(isAuthenticated ? "/admin" : "/admin/auth");
  }

  function handleLogoTouchEnd() {
    const now = Date.now();
    if (now - lastTapRef.current < DOUBLE_TAP_WINDOW_MS) {
      lastTapRef.current = 0;
      goToAdminEntry();
    } else {
      lastTapRef.current = now;
    }
  }

  function handleSignOut() {
    signOut.mutate(undefined, {
      onSettled: () => navigate("/"),
    });
  }

  return (
    <header
      // md:translate-y-0 always wins at md+ regardless of headerHidden — kept
      // as its own unconditional class (not competing against the same
      // property at the same breakpoint) so it can't fall into the "two
      // same-specificity classes, winner decided by stylesheet source order"
      // trap documented in THEME.md. The hide-on-scroll-down behavior is
      // mobile-only; desktop always stays put regardless of scroll
      // direction. The scroll listener itself still runs unconditionally
      // (harmless — it just no longer has any visible effect at md+).
      className={`site-header sticky top-0 z-30 border-b border-border-default bg-bg-base/80 backdrop-blur-md transition-transform duration-300 md:translate-y-0 ${
        headerHidden ? "max-md:-translate-y-full" : "max-md:translate-y-0"
      }`}
    >
      <div className="relative flex items-center justify-between px-4 py-4 md:px-8">
        <img
          src={logo}
          alt="Manolov"
          draggable={false}
          onDoubleClick={goToAdminEntry}
          onTouchEnd={handleLogoTouchEnd}
          style={{ touchAction: "manipulation" }}
          className="h-10 w-auto select-none object-contain"
        />

        {/* Mobile-only — moved up from the footer, which no longer has any
            text/background of its own (see Footer.tsx: mobile there is now
            just a floating nav burger). Absolutely centered against this
            already-`relative` row rather than a third flex child, so it
            doesn't disturb the logo/Inbox's own `justify-between` spacing. */}
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-sm text-text-primary md:hidden">
          by Manolov - {YEAR}
        </span>

        <div className="flex items-center gap-4">
          <Nav />
          {isAuthenticated && (
            <Link
              to="/admin/inbox"
              aria-label="Inbox"
              className="relative rounded-lg p-2 text-text-secondary transition-colors duration-300 hover:text-accent"
            >
              <InboxIcon className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-0.5 right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-semibold text-bg-base">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Link>
          )}
          {/* Wrapped in a div (rather than hiding via Button's own className)
              since Button.tsx always includes an unconditional "flex" in its
              base classes — a "hidden" passed alongside it would fight that
              base class for the same `display` property with no reliable
              winner (same class of bug as the DatePicker label-color issue
              — see THEME.md). Mobile: sign out lives in the bottom bar's
              expanding row instead (Footer.tsx, merged with the mobile nav
              — see that component) — the header itself only shows the logo
              + Inbox on mobile now, no burger. */}
          {isAuthenticated && (
            <div className="hidden md:block">
              <Button
                type="button"
                aria-label="Sign out"
                onClick={handleSignOut}
                isLoading={signOut.isPending}
                className="rounded-lg p-2 text-text-secondary transition-colors duration-300 hover:text-accent"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </Button>
            </div>
          )}
        </div>
      </div>
      <span aria-hidden="true" className="header-shine" />
    </header>
  );
}
