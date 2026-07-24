import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { SkillDto } from "../../profile";

function groupByCategory(skills: SkillDto[]) {
  const categories = [...new Set(skills.map((s) => s.category))].sort();
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

function SkillGroup({ groups }: { groups: ReturnType<typeof groupByCategory> }) {
  return (
    <div className="space-y-5">
      {groups.map(({ category, items }) => (
        <div key={category}>
          <p className="mb-1.5 text-sm font-semibold text-text-secondary">
            {formatCategory(category)}
          </p>
          <div className="flex flex-wrap justify-center gap-1.5">
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
      ))}
    </div>
  );
}

export function SkillsSection({ skills }: { skills: SkillDto[] }) {
  const [showSoft, setShowSoft] = useState(false);
  const tech = groupByCategory(skills.filter((s) => s.type === "Tech"));
  const soft = groupByCategory(skills.filter((s) => s.type === "Soft"));

  if (skills.length === 0) return null;

  return (
    <div>
      <h2 className="mb-2 text-sm font-semibold tracking-wide text-accent uppercase">
        Skills
      </h2>
      {tech.length > 0 && <SkillGroup groups={tech} />}

      {soft.length > 0 && (
        <>
          {showSoft && <div className="mt-3">
            <SkillGroup groups={soft} />
          </div>}
          <button
            type="button"
            onClick={() => setShowSoft((s) => !s)}
            aria-label={showSoft ? "Hide soft skills" : "Show soft skills"}
            className="mx-auto mt-3 flex h-8 w-8 items-center justify-center rounded-full border border-border-default text-text-secondary transition-colors duration-300 hover:border-accent hover:text-accent"
          >
            <ChevronDown
              className={`h-4 w-4 transition-transform duration-300 ${showSoft ? "rotate-180" : ""}`}
            />
          </button>
        </>
      )}
    </div>
  );
}
