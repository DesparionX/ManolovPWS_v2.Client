import { useEffect, useRef, useState } from "react";

const DEFAULT_GUARD_PX = 80;

// Hides on scroll-down (past `guardPx`, so it doesn't hide right at the top
// of a barely-scrolled page — pass 0 for "hide immediately, any downward
// movement at all"), reveals on any scroll-up, at any depth. Used by
// Header.tsx's top bar.
export function useHideOnScroll(guardPx: number = DEFAULT_GUARD_PX) {
  const [hidden, setHidden] = useState(false);
  const lastScrollYRef = useRef(0);
  const tickingRef = useRef(false);

  useEffect(() => {
    function handleScroll() {
      if (tickingRef.current) return;
      tickingRef.current = true;
      requestAnimationFrame(() => {
        const currentY = window.scrollY;
        const lastY = lastScrollYRef.current;
        if (currentY > lastY && currentY > guardPx) {
          setHidden(true);
        } else if (currentY < lastY) {
          setHidden(false);
        }
        lastScrollYRef.current = currentY;
        tickingRef.current = false;
      });
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [guardPx]);

  return hidden;
}
