import { Link } from "react-router-dom";
import type { ProjectReadModel } from "../types/projectTypes";

interface ProjectCardProps {
  project: ProjectReadModel;
}

// No per-card glow anymore — the traveling border highlight now runs around
// the category panel's own frame instead (see ProjectsPage.tsx/index.css's
// .category-trace), not each individual card. No description preview
// either, per Owner feedback — h-full + flex column (with the button
// pinned to the bottom via mt-auto) is what actually equalizes card
// heights within a row now that the description (previously the biggest
// source of variable height) is gone; a title alone can still wrap to a
// different number of lines per card, so this still matters even without it.
export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-xl border border-border-default/50 bg-bg-surface/60 shadow-md backdrop-blur-md">
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
  );
}
