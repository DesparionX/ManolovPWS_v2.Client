import { Frown } from "lucide-react";
import { Container } from "../shared/components/Container";
import {
  useProjects,
  ProjectCard,
  PROJECT_STATE_LABELS,
  type ProjectState,
} from "../features/projects";

const STATE_ORDER: ProjectState[] = [
  "Finished",
  "InDevelopment",
  "Frozen",
  "Abandoned",
];

function SkeletonCard() {
  return (
    <div className="animate-pulse overflow-hidden rounded-xl border border-border-default/50 bg-bg-surface/60 backdrop-blur-md">
      <div className="h-48 w-full bg-bg-base/50" />
      <div className="space-y-3 p-5">
        <div className="h-5 w-3/4 rounded bg-bg-base/50" />
        <div className="h-3 w-full rounded bg-bg-base/50" />
        <div className="h-3 w-5/6 rounded bg-bg-base/50" />
      </div>
    </div>
  );
}

function EmptyPlaceholder() {
  return (
    <div className="mx-auto w-full max-w-xl overflow-hidden rounded-xl border border-border-default/50 bg-bg-surface/60 p-10 text-center shadow-md backdrop-blur-md">
      <Frown className="mx-auto mb-4 h-12 w-12 text-text-secondary" />
      <h2 className="mb-2 text-lg font-semibold text-text-primary">
        Oooops !
      </h2>
      <p className="text-sm text-text-secondary">
        We have no projects yet or DB is dead.
      </p>
    </div>
  );
}

export function ProjectsPage() {
  const { data: projects, isLoading, isError } = useProjects();

  const groups = STATE_ORDER.map((state) => ({
    state,
    items: (projects ?? []).filter((p) => p.state === state),
  })).filter((group) => group.items.length > 0);

  return (
    <Container>
      <div className="py-10">
        {isLoading && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {!isLoading && isError && (
          <p className="py-16 text-center text-danger">
            Couldn't load projects. Try refreshing the page.
          </p>
        )}

        {!isLoading && !isError && groups.length === 0 && <EmptyPlaceholder />}

        {!isLoading &&
          !isError &&
          groups.map((group) => (
            <section
              key={group.state}
              className="relative mb-12 rounded-xl border border-border-default/50 bg-bg-surface/40 p-6 pt-8 backdrop-blur-md last:mb-0"
            >
              <h2 className="absolute -top-3 left-6 px-3 text-sm font-semibold text-text-primary">
                {PROJECT_STATE_LABELS[group.state]}
              </h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {group.items.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            </section>
          ))}
      </div>
    </Container>
  );
}
