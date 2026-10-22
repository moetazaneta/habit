import { useCallback, useEffect, useMemo, useRef } from "react";

/** How long a field waits after the last key press before it saves. */
export const TYPING_DELAY_MS = 400;

export interface DebouncedCommits {
  /** Saves later: a new call for the same key replaces the waiting one. */
  schedule: (key: string, commit: () => void) => void;
  /** Saves the waiting change of a key now (on blur), or of every key. */
  flush: (key?: string) => void;
  /** Drops the waiting change of a key: its field is not valid now. */
  cancel: (key: string) => void;
}

/**
 * Debounced saves, one per field, for the edit form: each key press applies after a short pause,
 * so a name typed fast is one write, not twelve. Whatever still waits is saved when the form goes
 * away, so a close never loses the last letters.
 */
export function useDebouncedCommits(delayMs = TYPING_DELAY_MS): DebouncedCommits {
  const pending = useRef(new Map<string, { commit: () => void; timer: number }>());

  const flush = useCallback((key?: string) => {
    for (const [name, entry] of pending.current) {
      if (key !== undefined && name !== key) continue;
      window.clearTimeout(entry.timer);
      pending.current.delete(name);
      entry.commit();
    }
  }, []);

  const cancel = useCallback((key: string) => {
    const entry = pending.current.get(key);
    if (entry === undefined) return;
    window.clearTimeout(entry.timer);
    pending.current.delete(key);
  }, []);

  const schedule = useCallback(
    (key: string, commit: () => void) => {
      cancel(key);
      const timer = window.setTimeout(() => {
        pending.current.delete(key);
        commit();
      }, delayMs);
      pending.current.set(key, { commit, timer });
    },
    [cancel, delayMs],
  );

  useEffect(() => () => flush(), [flush]);

  return useMemo(() => ({ schedule, flush, cancel }), [schedule, flush, cancel]);
}
