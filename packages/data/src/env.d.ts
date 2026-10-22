/// <reference types="vite-plus/client" />

interface ImportMetaEnv {
  /** The URL of the Convex deployment, such as https://….convex.cloud. */
  readonly VITE_CONVEX_URL?: string;
  /** The publishable key of the Clerk instance. */
  readonly VITE_CLERK_PUBLISHABLE_KEY?: string;
}
