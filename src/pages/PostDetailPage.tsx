import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Pin, Share2 } from "lucide-react";
import { Container } from "../shared/components/Container";
import { usePost } from "../features/posts";
import { notificationController } from "../shared/notifications/notificationController";

export function PostDetailPage() {
  const { id } = useParams();
  const { data: post, isLoading, isError } = usePost(id);

  function handleShare() {
    if (!post) return;
    const url = `${window.location.origin}/posts/${post.id}`;
    navigator.clipboard.writeText(url);
    notificationController.showSuccess("Link copied");
  }

  return (
    <Container>
      <div className="mx-auto max-w-2xl py-10">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-2 text-sm text-text-secondary transition-colors duration-300 hover:text-accent"
        >
          <ArrowLeft className="h-4 w-4" /> Back to posts
        </Link>

        {isLoading && (
          <p className="py-16 text-center text-text-secondary">
            Loading post...
          </p>
        )}

        {!isLoading && (isError || !post) && (
          <p className="py-16 text-center text-danger">
            This post couldn't be found.
          </p>
        )}

        {!isLoading && post && (
          <article
            className={`overflow-hidden rounded-xl bg-bg-surface/60 shadow-md backdrop-blur-md ${
              post.isPinned
                ? "border-2 border-accent"
                : "border border-border-default"
            }`}
          >
            {post.thumb && (
              <img
                src={post.thumb}
                alt=""
                className="h-72 w-full object-cover"
              />
            )}
            <div className="p-6">
              <div className="mb-2 flex items-center gap-2 text-xs text-text-secondary">
                {post.isPinned && (
                  <Pin
                    className="h-3.5 w-3.5 shrink-0 text-accent"
                    aria-label="Pinned"
                  />
                )}
                <span>{post.publishedDate}</span>
                {post.updatedDate && <span>(updated {post.updatedDate})</span>}
              </div>

              <div className="mb-4 flex items-start justify-between gap-4">
                <h1 className="text-2xl font-semibold text-text-primary">
                  {post.title}
                </h1>
                <button
                  type="button"
                  aria-label="Share"
                  onClick={handleShare}
                  className="shrink-0 rounded-lg p-2 text-text-secondary transition-colors duration-300 hover:text-accent"
                >
                  <Share2 className="h-4 w-4" />
                </button>
              </div>

              <div
                className="text-text-primary [&_h2]:text-xl [&_h2]:font-semibold [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5"
                dangerouslySetInnerHTML={{ __html: post.context }}
              />

              {post.gallery.length > 0 && (
                <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {post.gallery.map((url, index) => (
                    <img
                      key={`${url}-${index}`}
                      src={url}
                      alt=""
                      className="h-32 w-full rounded-lg border border-border-default object-cover"
                    />
                  ))}
                </div>
              )}
            </div>
          </article>
        )}
      </div>
    </Container>
  );
}
