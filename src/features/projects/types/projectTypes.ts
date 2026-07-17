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
