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
      <div className="relative mx-auto max-w-2xl py-10">
        <Link
          to="/"
          aria-label="Back to posts"
          className={`absolute left-0 z-10 flex h-9 w-9 -translate-x-1/2 items-center justify-center rounded-full border border-border-default bg-bg-surface text-text-secondary shadow-sm transition-colors duration-300 hover:border-accent hover:text-accent ${
            post?.thumb ? "top-64" : "top-16"
          }`}
        >
          <ArrowLeft className="h-4 w-4" />
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
          <article className="overflow-hidden rounded-xl border border-border-default/50 bg-bg-surface/60 shadow-md backdrop-blur-md">
            <div className="relative flex items-center justify-center px-6 pt-6 pb-4">
              {post.isPinned && (
                <Pin
                  className="absolute left-6 h-5 w-5 rotate-45 text-accent"
                  aria-label="Pinned"
                />
              )}
              <h1 className="text-center text-2xl font-semibold text-text-primary">
                {post.title}
              </h1>
              <button
                type="button"
                aria-label="Share"
                onClick={handleShare}
                className="absolute right-6 rounded-lg p-2 text-text-secondary transition-colors duration-300 hover:text-accent"
              >
                <Share2 className="h-4 w-4" />
              </button>
            </div>

            {post.thumb && (
              <img
                src={post.thumb}
                alt=""
                className="h-72 w-full object-cover"
              />
            )}

            <div className="p-6">
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

              <div className="mt-6 text-center text-xs text-text-secondary">
                <span>{post.publishedDate}</span>
                {post.updatedDate && (
                  <span> (updated {post.updatedDate})</span>
                )}
              </div>
            </div>
          </article>
        )}
      </div>
    </Container>
  );
}
