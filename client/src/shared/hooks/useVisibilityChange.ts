import { useEffect, useRef } from "react";

interface UseVisibilityChangeOptions {
  onHidden?: () => void;
  onVisible?: () => void;
}

/**
 * Fires callbacks when the browser tab visibility changes.
 * Callbacks are stored in refs so callers don't need to memoize them.
 */
export function useVisibilityChange({ onHidden, onVisible }: UseVisibilityChangeOptions): void {
  const onHiddenRef = useRef(onHidden);
  const onVisibleRef = useRef(onVisible);
  onHiddenRef.current = onHidden;
  onVisibleRef.current = onVisible;

  useEffect(() => {
    function handleVisibilityChange() {
      if (document.visibilityState === "hidden") {
        onHiddenRef.current?.();
      } else if (document.visibilityState === "visible") {
        onVisibleRef.current?.();
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);
}
