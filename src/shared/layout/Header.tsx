import { useRef, useSyncExternalStore } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Inbox as InboxIcon } from "lucide-react";
import { authStore } from "../auth/authStore";
import { useSignOut } from "../../features/auth";
import { useMessages } from "../../features/inbox";
import { Nav } from "./Nav";
import { MobileNav } from "./MobileNav";
import { Button } from "../components/Button";
import logo from "../../assets/logo.png";

const DOUBLE_TAP_WINDOW_MS = 300;

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
    <header className="site-header sticky top-0 z-30 border-b border-border-default bg-bg-base/80 backdrop-blur-md">
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
          {isAuthenticated && (
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
          )}
          <MobileNav />
        </div>
      </div>
      <span aria-hidden="true" className="header-shine" />
    </header>
  );
}
