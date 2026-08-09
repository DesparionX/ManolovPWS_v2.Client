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
          {/* w-full + truncate — without an explicit width the h2 just
              shrink-wraps its own text, so a long title never actually hit
              the box edge to get clipped; truncate needs a real width to
              overflow against. px-8 (wider than the pin/share icons' own
              ~top-4/top-5 inset) keeps the ellipsis from ever landing
              underneath either icon instead of just before it. */}
          <h2 className="w-full truncate px-8 text-center text-lg font-semibold text-text-primary">
            {post.title}
          </h2>
          <p className="mt-1 text-center text-xs text-text-secondary">
            {post.publishedDate}
          </p>
        </div>

        {/* No fixed height / object-fit anymore — per Owner feedback, a
            fixed h-48 box with object-contain still left the image
            pillarboxed (blank space on the sides, not flush to the card's
            own edges) whenever the image was taller/narrower than the box's
            own aspect ratio. w-full with height left to `auto` (Tailwind
            Preflight's default for <img>) sizes purely off the image's own
            intrinsic aspect ratio instead — width always spans edge-to-edge
            flush against the card, height follows proportionally, so the
            whole thumb is always visible with nothing cropped or padded. */}
        {post.thumb && <img src={post.thumb} alt="" className="w-full" />}

        <div className="p-5">
          {/* Real HTML, same convention as the Post/Project detail pages —
              line-clamp-9 only visually hides overflow (webkit-line-clamp
              doesn't touch the DOM), so it's safe to clamp actual rendered
              markup instead of the plain-text-stripped preview this used to
              show. [&_p:empty]:min-h-lh — see PostDetailPage.tsx for why
              this is needed (blank lines TipTap saves as literal empty <p>
              tags otherwise collapse to zero height). */}
          <div
            className="line-clamp-9 text-sm text-text-secondary [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-text-primary [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5 [&_p:empty]:min-h-lh"
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
