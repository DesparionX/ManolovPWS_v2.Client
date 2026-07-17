import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Trash2, Pin, PinOff, Plus } from "lucide-react";
import { usePosts, useTogglePostPin, useDeletePost } from "../../features/posts";
import { ConfirmDialog } from "../../shared/components/ConfirmDialog";

export function PostsPage() {
  const navigate = useNavigate();
  const { data: posts, isLoading, isError } = usePosts();
  const togglePin = useTogglePostPin();
  const deletePost = useDeletePost();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  if (isLoading) return <p className="text-text-secondary">Loading posts...</p>;
  if (isError || !posts) {
    return <p className="text-danger">Couldn't load posts. Try refreshing the page.</p>;
  }

  const sorted = [...posts].sort(
    (a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime(),
  );

  return (
    <div className="flex h-full flex-col">
      <h1 className="mb-6 text-center text-xl font-semibold text-text-primary">
        All Posts
      </h1>

      <div className="flex-1">
        {sorted.length === 0 ? (
          <p className="text-text-secondary">No posts yet.</p>
        ) : (
          <div className="divide-y divide-border-default">
            {sorted.map((post) => (
              <div
                key={post.id}
                className="group flex items-center justify-between gap-3 rounded-lg px-3 py-3 transition-colors duration-300 hover:bg-bg-surface/80"
              >
                <div className="flex min-w-0 items-center gap-2">
                  {post.isPinned && (
                    <Pin className="h-4 w-4 shrink-0 text-accent" aria-label="Pinned" />
                  )}
                  <p className="truncate text-text-primary">{post.title}</p>
                </div>
                <div className="flex shrink-0 gap-1 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <button
                    type="button"
                    aria-label={post.isPinned ? "Unpin" : "Pin"}
                    onClick={() => togglePin.mutate(post.id)}
                    className="rounded-lg p-2 text-text-secondary transition-colors duration-300 hover:text-accent"
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
                    onClick={() => navigate(`/admin/posts/${post.id}`)}
                    className="rounded-lg p-2 text-text-secondary transition-colors duration-300 hover:text-accent"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    aria-label="Delete"
                    onClick={() => setDeleteId(post.id)}
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
