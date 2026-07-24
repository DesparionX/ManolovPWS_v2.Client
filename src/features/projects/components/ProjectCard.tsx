import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import { stripHtmlToText } from "../../../shared/components/richTextUtils";
import { PROJECT_STATE_GLOW_COLORS } from "../types/projectTypes";
import type { ProjectReadModel } from "../types/projectTypes";

interface ProjectCardProps {
  project: ProjectReadModel;
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <div
      className="state-glow rounded-xl"
      style={
        {
          "--glow-color": PROJECT_STATE_GLOW_COLORS[project.state],
        } as CSSProperties
      }
    >
      <article className="overflow-hidden rounded-xl border border-border-default/50 bg-bg-surface/60 shadow-md backdrop-blur-md">
        <img src={project.thumb} alt="" className="h-48 w-full object-cover" />
        <div className="p-5">
          <h3 className="mb-2 text-lg font-semibold text-text-primary">
            {project.name}
          </h3>
          <p className="line-clamp-2 text-sm text-text-secondary">
            {stripHtmlToText(project.description)}
          </p>
          <Link
            to={`/projects/${project.id}`}
            className="mt-4 inline-block rounded-lg border border-border-default px-4 py-2 text-sm text-text-primary transition-colors duration-300 hover:border-accent"
          >
            View Project
          </Link>
        </div>
      </article>
    </div>
  );
}
