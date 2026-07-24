import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, GitFork, Globe } from "lucide-react";
import { Container } from "../shared/components/Container";
import { Lightbox } from "../shared/components/Lightbox";
import { useProject, PROJECT_STATE_LABELS } from "../features/projects";

export function ProjectDetailPage() {
  const { id } = useParams();
  const { data: project, isLoading, isError } = useProject(id);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  return (
    <Container>
      <div className="relative mx-auto max-w-2xl py-10">
        <Link
          to="/projects"
          aria-label="Back to projects"
          className={`absolute left-0 z-10 flex h-9 w-9 -translate-x-1/2 items-center justify-center rounded-full border border-border-default bg-bg-surface text-text-secondary shadow-sm transition-colors duration-300 hover:border-accent hover:text-accent ${
            project ? "top-69" : "top-16"
          }`}
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>

        {isLoading && (
          <p className="py-16 text-center text-text-secondary">
            Loading project...
          </p>
        )}

        {!isLoading && (isError || !project) && (
          <p className="py-16 text-center text-danger">
            This project couldn't be found.
          </p>
        )}

        {!isLoading && project && (
          <article className="overflow-hidden rounded-xl border border-border-default/50 bg-bg-surface/60 shadow-md backdrop-blur-md">
            <div className="px-6 pt-6 pb-4">
              <h1 className="text-center text-2xl font-semibold text-text-primary">
                {project.name}
              </h1>
              <p className="mt-1 text-center text-xs text-text-secondary">
                {PROJECT_STATE_LABELS[project.state]}
              </p>
            </div>

            <img
              src={project.thumb}
              alt=""
              className="h-72 w-full object-cover"
            />

            <div className="p-6">
              {project.stack.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-2">
                  {project.stack.map((tech) => (
                    <span
                      key={tech}
                      className="rounded-full border border-border-default px-3 py-1 text-xs text-text-secondary"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              )}

              <div
                className="text-text-primary [&_h2]:text-xl [&_h2]:font-semibold [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5"
                dangerouslySetInnerHTML={{ __html: project.description }}
              />

              {(project.gitHubUrl || project.liveUrl) && (
                <div className="mt-6 flex flex-wrap gap-3">
                  {project.gitHubUrl && (
                    <a
                      href={project.gitHubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 rounded-lg border border-border-default px-4 py-2 text-sm text-text-primary transition-colors duration-300 hover:border-accent"
                    >
                      <GitFork className="h-4 w-4" /> GitHub
                    </a>
                  )}
                  {project.liveUrl && (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 rounded-lg border border-border-default px-4 py-2 text-sm text-text-primary transition-colors duration-300 hover:border-accent"
                    >
                      <Globe className="h-4 w-4" /> Live Preview
                    </a>
                  )}
                </div>
              )}

              {project.gallery.length > 0 && (
                <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {project.gallery.map((url, index) => (
                    <button
                      key={`${url}-${index}`}
                      type="button"
                      aria-label="Open image"
                      onClick={() => setLightboxIndex(index)}
                      className="overflow-hidden rounded-lg border border-border-default transition-colors duration-300 hover:border-accent"
                    >
                      <img
                        src={url}
                        alt=""
                        className="h-32 w-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}

              <div className="mt-6 text-center text-xs text-text-secondary">
                <span>{project.uploadedDate}</span>
                {project.updatedDate && (
                  <span> (updated {project.updatedDate})</span>
                )}
              </div>
            </div>
          </article>
        )}

        {project && lightboxIndex !== null && (
          <Lightbox
            images={project.gallery}
            index={lightboxIndex}
            onClose={() => setLightboxIndex(null)}
            onIndexChange={setLightboxIndex}
          />
        )}
      </div>
    </Container>
  );
}
