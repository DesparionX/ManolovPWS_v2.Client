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

  return (
    <Container className="flex flex-1 flex-col">
      <div className="my-8 flex flex-1 flex-col gap-6 rounded-xl border border-border-default bg-bg-surface/60 p-6 shadow-xl backdrop-blur-md md:flex-row md:gap-0">
        <nav
          className={`relative flex shrink-0 gap-2 overflow-x-auto border-b border-border-default pb-4 transition-all duration-300 md:flex-col md:overflow-visible md:border-r md:border-b-0 md:pr-6 md:pb-0 ${
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
            return (
              <Link
                key={link.to}
                to={link.to}
                title={link.label}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors duration-300 ${
                  active
                    ? "bg-accent/15 text-accent"
                    : "text-text-secondary hover:text-text-primary"
                } ${collapsed ? "md:justify-center" : ""}`}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span className={collapsed ? "md:hidden" : ""}>
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
