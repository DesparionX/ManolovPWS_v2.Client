import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  id?: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  className?: string;
}

export function Select({ id, value, options, onChange, className }: SelectProps) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  return (
    <div className="relative">
      <button
        type="button"
        id={id}
        onClick={() => setOpen((o) => !o)}
        className={`relative flex w-full items-center border border-border-default bg-bg-base/50 text-left text-text-primary transition-colors duration-300 focus:border-accent focus:outline-none ${className ?? ""}`}
      >
        <span className="truncate">{selected?.label ?? ""}</span>
        <ChevronDown
          className={`pointer-events-none absolute right-3 h-4 w-4 shrink-0 text-text-secondary transition-transform duration-300 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-border-default bg-bg-surface/95 py-1 shadow-xl backdrop-blur-md">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={`block w-full px-3 py-2 text-left text-sm transition-colors duration-300 ${
                  option.value === value
                    ? "bg-accent/15 text-accent"
                    : "text-text-primary hover:bg-bg-base/50"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
