import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
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
          {/* Real HTML, same convention as the Project Detail page —
              line-clamp-2 only visually hides overflow (webkit-line-clamp
              doesn't touch the DOM), so it's safe to clamp actual rendered
              markup instead of the plain-text-stripped preview this used to
              show. */}
          <div
            className="line-clamp-2 text-sm text-text-secondary [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-text-primary [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5"
            dangerouslySetInnerHTML={{ __html: project.description }}
          />
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
