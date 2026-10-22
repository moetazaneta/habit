import { useCallback, useSyncExternalStore } from "react";

/** True while the media query matches. False where `matchMedia` does not exist (jsdom). */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      if (typeof window.matchMedia !== "function") return () => {};
      const list = window.matchMedia(query);
      list.addEventListener("change", onChange);
      return () => list.removeEventListener("change", onChange);
    },
    [query],
  );
  return useSyncExternalStore(
    subscribe,
    () => typeof window.matchMedia === "function" && window.matchMedia(query).matches,
    () => false,
  );
}

/**
 * The wide layout: 7 Days instead of 5, a 20px base, and dialogs and popovers instead of bottom
 * sheets. The same breakpoint as the 20px base in styles.css.
 */
export const WIDE_QUERY = "(min-width: 40rem)";

export function useIsWide(): boolean {
  return useMediaQuery(WIDE_QUERY);
}
