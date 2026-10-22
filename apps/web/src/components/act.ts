import type { Action } from "@habit/core";
import { usePerform, type PerformResult } from "@habit/data";
import { useCallback } from "react";

import { dismissToast, toastSaveError, toastUndo } from "@/components/toast";

export interface ActOptions {
  /** Show an Undo toast with this message, such as "Painted 3 days". */
  undo?: string;
}

/**
 * Performs an Action with the app's feedback: the change shows at once, an optional Undo toast
 * performs its inverse, and a failed write (already rolled back on screen) shows "Couldn't save"
 * with a Retry that performs the same Action again. Writes carry values, not toggles, so a retry
 * is safe (ADR 0002).
 */
export function useAct(): (action: Action, options?: ActOptions) => PerformResult {
  const perform = usePerform();
  return useCallback(
    (action: Action, options?: ActOptions) => {
      const run = (current: Action, currentOptions?: ActOptions): PerformResult => {
        const result = perform(current);
        const undoToast =
          currentOptions?.undo === undefined
            ? undefined
            : toastUndo(currentOptions.undo, () => run(result.inverse));
        result.done.catch(() => {
          if (undoToast !== undefined) dismissToast(undoToast);
          toastSaveError(() => run(current, currentOptions));
        });
        return result;
      };
      return run(action, options);
    },
    [perform],
  );
}
