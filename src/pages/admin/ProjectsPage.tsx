import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Trash2, Plus } from "lucide-react";
import {
  useProjects,
  useDeleteProject,
  PROJECT_STATE_LABELS,
  type ProjectState,
} from "../../features/projects";
import { ConfirmDialog } from "../../shared/components/ConfirmDialog";

// State-based left-border tint on hover — exact color mapping is TBD per
// projects.md/THEME.md, built here using only existing palette tokens (no new
// colors invented). Combined with a general background tint so hover is
// clearly visible regardless of state.
const STATE_HOVER_CLASS: Record<ProjectState, string> = {
  Finished: "hover:border-accent",
  InDevelopment: "hover:border-accent/50",
  Frozen: "hover:border-border-default",
  Abandoned: "hover:border-danger/40",
};

export function ProjectsPage() {
  const navigate = useNavigate();
  const { data: projects, isLoading, isError } = useProjects();
  const deleteProject = useDeleteProject();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  if (isLoading) return <p className="text-text-secondary">Loading projects...</p>;
  if (isError || !projects) {
    return <p className="text-danger">Couldn't load projects. Try refreshing the page.</p>;
  }

  const sorted = [...projects].sort(
    (a, b) => new Date(b.uploadedDate).getTime() - new Date(a.uploadedDate).getTime(),
  );

  return (
    <div className="flex h-full flex-col">
      <h1 className="mb-6 text-center text-xl font-semibold text-text-primary">
        All Projects
      </h1>

      <div className="flex-1">
        {sorted.length === 0 ? (
          <p className="text-text-secondary">No projects yet.</p>
        ) : (
          <div className="divide-y divide-border-default">
            {sorted.map((project) => (
              <div
                key={project.id}
                className={`group flex items-center justify-between gap-3 rounded-lg border-l-2 border-l-transparent py-3 pr-3 pl-2 transition-colors duration-300 hover:bg-bg-surface/80 ${STATE_HOVER_CLASS[project.state]}`}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <p className="truncate text-text-primary">{project.name}</p>
                  <span className="shrink-0 rounded-full bg-bg-surface px-2 py-0.5 text-xs text-text-secondary">
                    {PROJECT_STATE_LABELS[project.state]}
                  </span>
                </div>
                <div className="flex shrink-0 gap-1 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <button
                    type="button"
                    aria-label="Edit"
                    onClick={() => navigate(`/admin/projects/${project.id}`)}
                    className="rounded-lg p-2 text-text-secondary transition-colors duration-300 hover:text-accent"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    aria-label="Delete"
                    onClick={() => setDeleteId(project.id)}
                    className="rounded-lg p-2 text-text-secondary transition-colors duration-300 hover:text-danger"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 flex justify-center">
        <button
          type="button"
          onClick={() => navigate("/admin/projects/new")}
          aria-label="New project"
          className="flex items-center gap-2 rounded-lg border border-dashed border-border-default px-4 py-2 text-sm text-text-secondary transition-colors duration-300 hover:border-accent hover:text-accent"
        >
          <Plus className="h-4 w-4" /> New Project
        </button>
      </div>

      <ConfirmDialog
        open={deleteId !== null}
        title="Delete this project?"
        description="This can't be undone."
        isLoading={deleteProject.isPending}
        onConfirm={() => {
          if (deleteId) deleteProject.mutate(deleteId);
          setDeleteId(null);
        }}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
