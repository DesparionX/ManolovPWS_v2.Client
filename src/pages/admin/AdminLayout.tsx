import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import {
  User,
  FileText,
  FolderKanban,
  Inbox as InboxIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Container } from "../../shared/components/Container";
import { useMessages } from "../../features/inbox";

const ADMIN_NAV_LINKS = [
  { to: "/admin/profile", label: "Profile", icon: User },
  { to: "/admin/posts", label: "All Posts", icon: FileText },
  { to: "/admin/projects", label: "All Projects", icon: FolderKanban },
  { to: "/admin/inbox", label: "Inbox", icon: InboxIcon },
];

function isNavItemActive(pathname: string, to: string) {
  if (to === "/admin/profile") {
    return pathname === "/admin" || pathname.startsWith("/admin/profile");
  }
  return pathname.startsWith(to);
}

export function AdminLayout() {
  const { pathname } = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const { data: messages } = useMessages();
  const unreadCount = messages?.filter((m) => m.isUnread).length ?? 0;

  return (
    <Container className="flex flex-1 flex-col">
      <div className="my-8 flex flex-1 flex-col gap-6 rounded-xl border border-border-default bg-bg-surface/60 p-6 shadow-xl backdrop-blur-md md:flex-row md:gap-0">
        <nav
          className={`relative flex shrink-0 justify-center gap-2 overflow-x-auto border-b border-border-default pb-4 transition-all duration-300 md:flex-col md:justify-start md:overflow-visible md:border-r md:border-b-0 md:pr-6 md:pb-0 ${
            collapsed ? "md:w-16" : "md:w-48"
          }`}
        >
          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? "Expand navigation" : "Collapse navigation"}
            className="absolute top-1/2 right-0 z-10 hidden h-7 w-7 -translate-y-1/2 translate-x-1/2 items-center justify-center rounded-full border border-border-default bg-bg-surface text-text-secondary shadow-sm transition-colors duration-300 hover:border-accent hover:text-accent md:flex"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
          {ADMIN_NAV_LINKS.map((link) => {
            const active = isNavItemActive(pathname, link.to);
            const Icon = link.icon;
            const showBadge = link.to === "/admin/inbox" && unreadCount > 0;
            return (
              <Link
                key={link.to}
                to={link.to}
                title={link.label}
                className={`flex items-center rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap transition-all ${
                  active ? "gap-2 duration-300" : "gap-0 duration-0"
                } md:gap-2 md:duration-300 ${
                  active
                    ? "bg-accent/15 text-accent"
                    : "text-text-secondary hover:text-text-primary"
                } ${collapsed ? "md:justify-center" : ""}`}
              >
                <span className="relative shrink-0">
                  <Icon className="h-5 w-5" />
                  {showBadge && (
                    <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-semibold text-bg-base">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </span>
                {/* Mobile: icon-only by default, label expands into view
                    only for the active tab. Only the expand animates
                    (duration-300, growing max-width — a pure left-to-right
                    wipe out from behind the icon, no opacity fade mixed in,
                    so it reads as one directional motion rather than two);
                    switching away from a tab collapses it instantly
                    (duration-0) rather than visibly shrinking it back down —
                    only the newly active tab's expand should be seen
                    animating, not the outgoing tab's collapse. Desktop
                    (md+): unaffected by `active` — governed solely by the
                    existing `collapsed` toggle, always animated, same as
                    before. */}
                <span
                  className={`overflow-hidden whitespace-nowrap transition-[max-width] ${
                    active ? "max-w-32 duration-300" : "max-w-0 duration-0"
                  } ${collapsed ? "md:max-w-0 md:duration-300" : "md:max-w-none md:duration-300"}`}
                >
                  {link.label}
                </span>
              </Link>
            );
          })}
        </nav>
        <div className="min-w-0 flex-1 md:pl-6">
          <Outlet />
        </div>
      </div>
    </Container>
  );
}
