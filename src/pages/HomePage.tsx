import { useEffect, useRef, useState } from "react";
import { Frown } from "lucide-react";
import { Container } from "../shared/components/Container";
import { usePosts, PostCard } from "../features/posts";

const PAGE_SIZE = 6;

function SkeletonCard() {
  return (
    <div className="animate-pulse overflow-hidden rounded-xl border border-border-default/50 bg-bg-surface/60 backdrop-blur-md">
      <div className="h-48 w-full bg-bg-base/50" />
      <div className="space-y-3 p-5">
        <div className="h-3 w-24 rounded bg-bg-base/50" />
        <div className="h-5 w-3/4 rounded bg-bg-base/50" />
        <div className="h-3 w-full rounded bg-bg-base/50" />
        <div className="h-3 w-5/6 rounded bg-bg-base/50" />
      </div>
    </div>
  );
}

function EmptyPlaceholder() {
  return (
    <div className="mx-auto w-full max-w-xl overflow-hidden rounded-xl border border-border-default/50 bg-bg-surface/60 p-10 text-center shadow-md backdrop-blur-md">
      <Frown className="mx-auto mb-4 h-12 w-12 text-text-secondary" />
      <h2 className="mb-2 text-lg font-semibold text-text-primary">
        Oooops !
      </h2>
      <p className="text-sm text-text-secondary">
        We have no posts yet or DB is dead.
      </p>
    </div>
  );
}

export function HomePage() {
  const { data: posts, isLoading, isError } = usePosts();
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const sorted = posts
    ? [...posts].sort((a, b) => {
        if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
        return (
          new Date(b.publishedDate).getTime() -
          new Date(a.publishedDate).getTime()
        );
      })
    : [];

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setVisibleCount((count) => count + PAGE_SIZE);
      }
    });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  return (
    <Container>
      <div className="py-10">
        {isLoading && (
          <div className="mx-auto flex w-full max-w-xl flex-col gap-6">
            {Array.from({ length: PAGE_SIZE }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {!isLoading && isError && (
          <p className="py-16 text-center text-danger">
            Couldn't load posts. Try refreshing the page.
          </p>
        )}

        {!isLoading && !isError && sorted.length === 0 && <EmptyPlaceholder />}

        {!isLoading && !isError && sorted.length > 0 && (
          <>
            <div className="mx-auto flex w-full max-w-xl flex-col gap-6">
              {sorted.slice(0, visibleCount).map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
            {visibleCount < sorted.length && (
              <div ref={sentinelRef} className="h-1 w-full" />
            )}
          </>
        )}
      </div>
    </Container>
  );
}
