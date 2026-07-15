import { useState } from "react";
import { NavLink } from "react-router-dom";
import { NAV_LINKS } from "./navLinks";

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex h-9 w-9 flex-col items-center justify-center gap-1.5 rounded-lg border border-border-default"
      >
        <span
          className={`h-0.5 w-5 bg-text-primary transition-transform ${
            open ? "translate-y-2 rotate-45" : ""
          }`}
        />
        <span
          className={`h-0.5 w-5 bg-text-primary transition-opacity ${
            open ? "opacity-0" : ""
          }`}
        />
        <span
          className={`h-0.5 w-5 bg-text-primary transition-transform ${
            open ? "-translate-y-2 -rotate-45" : ""
          }`}
        />
      </button>

      {open && (
        <nav className="absolute inset-x-0 top-full z-40 flex flex-col gap-1 border-b border-border-default bg-bg-surface/95 px-4 py-4 backdrop-blur-md">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
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
      )}
    </div>
  );
}
