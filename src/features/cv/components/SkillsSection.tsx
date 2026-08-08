import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { SkillDto } from "../../profile";

function groupByCategory(skills: SkillDto[]) {
  // Not sorted — `Set` preserves first-insertion order, so categories keep
  // whatever order they first appear in within `skills` (i.e. add order,
  // same order the admin panel already shows them in), not alphabetical.
  const categories = [...new Set(skills.map((s) => s.category))];
  return categories.map((category) => ({
    category,
    items: skills.filter((s) => s.category === category),
  }));
}

// Backend is assumed to already Title-Case each category (per CV.md), but a
// slash-separated one (e.g. "tools/cloud") doesn't get spaced out by that —
// capitalize each "/"-segment and join with " / " so "tools/cloud" reads as
// "Tools / Cloud" instead of running the two words together. A 2-letter
// segment (e.g. "qa") is an acronym, not a word — uppercase it fully ("QA")
// rather than just capitalizing the first letter ("Qa").
function formatCategory(category: string): string {
  return category
    .split("/")
    .map((part) => {
      const trimmed = part.trim();
      if (trimmed.length === 2) return trimmed.toUpperCase();
      return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
    })
    .join(" / ");
}

function CategoryGroup({
  category,
  items,
  expanded,
  onToggle,
}: {
  category: string;
  items: SkillDto[];
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className="mx-auto flex items-center gap-1.5 text-sm font-semibold text-text-secondary transition-colors duration-300 hover:text-accent"
      >
        {formatCategory(category)}
        <ChevronDown
          className={`h-3.5 w-3.5 text-accent transition-transform duration-300 ${expanded ? "rotate-180" : ""}`}
        />
      </button>
      {/* Same grid-template-rows (0fr <-> 1fr) height-animation technique
          CVTabs uses for its own expand/collapse — animates smoothly without
          needing the content's height up front. */}
      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
          expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <div className="flex flex-wrap justify-center gap-1.5 pt-1.5">
            {items.map((skill) => (
              <span
                key={skill.name}
                className="rounded-full border border-border-default px-2.5 py-1 text-xs text-text-primary transition-colors duration-300 hover:border-accent hover:text-accent"
              >
                {skill.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function SkillsSection({ skills }: { skills: SkillDto[] }) {
  const tech = groupByCategory(skills.filter((s) => s.type === "Tech"));
  const soft = groupByCategory(skills.filter((s) => s.type === "Soft"));

  // Tech categories first, then Soft — same order as before, but now every
  // category (Soft included) renders as its own row instead of the whole
  // Soft group being hidden behind a single reveal button. Prefixed keys
  // since a Tech and a Soft category could share the same category text.
  const groups = [
    ...tech.map((g) => ({ ...g, key: `tech-${g.category}` })),
    ...soft.map((g) => ({ ...g, key: `soft-${g.category}` })),
  ];

  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());

  function toggle(key: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  if (skills.length === 0) return null;

  return (
    <div>
      <h2 className="mb-2 text-sm font-semibold tracking-wide text-accent uppercase">
        Skills
      </h2>
      <div className="space-y-3">
        {groups.map((group) => (
          <CategoryGroup
            key={group.key}
            category={group.category}
            items={group.items}
            expanded={expanded.has(group.key)}
            onToggle={() => toggle(group.key)}
          />
        ))}
      </div>
    </div>
  );
}
