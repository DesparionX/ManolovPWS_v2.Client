import { Fragment, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Trash2, Pin, PinOff, Plus } from "lucide-react";
import { usePosts, useTogglePostPin, useDeletePost } from "../../features/posts";
import { ConfirmDialog } from "../../shared/components/ConfirmDialog";
import {
  useLongPressReveal,
  LONG_PRESS_ROW_ATTR,
} from "../../shared/hooks/useLongPressReveal";

export function PostsPage() {
  const navigate = useNavigate();
  const { data: posts, isLoading, isError } = usePosts();
  const togglePin = useTogglePostPin();
  const deletePost = useDeletePost();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { revealedId, onTouchStart, onTouchEnd, consumeLongPress } = useLongPressReveal();

  if (isLoading) return <p className="text-text-secondary">Loading posts...</p>;
  if (isError || !posts) {
    return <p className="text-danger">Couldn't load posts. Try refreshing the page.</p>;
  }

  const sorted = [...posts].sort(
    (a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime(),
  );

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1">
        {sorted.length === 0 ? (
          <p className="text-text-secondary">No posts yet.</p>
        ) : (
          <div>
            {sorted.map((post, index) => (
              <Fragment key={post.id}>
                {index > 0 && <div className="mx-auto h-px w-4/5 bg-border-default" />}
                <div
                  {...{ [LONG_PRESS_ROW_ATTR]: post.id }}
                  onClick={() => {
                    if (consumeLongPress()) return;
                    navigate(`/admin/posts/${post.id}`);
                  }}
                  onTouchStart={() => onTouchStart(post.id)}
                  onTouchEnd={onTouchEnd}
                  onTouchMove={onTouchEnd}
                  className="group grid cursor-pointer grid-cols-[1fr_auto_1fr] items-center gap-3 rounded-lg px-3 py-3 transition-colors duration-300 select-none hover:bg-bg-surface/80"
                >
                  <div />
                  <div className="flex min-w-0 items-center justify-center gap-2">
                    {post.isPinned && (
                      <Pin className="h-4 w-4 shrink-0 text-accent" aria-label="Pinned" />
                    )}
                    <p className="truncate text-text-primary">{post.title}</p>
                  </div>
                  <div
                    className={`flex shrink-0 justify-end gap-1 transition-opacity duration-300 group-hover:opacity-100 ${
                      revealedId === post.id ? "opacity-100" : "opacity-0"
                    }`}
                  >
                    <button
                      type="button"
                      aria-label={post.isPinned ? "Unpin" : "Pin"}
                      onClick={(e) => {
                        e.stopPropagation();
                        togglePin.mutate(post.id);
                      }}
                      className={`rounded-lg p-2 transition-colors duration-300 ${
                        revealedId === post.id
                          ? "text-accent"
                          : "text-text-secondary hover:text-accent"
                      }`}
                    >
                      {post.isPinned ? (
                        <PinOff className="h-4 w-4" />
                      ) : (
                        <Pin className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      type="button"
                      aria-label="Edit"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/admin/posts/${post.id}`);
                      }}
                      className={`rounded-lg p-2 transition-colors duration-300 ${
                        revealedId === post.id
                          ? "text-accent"
                          : "text-text-secondary hover:text-accent"
                      }`}
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      aria-label="Delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteId(post.id);
                      }}
                      className={`rounded-lg p-2 transition-colors duration-300 ${
                        revealedId === post.id
                          ? "text-danger"
                          : "text-text-secondary hover:text-danger"
                      }`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </Fragment>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 flex justify-center">
        <button
          type="button"
          onClick={() => navigate("/admin/posts/new")}
          aria-label="New post"
          className="flex items-center gap-2 rounded-lg border border-dashed border-border-default px-4 py-2 text-sm text-text-secondary transition-colors duration-300 hover:border-accent hover:text-accent"
        >
          <Plus className="h-4 w-4" /> New Post
        </button>
      </div>

      <ConfirmDialog
        open={deleteId !== null}
        title="Delete this post?"
        description="This can't be undone."
        isLoading={deletePost.isPending}
        onConfirm={() => {
          if (deleteId) deletePost.mutate(deleteId);
          setDeleteId(null);
        }}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
