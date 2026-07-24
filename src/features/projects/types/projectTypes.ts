export type ProjectState = "InDevelopment" | "Finished" | "Frozen" | "Abandoned";

export const PROJECT_STATES: ProjectState[] = [
  "InDevelopment",
  "Finished",
  "Frozen",
  "Abandoned",
];

export const PROJECT_STATE_LABELS: Record<ProjectState, string> = {
  InDevelopment: "In Development",
  Finished: "Finished",
  Frozen: "Frozen",
  Abandoned: "Abandoned",
};

// Final per-state color mapping (see THEME.md's Color Palette) — reuses the
// existing accent/success/danger tokens for Finished/InDevelopment/Abandoned,
// plus a new "frozen" indigo token added specifically for the Frozen state.
export const PROJECT_STATE_GLOW_COLORS: Record<ProjectState, string> = {
  Finished: "rgba(74, 222, 128, 0.85)",
  InDevelopment: "rgba(34, 211, 238, 0.85)",
  Frozen: "rgba(129, 140, 248, 0.85)",
  Abandoned: "rgba(248, 113, 113, 0.85)",
};

export const PROJECT_STATE_BADGE_CLASSES: Record<ProjectState, string> = {
  Finished: "bg-success/15 text-success",
  InDevelopment: "bg-accent/15 text-accent",
  Frozen: "bg-frozen/15 text-frozen",
  Abandoned: "bg-danger/15 text-danger",
};

export interface ProjectReadModel {
  id: string;
  ownerId: string;
  name: string;
  description: string;
  state: ProjectState;
  liveUrl: string | null;
  gitHubUrl: string | null;
  uploadedDate: string;
  updatedDate: string | null;
  gallery: string[];
  thumb: string;
  stack: string[];
}

export interface AddProjectRequest {
  name: string;
  description: string;
  projectState: ProjectState;
  liveUrl: string | null;
  gitHubUrl: string | null;
  galleryPictures: string[] | null;
  projectStack: string[];
  thumbUrl: string;
}

export interface ChangeProjectNameRequest {
  newName: string;
}

export interface UpdateProjectDescriptionRequest {
  newDescription: string;
}

export interface ChangeProjectStateRequest {
  newState: ProjectState;
}

export interface ChangeProjectThumbRequest {
  newThumb: string;
}

export interface UpdateProjectGalleryRequest {
  newGallery: string[];
}

export interface ChangeProjectGitHubUrlRequest {
  newUrl: string;
}

export interface ChangeProjectLiveUrlRequest {
  newUrl: string;
}

export interface UpdateProjectStackRequest {
  newStack: string[];
}
