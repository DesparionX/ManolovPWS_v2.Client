import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import { Pin, Share2 } from "lucide-react";
import { notificationController } from "../../../shared/notifications/notificationController";
import type { PostReadModel } from "../types/postTypes";

interface PostCardProps {
  post: PostReadModel;
}

export function PostCard({ post }: PostCardProps) {
  function handleShare() {
    const url = `${window.location.origin}/posts/${post.id}`;
    navigator.clipboard.writeText(url);
    notificationController.showSuccess("Link copied");
  }

  return (
    <div
      className={`rounded-xl ${post.isPinned ? "state-glow" : ""}`}
      style={
        post.isPinned
          ? ({ "--glow-color": "rgba(14, 116, 144, 0.9)" } as CSSProperties)
          : undefined
      }
    >
      <article className="overflow-hidden rounded-xl border border-border-default/50 bg-bg-surface/60 shadow-md backdrop-blur-md">
        <div className="relative flex flex-col items-center px-5 pt-5 pb-3">
          {post.isPinned && (
            <Pin
              className="absolute top-5 left-5 h-5 w-5 rotate-45 text-accent"
              aria-label="Pinned"
            />
          )}
          <button
            type="button"
            aria-label="Share"
            onClick={handleShare}
            className="absolute top-4 right-4 rounded-lg p-1 text-text-secondary transition-colors duration-300 hover:text-accent"
          >
            <Share2 className="h-4 w-4" />
          </button>
          <h2 className="text-center text-lg font-semibold text-text-primary">
            {post.title}
          </h2>
          <p className="mt-1 text-center text-xs text-text-secondary">
            {post.publishedDate}
          </p>
        </div>

        {post.thumb && (
          <img src={post.thumb} alt="" className="h-48 w-full object-cover" />
        )}

        <div className="p-5">
          {/* Real HTML, same convention as the Post/Project detail pages —
              line-clamp-3 only visually hides overflow (webkit-line-clamp
              doesn't touch the DOM), so it's safe to clamp actual rendered
              markup instead of the plain-text-stripped preview this used to
              show. */}
          <div
            className="line-clamp-3 text-sm text-text-secondary [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-text-primary [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5"
            dangerouslySetInnerHTML={{ __html: post.context }}
          />
          <div className="mt-4 flex justify-center">
            <Link
              to={`/posts/${post.id}`}
              className="rounded-lg border border-border-default px-4 py-2 text-sm text-text-primary transition-colors duration-300 hover:border-accent"
            >
              View post
            </Link>
          </div>
        </div>
      </article>
    </div>
  );
}
