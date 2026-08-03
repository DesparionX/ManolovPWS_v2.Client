import { forwardRef, useEffect, useRef, type TextareaHTMLAttributes } from "react";

interface AutoGrowTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

// Grows with content, but caps out instead of growing forever — beyond this
// it scrolls internally like a normal fixed textarea.
const MAX_HEIGHT_PX = 240;

function resize(el: HTMLTextAreaElement | null) {
  if (!el) return;
  el.style.height = "auto";
  el.style.height = `${Math.min(el.scrollHeight, MAX_HEIGHT_PX)}px`;
}

export const AutoGrowTextarea = forwardRef<HTMLTextAreaElement, AutoGrowTextareaProps>(
  ({ label, error, id, className, value, onChange, ...props }, forwardedRef) => {
    const innerRef = useRef<HTMLTextAreaElement>(null);

    // Two ways this needs to resize, since not every caller re-renders with a
    // new `value` on each keystroke: controlled usage (Profile's Summary,
    // value/onChange from useState) does, but React Hook Form's `register()`
    // (Contact's Message field) is uncontrolled — it never passes `value` at
    // all, updating the DOM directly instead, so a `useEffect` keyed on
    // `value` never re-fires as the visitor types. Resizing directly in the
    // change handler (which fires either way, since it's the same native
    // input event) covers both.
    useEffect(() => {
      resize(innerRef.current);
    }, [value]);

    return (
      <div>
        <div className="relative">
          <textarea
            ref={(node) => {
              innerRef.current = node;
              if (typeof forwardedRef === "function") forwardedRef(node);
              else if (forwardedRef) forwardedRef.current = node;
              resize(node);
            }}
            id={id}
            value={value}
            onChange={(e) => {
              resize(e.target);
              onChange?.(e);
            }}
            rows={3}
            className={`peer max-h-60 w-full resize-none overflow-y-auto rounded-lg border bg-bg-base/50 px-4 py-3 text-text-primary transition-all duration-500 ease-out focus:outline-none ${
              error
                ? "border-danger"
                : "border-border-default hover:shadow-[0_0_16px_-4px_var(--color-accent)] focus:border-black focus:shadow-[0_0_20px_-3px_var(--color-accent)]"
            } ${className ?? ""}`}
            {...props}
          />
          {/* Same legend-on-the-border label as FloatingInput — see
              THEME.md's Form Fields section. Error state keeps it
              danger-colored regardless of focus, same as FloatingInput.
              Stacked 0/0-offset text-shadows (faux-stroke) occlude the
              border line showing through letter gaps, same as
              FloatingInput. */}
          <label
            htmlFor={id}
            className={`pointer-events-none absolute top-0 left-[10%] -translate-y-1/2 text-lg font-semibold transition-all duration-500 ease-out [text-shadow:0_0_1px_rgba(0,0,0,1),0_0_2px_rgba(0,0,0,1),0_0_3px_rgba(0,0,0,1),0_0_4px_rgba(0,0,0,1),0_0_6px_rgba(0,0,0,0.95),0_0_9px_rgba(0,0,0,0.85)] peer-focus:left-1/2 peer-focus:-translate-x-1/2 peer-focus:translate-y-[-58%] peer-focus:text-base ${
              error
                ? "text-danger peer-focus:text-danger"
                : "text-text-secondary peer-focus:text-[color-mix(in_srgb,var(--color-accent)_85%,black)]"
            }`}
          >
            {label}
          </label>
        </div>
        {error && <p className="mt-2 max-w-[92%] text-sm text-danger">{error}</p>}
      </div>
    );
  },
);

AutoGrowTextarea.displayName = "AutoGrowTextarea";
