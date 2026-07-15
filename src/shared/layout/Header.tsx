import { useRef, useSyncExternalStore } from "react";
import { useNavigate } from "react-router-dom";
import { authStore } from "../auth/authStore";
import { useSignOut } from "../../features/auth";
import { Container } from "../components/Container";
import { Nav } from "./Nav";
import { MobileNav } from "./MobileNav";

const DOUBLE_TAP_WINDOW_MS = 300;

export function Header() {
  const navigate = useNavigate();
  const isAuthenticated = useSyncExternalStore(
    authStore.subscribe,
    authStore.isAuthenticated,
  );
  const signOut = useSignOut();
  const lastTapRef = useRef(0);

  function handleLogoTouchEnd() {
    const now = Date.now();
    if (now - lastTapRef.current < DOUBLE_TAP_WINDOW_MS) {
      lastTapRef.current = 0;
      navigate("/admin/auth");
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
    <header className="sticky top-0 z-30 border-b border-border-default bg-bg-base/80 backdrop-blur-md">
      <Container>
        <div className="relative flex items-center justify-between py-4">
          <span
            onDoubleClick={() => navigate("/admin/auth")}
            onTouchEnd={handleLogoTouchEnd}
            style={{ touchAction: "manipulation" }}
            className="select-none text-xl font-bold text-text-primary"
          >
            Manolov
          </span>

          <div className="flex items-center gap-4">
            <Nav />
            {isAuthenticated && (
              <button
                type="button"
                aria-label="Sign out"
                onClick={handleSignOut}
                disabled={signOut.isPending}
                className="rounded-lg p-2 text-text-secondary transition-colors hover:text-accent disabled:opacity-50"
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
              </button>
            )}
            <MobileNav />
          </div>
        </div>
      </Container>
    </header>
  );
}
