import type { Action, Habit } from "@habit/core";
import type { OptimisticLocalStore } from "convex/browser";

import { api } from "../convex/_generated/api";
import { monthRange } from "../convex/range";
import { applyToData } from "./state";

/**
 * The optimistic update of `data.perform`: applies the Action with `applyAction`, as the server
 * does, to each loaded result of the live window and of the older Months. Convex rolls it back
 * when the server answers, with the server's data or after an error.
 */
export function performOptimistically(
  store: OptimisticLocalStore,
  args: { action: Action; now: number },
): void {
  // The Habits before the Action: the month results have none, but the Action can need them.
  let habits: Habit[] | undefined;
  for (const { args: range, value } of store.getAllQueries(api.data.days)) {
    if (value === undefined) continue;
    habits ??= value.habits;
    const next = applyToData(value, range, args.action, args.now);
    if (next !== null) store.setQuery(api.data.days, range, next);
  }
  for (const { args: monthArgs, value } of store.getAllQueries(api.data.month)) {
    if (value === undefined) continue;
    const data = { habits: habits ?? [], entries: value.entries };
    const next = applyToData(data, monthRange(monthArgs.month), args.action, args.now);
    if (next !== null)
      store.setQuery(api.data.month, monthArgs, { habits: [], entries: next.entries });
  }
}
