import type { AuthConfig } from "convex/server";

// Clerk issues the JWT (template "convex"). CLERK_JWT_ISSUER_DOMAIN is the Frontend API URL of the
// Clerk instance, set with `convex env set`.
const domain = process.env.CLERK_JWT_ISSUER_DOMAIN;
if (domain === undefined) throw new Error("Set CLERK_JWT_ISSUER_DOMAIN in the Convex deployment");

export default {
  providers: [{ domain, applicationID: "convex" }],
} satisfies AuthConfig;
