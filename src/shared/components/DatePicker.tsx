import { useState, type ReactNode } from "react";
import {
  format,
  parseISO,
  startOfMonth,
  startOfWeek,
  endOfWeek,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isAfter,
  isBefore,
  setMonth,
  setYear,
  addMonths,
  subMonths,
} from "date-fns";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { Select } from "./Select";

interface DatePickerProps {
  label: ReactNode;
  value: string | null;
  onChange: (value: string) => void;
  minDate?: Date;
  maxDate?: Date;
  error?: string;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const WEEKDAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export function DatePicker({
  label,
  value,
  onChange,
  minDate,
  maxDate,
  error,
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const selectedDate = value ? parseISO(value) : null;
  const [viewDate, setViewDate] = useState(selectedDate ?? new Date());

  const monthStart = startOfMonth(viewDate);
  const gridStart = startOfWeek(monthStart);
  const gridEnd = endOfWeek(endOfMonth(viewDate));
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

  const minYear = minDate ? minDate.getFullYear() : viewDate.getFullYear() - 100;
  const maxYear = maxDate ? maxDate.getFullYear() : viewDate.getFullYear();
  // Listed newest-first so the dropdown opens on the current/most recent
  // year instead of scrolled all the way down at the oldest.
  const years = Array.from(
    { length: Math.max(maxYear - minYear + 1, 1) },
    (_, i) => maxYear - i,
  );

  function isDisabled(day: Date) {
    if (minDate && isBefore(day, minDate)) return true;
    if (maxDate && isAfter(day, maxDate)) return true;
    return false;
  }

  function selectDay(day: Date) {
    if (isDisabled(day)) return;
    onChange(format(day, "yyyy-MM-dd"));
    setOpen(false);
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex w-full items-center justify-between rounded-lg border bg-bg-base/50 px-4 py-4 text-left text-text-primary transition-all duration-500 ease-out focus:outline-none ${
          error
            ? "border-danger"
            : `border-border-default hover:shadow-[0_0_16px_-4px_var(--color-accent)] ${
                open ? "border-black shadow-[0_0_20px_-3px_var(--color-accent)]" : ""
              }`
        }`}
      >
        <span>{selectedDate ? format(selectedDate, "MMM d, yyyy") : " "}</span>
        <CalendarIcon className="h-4 w-4 shrink-0 text-text-secondary" />
      </button>
      {/* Same legend-on-the-border treatment as FloatingInput: offset-left
          and larger by default, centered/accent/smaller while the calendar
          is open (this button's equivalent of an input being focused).
          Error state keeps it danger-colored regardless of open/closed,
          same as FloatingInput. Stacked 0/0-offset text-shadows
          (faux-stroke) occlude the border line showing through letter
          gaps, same as FloatingInput. */}
      <span
        className={`pointer-events-none absolute top-0 font-semibold whitespace-nowrap transition-all duration-500 ease-out [text-shadow:0_0_1px_rgba(0,0,0,1),0_0_2px_rgba(0,0,0,1),0_0_3px_rgba(0,0,0,1),0_0_4px_rgba(0,0,0,1),0_0_6px_rgba(0,0,0,0.95),0_0_9px_rgba(0,0,0,0.85)] ${
          open
            ? `left-1/2 -translate-x-1/2 translate-y-[-58%] text-base ${error ? "text-danger" : "text-[color-mix(in_srgb,var(--color-accent)_85%,black)]"}`
            : `left-[10%] -translate-y-1/2 text-lg ${error ? "text-danger" : "text-text-secondary"}`
        }`}
      >
        {label}
      </span>
      {error && <p className="mt-2 max-w-[92%] text-sm text-danger">{error}</p>}

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute z-20 mt-2 w-72 rounded-xl border border-border-default bg-bg-surface/95 p-4 shadow-xl backdrop-blur-md">
            <div className="mb-3 flex items-center justify-between gap-2">
              <button
                type="button"
                aria-label="Previous month"
                onClick={() => setViewDate((d) => subMonths(d, 1))}
                className="rounded-md p-1 text-text-secondary transition-colors duration-300 hover:text-accent"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <div className="flex gap-2">
                <Select
                  value={String(viewDate.getMonth())}
                  onChange={(v) => setViewDate((d) => setMonth(d, Number(v)))}
                  options={MONTH_NAMES.map((m, i) => ({
                    value: String(i),
                    label: m,
                  }))}
                  className="rounded-md py-1 pr-7 pl-2 text-sm"
                />
                <Select
                  value={String(viewDate.getFullYear())}
                  onChange={(v) => setViewDate((d) => setYear(d, Number(v)))}
                  options={years.map((y) => ({
                    value: String(y),
                    label: String(y),
                  }))}
                  className="rounded-md py-1 pr-7 pl-2 text-sm"
                />
              </div>
              <button
                type="button"
                aria-label="Next month"
                onClick={() => setViewDate((d) => addMonths(d, 1))}
                className="rounded-md p-1 text-text-secondary transition-colors duration-300 hover:text-accent"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs text-text-secondary">
              {WEEKDAY_LABELS.map((d) => (
                <span key={d} className="py-1">
                  {d}
                </span>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {days.map((day) => {
                const disabled = isDisabled(day);
                const selected = selectedDate && isSameDay(day, selectedDate);
                return (
                  <button
                    key={day.toISOString()}
                    type="button"
                    disabled={disabled}
                    onClick={() => selectDay(day)}
                    className={`rounded-md py-1 text-sm transition-colors duration-300 ${
                      !isSameMonth(day, viewDate)
                        ? "text-text-secondary/40"
                        : "text-text-primary"
                    } ${selected ? "bg-accent text-bg-base" : "hover:bg-bg-base/80"} ${
                      disabled ? "cursor-not-allowed opacity-30" : ""
                    }`}
                  >
                    {format(day, "d")}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
