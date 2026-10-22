import type { ReactNode } from "react";

/**
 * The real provider: Clerk sign-in, Convex data, optimistic updates, the IndexedDB snapshot for an
 * instant start (docs/v1.md). It reads `VITE_CONVEX_URL` and `VITE_CLERK_PUBLISHABLE_KEY`.
 */
export function HabitDataProvider(props: { children: ReactNode }): ReactNode {
  void props;
  throw new Error("@habit/data: HabitDataProvider is not implemented yet");
}
