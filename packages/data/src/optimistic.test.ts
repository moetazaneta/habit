import type { Action, Day, HabitId } from "@habit/core";
import type { OptimisticLocalStore } from "convex/browser";
import { getFunctionName } from "convex/server";
import { describe, expect, test } from "vite-plus/test";

import { api } from "../convex/_generated/api";
import { performOptimistically } from "./optimistic";
import type { Data } from "./state";
import { checkHabit, entry } from "./test/fixtures";

/** A local store with query results, as Convex keeps them on the client. */
function localStore(queries: { name: string; args: Record<string, unknown>; value?: Data }[]) {
  const store: OptimisticLocalStore = {
    getQuery: () => undefined,
    getAllQueries: ((query: Parameters<OptimisticLocalStore["getAllQueries"]>[0]) =>
      queries
        .filter((q) => q.name === getFunctionName(query))
        .map((q) => ({ args: q.args, value: q.value }))) as OptimisticLocalStore["getAllQueries"],
    setQuery: ((query, args, value) => {
      const found = queries.find(
        (q) => q.name === getFunctionName(query) && JSON.stringify(q.args) === JSON.stringify(args),
      );
      if (found) found.value = value as Data;
    }) as OptimisticLocalStore["setQuery"],
  };
  return { store, queries };
}

const water = "water" as HabitId;
const days = getFunctionName(api.data.days);
const month = getFunctionName(api.data.month);

describe("performOptimistically", () => {
  test("applies the Action to the live window and to the loaded older Months", () => {
    const { store, queries } = localStore([
      {
        name: days,
        args: { from: "2025-10-01", to: "2026-10-22" },
        value: { habits: [checkHabit("water")], entries: [entry("water", "2026-10-20")] },
      },
      { name: month, args: { month: "2025-09" }, value: { habits: [], entries: [] } },
      { name: month, args: { month: "2025-08" } },
    ]);
    const paint: Action = {
      type: "batch",
      actions: [
        { type: "setEntry", habitId: water, day: "2025-09-30" as Day, value: { kind: "check" } },
        { type: "setEntry", habitId: water, day: "2026-10-21" as Day, value: { kind: "check" } },
        { type: "clearEntry", habitId: water, day: "2026-10-20" as Day },
      ],
    };

    performOptimistically(store, { action: paint, now: 50 });

    // Each result keeps only the Days of its range, and a cleared Entry is gone.
    expect(queries[0]?.value?.entries).toEqual([entry("water", "2026-10-21", { updatedAt: 50 })]);
    expect(queries[1]?.value).toEqual({
      habits: [],
      entries: [entry("water", "2025-09-30", { updatedAt: 50 })],
    });
    // A Month that is still loading stays loading.
    expect(queries[2]?.value).toBeUndefined();
  });

  test("changes the Habits of the live window", () => {
    const { store, queries } = localStore([
      {
        name: days,
        args: { from: "2025-10-01", to: "2026-10-22" },
        value: { habits: [checkHabit("water")], entries: [] },
      },
    ]);

    performOptimistically(store, { action: { type: "deleteHabit", id: water }, now: 70 });

    expect(queries[0]?.value?.habits[0]).toMatchObject({ id: water, deletedAt: 70 });
  });
});
