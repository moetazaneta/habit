/**
 * The owner test user of the Clerk development instance. The command below keeps it in the list
 * of owners, so the automated checks still work (docs/notes/data.md).
 */
export const TEST_OWNER_ID = "user_3L3tBtYfJHjf9ZrdScO5oy8SQwe";

/** The name of a Convex deployment from its URL: `https://<name>.convex.cloud`. */
export function deploymentName(convexUrl: string | undefined): string | null {
  if (convexUrl === undefined || convexUrl === "") return null;
  try {
    const host = new URL(convexUrl).hostname;
    return host.endsWith(".convex.cloud") ? host.slice(0, -".convex.cloud".length) : null;
  } catch {
    return null;
  }
}

/**
 * The command that makes `userId` an owner, as docs/notes/data.md gives it: run from the
 * repository root, it sets the owner list of the deployment to the test owner and this user.
 */
export function ownerCommand(userId: string, deployment: string | null): string {
  return [
    "vp -C packages/data exec convex env set",
    `--deployment ${deployment ?? "<deployment>"}`,
    `OWNER_USER_IDS "${TEST_OWNER_ID},${userId}"`,
  ].join(" ");
}
