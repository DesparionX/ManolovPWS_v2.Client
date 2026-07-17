export interface PostReadModel {
  id: string;
  authorId: string;
  title: string;
  context: string;
  thumb: string | null;
  gallery: string[];
  publishedDate: string;
  updatedDate: string | null;
  isPinned: boolean;
}

export interface NewPostRequest {
  title: string;
  context: string;
  thumb: string | null;
  gallery: string[] | null;
  isPinned: boolean;
}

export interface UpdatePostTitleRequest {
  newTitle: string;
}

export interface UpdatePostContextRequest {
  newContext: string;
}

export interface UpdatePostThumbRequest {
  newThumb: string | null;
}

export interface UpdatePostGalleryRequest {
  newGallery: string[];
}
