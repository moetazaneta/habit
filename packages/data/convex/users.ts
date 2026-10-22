import { v } from "convex/values";

import { query } from "./_generated/server";
import { isOwner } from "./functions";

/**
 * Who the caller is, for the "no access" screen: the Clerk user id and whether it is an owner.
 * Null when the caller is not signed in. Any signed-in user can call it.
 */
export const me = query({
  args: {},
  returns: v.union(v.null(), v.object({ userId: v.string(), isOwner: v.boolean() })),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) return null;
    return { userId: identity.subject, isOwner: isOwner(identity.subject) };
  },
});
