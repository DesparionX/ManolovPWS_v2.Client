import { useRef, useState } from "react";
import { useNavigate, useParams, useBlocker } from "react-router-dom";
import { FloatingInput } from "../../shared/components/FloatingInput";
import { RichTextEditor } from "../../shared/components/RichTextEditor";
import { isRichTextEmpty } from "../../shared/components/richTextUtils";
import { ImageUpload } from "../../shared/components/ImageUpload";
import { GalleryUpload } from "../../shared/components/GalleryUpload";
import { TagInput } from "../../shared/components/TagInput";
import { Button } from "../../shared/components/Button";
import { ConfirmDialog } from "../../shared/components/ConfirmDialog";
import {
  useProject,
  useCreateProject,
  useUpdateProjectName,
  useUpdateProjectDescription,
  useUpdateProjectState,
  useUpdateProjectThumb,
  useUpdateProjectGallery,
  useUpdateProjectGitHubUrl,
  useUpdateProjectLiveUrl,
  useUpdateProjectStack,
  PROJECT_STATES,
  PROJECT_STATE_LABELS,
  type ProjectState,
} from "../../features/projects";

function isValidUrl(value: string) {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

export function ProjectEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const { data: project, isLoading, isError } = useProject(id);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [descriptionResetKey, setDescriptionResetKey] = useState(0);
  const [state, setState] = useState<ProjectState>("InDevelopment");
  const [liveUrl, setLiveUrl] = useState("");
  const [gitHubUrl, setGitHubUrl] = useState("");
  const [thumb, setThumb] = useState<string | null>(null);
  const [gallery, setGallery] = useState<string[]>([]);
  const [stack, setStack] = useState<string[]>([]);

  const [nameError, setNameError] = useState<string | null>(null);
  const [descriptionError, setDescriptionError] = useState<string | null>(null);
  const [liveUrlError, setLiveUrlError] = useState<string | null>(null);
  const [gitHubUrlError, setGitHubUrlError] = useState<string | null>(null);
  const [thumbError, setThumbError] = useState<string | null>(null);

  // Seed local name/liveUrl/gitHubUrl state from the loaded project exactly
  // once (keyed on project id) — the previous approach displayed the server
  // value directly whenever isEditing, which fought onChange on every
  // keystroke and made these fields appear frozen (couldn't type or delete).
  const [syncedProjectId, setSyncedProjectId] = useState<string | undefined>(
    undefined,
  );
  if (project && project.id !== syncedProjectId) {
    setSyncedProjectId(project.id);
    setName(project.name);
    setLiveUrl(project.liveUrl ?? "");
    setGitHubUrl(project.gitHubUrl ?? "");
  }

  const createProject = useCreateProject();
  const updateName = useUpdateProjectName(id ?? "");
  const updateDescription = useUpdateProjectDescription(id ?? "");
  const updateState = useUpdateProjectState(id ?? "");
  const updateThumb = useUpdateProjectThumb(id ?? "");
  const updateGallery = useUpdateProjectGallery(id ?? "");
  const updateGitHubUrl = useUpdateProjectGitHubUrl(id ?? "");
  const updateLiveUrl = useUpdateProjectLiveUrl(id ?? "");
  const updateStack = useUpdateProjectStack(id ?? "");

  const isDirty =
    !isEditing &&
    (name !== "" ||
      !isRichTextEmpty(description) ||
      liveUrl !== "" ||
      gitHubUrl !== "" ||
      thumb !== null ||
      gallery.length > 0 ||
      stack.length > 0);

  // Set right before navigating away after a successful create, so the
  // blocker below doesn't mistake the just-submitted (still "dirty" by its
  // own state check) form for someone abandoning unsaved changes.
  const skipBlockRef = useRef(false);

  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      isDirty &&
      !skipBlockRef.current &&
      currentLocation.pathname !== nextLocation.pathname,
  );

  if (isEditing && isLoading) {
    return <p className="text-text-secondary">Loading project...</p>;
  }
  if (isEditing && (isError || !project)) {
    return <p className="text-danger">Project not found.</p>;
  }

  function handleNameBlur(value: string) {
    if (isEditing && value.trim() === "") {
      setName(project?.name ?? "");
      setNameError(null);
      return;
    }
    const valid = value.length > 0 && value.length <= 50;
    setNameError(valid ? null : "Required, max 50 characters");
    if (!valid || !isEditing) return;
    if (value === project?.name) return;
    updateName.mutate({ newName: value });
  }

  function handleDescriptionBlur(html: string) {
    if (isEditing && isRichTextEmpty(html)) {
      setDescriptionResetKey((k) => k + 1);
      setDescriptionError(null);
      return;
    }
    setDescription(html);
    const valid = !isRichTextEmpty(html);
    setDescriptionError(valid ? null : "Content is required");
    if (!valid || !isEditing) return;
    if (html === project?.description) return;
    updateDescription.mutate({ newDescription: html });
  }

  function handleLiveUrlBlur(value: string) {
    const valid = value === "" || isValidUrl(value);
    setLiveUrlError(valid ? null : "Must be a valid URL");
    if (!valid || !isEditing) return;
    if (value === (project?.liveUrl ?? "")) return;
    updateLiveUrl.mutate({ newUrl: value });
  }

  function handleGitHubUrlBlur(value: string) {
    const valid = value === "" || isValidUrl(value);
    setGitHubUrlError(valid ? null : "Must be a valid URL");
    if (!valid || !isEditing) return;
    if (value === (project?.gitHubUrl ?? "")) return;
    updateGitHubUrl.mutate({ newUrl: value });
  }

  function handleStateChange(value: ProjectState) {
    setState(value);
    if (isEditing) updateState.mutate({ newState: value });
  }

  function handleThumbChange(url: string) {
    setThumbError(null);
    if (isEditing) updateThumb.mutate({ newThumb: url });
    else setThumb(url);
  }

  function handleSubmit() {
    const validName = name.length > 0 && name.length <= 50;
    const validDescription = !isRichTextEmpty(description);
    const validLiveUrl = liveUrl === "" || isValidUrl(liveUrl);
    const validGitHubUrl = gitHubUrl === "" || isValidUrl(gitHubUrl);
    const validThumb = thumb !== null;

    setNameError(validName ? null : "Required, max 50 characters");
    setDescriptionError(validDescription ? null : "Content is required");
    setLiveUrlError(validLiveUrl ? null : "Must be a valid URL");
    setGitHubUrlError(validGitHubUrl ? null : "Must be a valid URL");
    setThumbError(validThumb ? null : "A thumbnail is required");

    if (
      !validName ||
      !validDescription ||
      !validLiveUrl ||
      !validGitHubUrl ||
      !validThumb ||
      !thumb
    ) {
      return;
    }

    createProject.mutate(
      {
        name,
        description,
        projectState: state,
        liveUrl: liveUrl || null,
        gitHubUrl: gitHubUrl || null,
        galleryPictures: gallery.length > 0 ? gallery : null,
        projectStack: stack,
        thumbUrl: thumb,
      },
      {
        onSuccess: () => {
          skipBlockRef.current = true;
          navigate("/admin/projects", { replace: true });
        },
      },
    );
  }

  const displayState = isEditing ? (project?.state ?? state) : state;
  const displayThumb = isEditing ? (project?.thumb ?? null) : thumb;
  const displayGallery = isEditing ? (project?.gallery ?? []) : gallery;
  const displayStack = isEditing ? (project?.stack ?? []) : stack;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-text-primary">
        {isEditing ? "Edit Project" : "New Project"}
      </h1>

      {isEditing && project && (
        <div className="flex flex-wrap gap-4 text-xs text-text-secondary">
          <span>ID: {project.id}</span>
          <span>Owner: {project.ownerId}</span>
          <span>Uploaded: {project.uploadedDate}</span>
          {project.updatedDate && <span>Updated: {project.updatedDate}</span>}
        </div>
      )}

      <FloatingInput
        id="name"
        label="Name"
        value={name}
        error={nameError ?? undefined}
        onChange={(e) => setName(e.target.value)}
        onBlur={(e) => handleNameBlur(e.target.value)}
      />

      <RichTextEditor
        key={descriptionResetKey}
        initialContent={isEditing ? (project?.description ?? "") : description}
        onBlurContent={handleDescriptionBlur}
        error={descriptionError ?? undefined}
      />

      <div>
        <label htmlFor="state" className="mb-1 block text-sm text-text-secondary">
          State
        </label>
        <select
          id="state"
          value={displayState}
          onChange={(e) => handleStateChange(e.target.value as ProjectState)}
          className="w-full rounded-lg border border-border-default bg-bg-base/50 px-3 py-2 text-text-primary"
        >
          {PROJECT_STATES.map((s) => (
            <option key={s} value={s}>
              {PROJECT_STATE_LABELS[s]}
            </option>
          ))}
        </select>
      </div>

      <FloatingInput
        id="liveUrl"
        label="Live URL"
        value={liveUrl}
        error={liveUrlError ?? undefined}
        onChange={(e) => setLiveUrl(e.target.value)}
        onBlur={(e) => handleLiveUrlBlur(e.target.value)}
      />

      <FloatingInput
        id="gitHubUrl"
        label="GitHub URL"
        value={gitHubUrl}
        error={gitHubUrlError ?? undefined}
        onChange={(e) => setGitHubUrl(e.target.value)}
        onBlur={(e) => handleGitHubUrlBlur(e.target.value)}
      />

      <div>
        <span className="mb-1 block text-sm text-text-secondary">
          Thumbnail (required)
        </span>
        <ImageUpload
          value={displayThumb}
          onChange={handleThumbChange}
          folder="manolovpws/projects"
        />
        {thumbError && (
          <p className="mt-2 max-w-[92%] text-sm text-danger">{thumbError}</p>
        )}
      </div>

      <div>
        <span className="mb-1 block text-sm text-text-secondary">Gallery</span>
        <GalleryUpload
          value={displayGallery}
          onChange={(urls) => {
            if (isEditing) updateGallery.mutate({ newGallery: urls });
            else setGallery(urls);
          }}
          folder="manolovpws/projects"
          max={15}
        />
      </div>

      <TagInput
        label="Stack"
        value={displayStack}
        onChange={(tags) => {
          if (isEditing) updateStack.mutate({ newStack: tags });
          else setStack(tags);
        }}
      />

      {!isEditing && (
        <Button
          type="button"
          isLoading={createProject.isPending}
          onClick={handleSubmit}
          className="rounded-lg bg-accent-dark px-6 py-2 font-medium text-text-primary transition-colors duration-300 hover:bg-accent-dark/80"
        >
          Create Project
        </Button>
      )}

      <ConfirmDialog
        open={blocker.state === "blocked"}
        title="Discard unsaved changes?"
        description="You have unsaved changes to this project."
        confirmLabel="Discard"
        onConfirm={() => blocker.proceed?.()}
        onCancel={() => blocker.reset?.()}
      />
    </div>
  );
}
