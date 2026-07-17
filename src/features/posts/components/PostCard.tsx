import { Link } from "react-router-dom";
import { Pin, Share2 } from "lucide-react";
import { stripHtmlToText } from "../../../shared/components/richTextUtils";
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
    <div className={`rounded-xl ${post.isPinned ? "pinned-glow" : ""}`}>
      <article className="overflow-hidden rounded-xl border border-border-default/50 bg-bg-surface/60 shadow-md backdrop-blur-md">
        {post.thumb && (
          <img src={post.thumb} alt="" className="h-48 w-full object-cover" />
        )}
        <div className="p-5">
          <div className="mb-2 flex items-center gap-2 text-xs text-text-secondary">
            {post.isPinned && (
              <Pin className="h-3.5 w-3.5 shrink-0 text-accent" aria-label="Pinned" />
            )}
            <span>{post.publishedDate}</span>
          </div>
          <h2 className="mb-2 text-lg font-semibold text-text-primary">
            {post.title}
          </h2>
          <p className="line-clamp-3 text-sm text-text-secondary">
            {stripHtmlToText(post.context)}
          </p>
          <div className="mt-4 flex items-center gap-3">
            <Link
              to={`/posts/${post.id}`}
              className="rounded-lg border border-border-default px-4 py-2 text-sm text-text-primary transition-colors duration-300 hover:border-accent"
            >
              View post
            </Link>
            <button
              type="button"
              aria-label="Share"
              onClick={handleShare}
              className="rounded-lg p-2 text-text-secondary transition-colors duration-300 hover:text-accent"
            >
              <Share2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </article>
    </div>
  );
}
