import { customCtx, customMutation, customQuery } from "convex-helpers/server/customFunctions";
import type { Auth } from "convex/server";
import { ConvexError } from "convex/values";

import { mutation, query } from "./_generated/server";

/** The Clerk user ids that may use the data: OWNER_USER_IDS, comma-separated. */
export function ownerUserIds(): string[] {
  return (process.env.OWNER_USER_IDS ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter((id) => id !== "");
}

export function isOwner(userId: string): boolean {
  return ownerUserIds().includes(userId);
}

/** The Clerk user id of the caller. Throws unless the caller is signed in and is an owner. */
async function requireOwner(ctx: { auth: Auth }): Promise<{ userId: string }> {
  const identity = await ctx.auth.getUserIdentity();
  if (identity === null) throw new ConvexError({ code: "unauthenticated" });
  if (!isOwner(identity.subject)) throw new ConvexError({ code: "forbidden" });
  return { userId: identity.subject };
}

/** A query that only an owner can call. `ctx.userId` is the caller's Clerk user id. */
export const authQuery = customQuery(query, customCtx(requireOwner));

/** A mutation that only an owner can call. `ctx.userId` is the caller's Clerk user id. */
export const authMutation = customMutation(mutation, customCtx(requireOwner));
