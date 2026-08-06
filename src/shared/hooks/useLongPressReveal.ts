import { useEffect, useRef, useState } from "react";

// Mobile has no hover, so list rows across the admin panel (Posts, Projects,
// Inbox, Profile's array-tab ListEditor) reveal their action icons via
// press-and-hold instead. Deliberately NOT just CSS `:active` — that reverts
// the instant a finger lifts, but the Owner asked for the reveal to stay
// visible after release (so there's actually time to then tap Edit/Delete).
// A held id is tracked in real state instead, set once the hold clears a
// threshold (so a normal tap-to-open doesn't also flash the reveal).
const LONG_PRESS_MS = 450;

// Rows tag themselves with this attribute (their own id as the value) so the
// click-away effect below can tell "inside the currently revealed row" apart
// from "everywhere else" without this hook needing a DOM ref for every row
// in the list — it only ever needs to check one attribute on the event's
// target.
export const LONG_PRESS_ROW_ATTR = "data-long-press-id";

export function useLongPressReveal() {
  const [revealedId, setRevealedId] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const firedRef = useRef(false);

  function clearTimer() {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }

  function onTouchStart(id: string) {
    firedRef.current = false;
    clearTimer();
    timerRef.current = setTimeout(() => {
      firedRef.current = true;
      setRevealedId(id);
    }, LONG_PRESS_MS);
  }

  function onTouchEnd() {
    clearTimer();
  }

  // Call at the top of a row's onClick — a long-press's terminating touchend
  // still fires a click afterward; this swallows just that one so it
  // doesn't also trigger the row's normal tap action (e.g. navigating away
  // right as the reveal was meant to appear).
  function consumeLongPress() {
    if (firedRef.current) {
      firedRef.current = false;
      return true;
    }
    return false;
  }

  // Since the reveal deliberately stays stuck open after release (see
  // above), it needs its own dismissal: tapping/clicking anywhere outside
  // the revealed row closes it, same as a native context menu.
  useEffect(() => {
    if (revealedId === null) return;

    function handlePointerDown(e: PointerEvent) {
      const target = e.target as Element | null;
      const row = target?.closest(`[${LONG_PRESS_ROW_ATTR}]`);
      if (row?.getAttribute(LONG_PRESS_ROW_ATTR) !== revealedId) {
        setRevealedId(null);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [revealedId]);

  return { revealedId, onTouchStart, onTouchEnd, consumeLongPress };
}
