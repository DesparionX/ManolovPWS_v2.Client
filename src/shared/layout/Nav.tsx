import { NavLink } from "react-router-dom";
import { NAV_LINKS } from "./navLinks";

export function Nav() {
  return (
    <nav className="hidden items-center gap-6 md:flex">
      {NAV_LINKS.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          end={link.to === "/"}
          className={({ isActive }) =>
            `text-sm font-medium transition-colors ${
              isActive
                ? "text-accent"
                : "text-text-secondary hover:text-text-primary"
            }`
          }
        >
          {link.label}
        </NavLink>
      ))}
    </nav>
  );
}
