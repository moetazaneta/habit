import { createRouter, type RouterHistory } from "@tanstack/react-router";

import { routeTree } from "@/routeTree.gen";

/** The app's router; tests pass a memory history. */
export function createAppRouter(history?: RouterHistory) {
  let shownPath: string | undefined;
  return createRouter({
    routeTree,
    ...(history === undefined ? {} : { history }),
    // A new screen starts at the top, and the back gesture returns to a screen where it was left
    // (the list keeps its scroll). A sheet (`?new`, `?edit`, `?entry`) changes only the search
    // params of the same screen: it leaves the scroll alone, also when it closes.
    scrollRestoration: ({ location }) => {
      const sameScreen = location.pathname === shownPath;
      shownPath = location.pathname;
      return !sameScreen;
    },
  });
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof createAppRouter>;
  }
}
