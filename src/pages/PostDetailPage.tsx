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
        {/* Desktop (md:absolute md:top-16 md:left-0 md:-translate-x-1/2):
            same "sits on the card's left border" convention as
            ProjectDetailPage's identical button — this column sits well
            inside Container's own margin there, so the half-outside bleed
            lands in real empty space, clear of the header's pin badge no
            matter the title length. Used to be top-64 (vertically centered
            on the old fixed h-72 thumb) when a thumb was present — no
            longer a known constant now that the thumb's height is flexible
            (see the <img> below), so it sits at the header row instead,
            same spot the no-thumb case already used.
            Mobile (`fixed top-1/2 -translate-y-1/2 left-4`, no bleed):
            `fixed` because an `absolute` button at the header row landed
            right on top of the pin badge on mobile (no bleed margin to
            escape into on a full-width column) — see PROJECT-DETAIL.md for
            that bug's full history. Vertically centered on the viewport
            per Owner feedback, reversed from an earlier `top-24` (fixed
            just below the sticky site header) — same centering technique
            `pages/PROJECTS.md`'s pager arrows use (`top-1/2
            -translate-y-1/2` against a `fixed` ancestor centers on the
            viewport). `md:translate-y-0` cancels that translate back out
            at desktop, where `top-16` is already the real intended
            position, not something to center around. */}
        <Link
          to="/"
          aria-label="Back to posts"
          className="fixed top-1/2 left-4 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-border-default bg-bg-surface text-text-secondary shadow-sm transition-colors duration-300 hover:border-accent hover:text-accent md:absolute md:top-16 md:left-0 md:translate-y-0 md:-translate-x-1/2"
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

            {/* No fixed height / object-fit anymore, same reversal as the
                Home feed card (PostCard.tsx) — a fixed h-72 box with
                object-cover was cropping real image content, per Owner
                feedback. w-full with height left to `auto` (Tailwind
                Preflight's default for <img>) sizes off the image's own
                intrinsic aspect ratio instead — always flush edge-to-edge
                with the card, whole thumb visible, nothing cropped. */}
            {post.thumb && <img src={post.thumb} alt="" className="w-full" />}

            <div className="p-6">
              {/* [&_p:empty]:min-h-lh — TipTap saves a manually-typed blank
                  line as a literal empty <p></p> node (confirmed against
                  @tiptap/extension-paragraph's own renderHTML — no <br>
                  filler, just an empty tag). An empty, non-replaced block
                  element generates no line box at all, so with Preflight's
                  `p { margin: 0 }` it rendered with zero height — the blank
                  line the Owner typed was silently swallowed on read, not
                  trimmed by the backend or dropped by the editor on save.
                  Giving empty <p>s a min-height of one line makes them
                  render as the blank line they actually are. */}
              <div
                className="text-text-primary [&_h2]:text-xl [&_h2]:font-semibold [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5 [&_p:empty]:min-h-lh"
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
