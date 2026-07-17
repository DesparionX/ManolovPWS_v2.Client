import { useRef, useState } from "react";
import { useNavigate, useParams, useBlocker } from "react-router-dom";
import { Pin } from "lucide-react";
import { FloatingInput } from "../../shared/components/FloatingInput";
import { RichTextEditor } from "../../shared/components/RichTextEditor";
import { isRichTextEmpty } from "../../shared/components/richTextUtils";
import { ImageUpload } from "../../shared/components/ImageUpload";
import { GalleryUpload } from "../../shared/components/GalleryUpload";
import { Button } from "../../shared/components/Button";
import { ConfirmDialog } from "../../shared/components/ConfirmDialog";
import {
  usePost,
  useCreatePost,
  useUpdatePostTitle,
  useUpdatePostContext,
  useUpdatePostThumb,
  useUpdatePostGallery,
  useTogglePostPin,
  useDeletePost,
} from "../../features/posts";

export function PostEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const { data: post, isLoading, isError } = usePost(id);

  const [title, setTitle] = useState("");
  const [context, setContext] = useState("");
  const [contextResetKey, setContextResetKey] = useState(0);
  const [thumb, setThumb] = useState<string | null>(null);
  const [gallery, setGallery] = useState<string[]>([]);
  const [isPinned, setIsPinned] = useState(false);
  const [titleError, setTitleError] = useState<string | null>(null);
  const [contextError, setContextError] = useState<string | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  // Seed local title state from the loaded post exactly once (keyed on post
  // id, not on every refetch) — the previous approach displayed post.title
  // directly whenever isEditing, which fought the onChange handler on every
  // keystroke and made the field appear frozen (couldn't type or delete).
  const [syncedPostId, setSyncedPostId] = useState<string | undefined>(
    undefined,
  );
  if (post && post.id !== syncedPostId) {
    setSyncedPostId(post.id);
    setTitle(post.title);
  }

  const createPost = useCreatePost();
  const updateTitle = useUpdatePostTitle(id ?? "");
  const updateContext = useUpdatePostContext(id ?? "");
  const updateThumb = useUpdatePostThumb(id ?? "");
  const updateGallery = useUpdatePostGallery(id ?? "");
  const togglePin = useTogglePostPin();
  const deletePost = useDeletePost();

  const isDirty =
    !isEditing &&
    (title !== "" ||
      !isRichTextEmpty(context) ||
      thumb !== null ||
      gallery.length > 0 ||
      isPinned);

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
    return <p className="text-text-secondary">Loading post...</p>;
  }
  if (isEditing && (isError || !post)) {
    return <p className="text-danger">Post not found.</p>;
  }

  function handleTitleBlur(value: string) {
    if (isEditing && value.trim() === "") {
      setTitle(post?.title ?? "");
      setTitleError(null);
      return;
    }
    const valid = value.length > 0 && value.length <= 50;
    setTitleError(valid ? null : "Required, max 50 characters");
    if (!valid || !isEditing) return;
    if (value === post?.title) return;
    updateTitle.mutate({ newTitle: value });
  }

  function handleContextBlur(html: string) {
    if (isEditing && isRichTextEmpty(html)) {
      setContextResetKey((k) => k + 1);
      setContextError(null);
      return;
    }
    setContext(html);
    const valid = !isRichTextEmpty(html);
    setContextError(valid ? null : "Content is required");
    if (!valid || !isEditing) return;
    if (html === post?.context) return;
    updateContext.mutate({ newContext: html });
  }

  function handleSubmit() {
    const validTitle = title.length > 0 && title.length <= 50;
    const validContext = !isRichTextEmpty(context);
    setTitleError(validTitle ? null : "Required, max 50 characters");
    setContextError(validContext ? null : "Content is required");
    if (!validTitle || !validContext) return;

    createPost.mutate(
      {
        title,
        context,
        thumb,
        gallery: gallery.length > 0 ? gallery : null,
        isPinned,
      },
      {
        onSuccess: () => {
          skipBlockRef.current = true;
          navigate("/admin/posts", { replace: true });
        },
      },
    );
  }

  const displayThumb = isEditing ? (post?.thumb ?? null) : thumb;
  const displayGallery = isEditing ? (post?.gallery ?? []) : gallery;
  const displayPinned = isEditing ? (post?.isPinned ?? false) : isPinned;

  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center gap-6">
      <h1 className="text-xl font-semibold text-text-primary">
        {isEditing ? "Edit Post" : "New Post"}
      </h1>

      <div className="flex w-full flex-col items-center">
        <span className="mb-1 block text-sm text-text-secondary">Thumbnail</span>
        <ImageUpload
          value={displayThumb}
          onChange={(url) => {
            if (isEditing) updateThumb.mutate({ newThumb: url });
            else setThumb(url);
          }}
          folder="manolovpws/posts"
        />
      </div>

      <div className="flex w-full items-center gap-3">
        <div className="flex-1">
          <FloatingInput
            id="title"
            label="Title"
            value={title}
            error={titleError ?? undefined}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={(e) => handleTitleBlur(e.target.value)}
          />
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={displayPinned}
          aria-label={displayPinned ? "Unpin post" : "Pin post"}
          onClick={() => {
            if (isEditing && id) togglePin.mutate(id);
            else setIsPinned((p) => !p);
          }}
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg transition-colors duration-300 ${
            displayPinned
              ? "text-accent"
              : "text-text-secondary hover:text-text-primary"
          }`}
        >
          <Pin className={`h-6 w-6 ${displayPinned ? "fill-accent" : ""}`} />
        </button>
      </div>

      <div className="w-full">
        <RichTextEditor
          key={contextResetKey}
          initialContent={isEditing ? (post?.context ?? "") : context}
          onBlurContent={handleContextBlur}
          error={contextError ?? undefined}
        />
      </div>

      <div className="w-full rounded-xl border border-border-default p-4">
        <p className="mb-4 text-sm font-semibold text-text-primary">Gallery</p>
        <GalleryUpload
          value={displayGallery}
          onChange={(urls) => {
            if (isEditing) updateGallery.mutate({ newGallery: urls });
            else setGallery(urls);
          }}
          folder="manolovpws/posts"
          max={15}
        />
      </div>

      {!isEditing && (
        <Button
          type="button"
          isLoading={createPost.isPending}
          onClick={handleSubmit}
          className="rounded-lg bg-accent-dark px-6 py-2 font-medium text-text-primary transition-colors duration-300 hover:bg-accent-dark/80"
        >
          Create Post
        </Button>
      )}

      {isEditing && (
        <Button
          type="button"
          isLoading={deletePost.isPending}
          onClick={() => setConfirmDeleteOpen(true)}
          className="rounded-lg bg-danger px-6 py-2 font-medium text-text-primary transition-colors duration-300 hover:bg-danger/80"
        >
          Delete Post
        </Button>
      )}

      {isEditing && post && (
        <div className="grid w-full grid-cols-2 gap-x-4 gap-y-2 text-xs text-text-secondary">
          <span>ID: {post.id}</span>
          <span>Author: {post.authorId}</span>
          <span>Published: {post.publishedDate}</span>
          {post.updatedDate && <span>Updated: {post.updatedDate}</span>}
        </div>
      )}

      <ConfirmDialog
        open={blocker.state === "blocked"}
        title="Discard unsaved changes?"
        description="You have unsaved changes to this post."
        confirmLabel="Discard"
        onConfirm={() => blocker.proceed?.()}
        onCancel={() => blocker.reset?.()}
      />

      <ConfirmDialog
        open={confirmDeleteOpen}
        title="Delete this post?"
        description="This can't be undone."
        isLoading={deletePost.isPending}
        onConfirm={() => {
          if (id) {
            deletePost.mutate(id, {
              onSuccess: () => navigate("/admin/posts", { replace: true }),
            });
          }
          setConfirmDeleteOpen(false);
        }}
        onCancel={() => setConfirmDeleteOpen(false)}
      />
    </div>
  );
}
