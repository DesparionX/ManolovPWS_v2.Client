import { useState, type KeyboardEvent } from "react";
import { X } from "lucide-react";

interface TagInputProps {
  label: string;
  value: string[];
  onChange: (tags: string[]) => void;
  error?: string;
}

export function TagInput({ label, value, onChange, error }: TagInputProps) {
  const [draft, setDraft] = useState("");

  function commitDraft() {
    const tag = draft.trim();
    setDraft("");
    if (!tag) return;
    if (value.includes(tag)) return;
    onChange([...value, tag]);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === " " || e.key === "," || e.key === "Enter") {
      e.preventDefault();
      commitDraft();
    } else if (e.key === "Backspace" && draft === "" && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  }

  function removeTag(tag: string) {
    if (value.length <= 1) return;
    onChange(value.filter((t) => t !== tag));
  }

  return (
    <div>
      <label className="mb-1 block text-sm text-text-secondary">{label}</label>
      <div
        className={`flex flex-wrap items-center gap-2 rounded-lg border bg-bg-base/50 px-3 py-2 ${
          error
            ? "border-danger"
            : "border-border-default focus-within:border-accent"
        }`}
      >
        {value.map((tag) => (
          <span
            key={tag}
            className="group flex items-center gap-1 rounded-full bg-accent/15 px-3 py-1 text-sm text-accent"
          >
            {tag}
            {value.length > 1 && (
              <button
                type="button"
                aria-label={`Remove ${tag}`}
                onClick={() => removeTag(tag)}
                className="opacity-60 transition-opacity duration-300 hover:opacity-100"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </span>
        ))}
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={commitDraft}
          placeholder={value.length === 0 ? "Add a tag..." : ""}
          className="min-w-24 flex-1 bg-transparent text-sm text-text-primary outline-none placeholder:text-text-secondary"
        />
      </div>
      {error && <p className="mt-2 max-w-[92%] text-sm text-danger">{error}</p>}
    </div>
  );
}
