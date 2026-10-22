import { v } from "convex/values";

import { internalMutation } from "./_generated/server";

/**
 * Deletes all the rows of one user for good, as a reset of a test user before an automated check.
 * Internal: only the Convex CLI or the dashboard can run it, for example
 * `vp -C packages/data exec convex run admin:deleteUserData '{"userId":"user_…"}'`.
 */
export const deleteUserData = internalMutation({
  args: { userId: v.string() },
  returns: v.object({ habits: v.number(), entries: v.number() }),
  handler: async (ctx, { userId }) => {
    const habits = await ctx.db
      .query("habits")
      .withIndex("by_user_and_id", (q) => q.eq("userId", userId))
      .collect();
    const entries = await ctx.db
      .query("entries")
      .withIndex("by_user_and_day", (q) => q.eq("userId", userId))
      .collect();
    for (const doc of [...habits, ...entries]) await ctx.db.delete(doc._id);
    return { habits: habits.length, entries: entries.length };
  },
});
