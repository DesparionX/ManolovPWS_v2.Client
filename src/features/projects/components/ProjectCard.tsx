import { Link } from "react-router-dom";
import type { CSSProperties } from "react";
import { PROJECT_STATE_GLOW_COLORS } from "../types/projectTypes";
import type { ProjectReadModel } from "../types/projectTypes";

interface ProjectCardProps {
  project: ProjectReadModel;
}

// Mobile-only per-card glow — desktop keeps the category panel's own
// frame-level glow instead (ProjectsPage.tsx), per Owner feedback: mobile
// wanted the traveling highlight back on each individual card, not just the
// whole panel. Same .category-trace technique (index.css) the panel's own
// glow uses, just applied here instead. h-full + flex column (with the
// button pinned to the bottom via mt-auto) is what actually equalizes card
// heights within a row now that there's no description — a title alone can
// still wrap to a different number of lines per card, so this still
// matters even without one.
export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <div
      className="relative h-full"
      style={
        {
          "--glow-color": PROJECT_STATE_GLOW_COLORS[project.state],
        } as CSSProperties
      }
    >
      {/* Sibling of the card's own overflow-hidden box below, not a
          descendant of it — otherwise the glow's outward bleed would get
          clipped by the same overflow-hidden the thumb image's rounded
          corners need (the exact bug already hit and fixed once for the
          category panel's own version of this glow). md:hidden — desktop
          doesn't need this at all, the panel's own frame already glows. */}
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full overflow-visible md:hidden"
      >
        <rect
          x="-3"
          y="-3"
          width="calc(100% + 6px)"
          height="calc(100% + 6px)"
          rx="14"
          ry="14"
          fill="none"
          strokeWidth="2"
          pathLength={100}
          className="category-trace"
        />
      </svg>
      <article className="relative flex h-full flex-col overflow-hidden rounded-xl border border-border-default/50 bg-bg-surface/60 shadow-md backdrop-blur-md">
        <img src={project.thumb} alt="" className="h-48 w-full object-cover" />
        <div className="flex flex-1 flex-col p-5">
          <h3 className="mb-2 text-lg font-semibold text-text-primary">
            {project.name}
          </h3>
          <Link
            to={`/projects/${project.id}`}
            className="mt-auto inline-block self-start rounded-lg border border-border-default px-4 py-2 text-sm text-text-primary transition-colors duration-300 hover:border-accent"
          >
            View Project
          </Link>
        </div>
      </article>
    </div>
  );
}
