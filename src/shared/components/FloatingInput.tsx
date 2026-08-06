import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";

interface FloatingInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  rightElement?: ReactNode;
}

export const FloatingInput = forwardRef<HTMLInputElement, FloatingInputProps>(
  ({ label, error, rightElement, id, className, ...props }, ref) => {
    const hasError = Boolean(error);

    return (
      <div>
        <div className="relative">
          <input
            id={id}
            ref={ref}
            aria-invalid={hasError}
            className={`peer w-full rounded-lg border bg-bg-base/50 px-4 py-4 text-center text-text-primary transition-all duration-500 ease-out focus:outline-none ${
              hasError
                ? "border-danger"
                : "border-border-default hover:shadow-[0_0_16px_-4px_var(--color-accent)] focus:border-black focus:shadow-[0_0_20px_-3px_var(--color-accent)]"
            } ${rightElement ? "pr-12" : ""} ${className ?? ""}`}
            {...props}
          />
          {/* Sits on the border like a legend, in both states — not inside
              the field. Unfocused: offset ~10% from the left, larger, bold.
              Focused: centered, accent-colored, still large and bold, just
              a step down in size. When the field has an error, the label
              stays danger-colored in both states instead — an invalid
              field should read as invalid whether or not it's currently
              focused.
              The stacked 0/0-offset text-shadows are a faux-stroke: each
              layer is centered directly on the glyph (no directional
              offset) so it thickens evenly on all sides rather than
              pooling to one side, and stacking several opaque layers at
              increasing blur radii (instead of one shadow with a big
              blur) keeps the core dense/solid near the letter edge rather
              than fading out — enough to fully occlude the border line
              behind it (a real background patch was tried first; looked
              like a floating gray box rather than a legend cut into the
              border). */}
          <label
            htmlFor={id}
            className={`pointer-events-none absolute top-0 left-[10%] -translate-y-1/2 text-lg font-semibold whitespace-nowrap transition-all duration-500 ease-out [text-shadow:0_0_1px_rgba(0,0,0,1),0_0_2px_rgba(0,0,0,1),0_0_3px_rgba(0,0,0,1),0_0_4px_rgba(0,0,0,1),0_0_6px_rgba(0,0,0,0.95),0_0_9px_rgba(0,0,0,0.85)] peer-focus:left-1/2 peer-focus:-translate-x-1/2 peer-focus:translate-y-[-58%] peer-focus:text-base ${
              hasError
                ? "text-danger peer-focus:text-danger"
                : "text-text-secondary peer-focus:text-[color-mix(in_srgb,var(--color-accent)_85%,black)]"
            }`}
          >
            {label}
          </label>
          {rightElement && (
            <div className="absolute top-1/2 right-2 -translate-y-1/2">
              {rightElement}
            </div>
          )}
        </div>
        {error && (
          <p className="mt-2 max-w-[92%] text-sm text-danger">{error}</p>
        )}
      </div>
    );
  },
);

FloatingInput.displayName = "FloatingInput";
