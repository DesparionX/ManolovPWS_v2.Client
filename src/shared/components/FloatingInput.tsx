import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";

interface FloatingInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  rightElement?: ReactNode;
}

export const FloatingInput = forwardRef<HTMLInputElement, FloatingInputProps>(
  ({ label, error, rightElement, id, className, ...props }, ref) => {
    return (
      <div>
        <div className="relative">
          <input
            id={id}
            ref={ref}
            placeholder=" "
            className={`peer w-full rounded-lg border border-border-default bg-bg-base/50 px-3 pt-5 pb-2 text-text-primary transition-all duration-300 ease-out hover:shadow-[0_0_16px_-4px_var(--color-accent)] focus:border-accent focus:shadow-[0_0_20px_-3px_var(--color-accent)] focus:outline-none ${
              rightElement ? "pr-12" : ""
            } ${className ?? ""}`}
            {...props}
          />
          <label
            htmlFor={id}
            className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-base text-text-secondary transition-all duration-150 peer-focus:top-2 peer-focus:translate-y-0 peer-focus:text-xs peer-focus:text-accent peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:translate-y-0 peer-[:not(:placeholder-shown)]:text-xs"
          >
            {label}
          </label>
          {rightElement && (
            <div className="absolute top-1/2 right-2 -translate-y-1/2">
              {rightElement}
            </div>
          )}
        </div>
        {error && <p className="mt-1 text-sm text-danger">{error}</p>}
      </div>
    );
  },
);

FloatingInput.displayName = "FloatingInput";
