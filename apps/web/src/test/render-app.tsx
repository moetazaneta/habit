import { FakeHabitDataProvider } from "@habit/data/testing";
import { createMemoryHistory, RouterProvider } from "@tanstack/react-router";
import { render } from "@testing-library/react";
import type { ComponentProps } from "react";

import { createAppRouter } from "@/router";

type FakeData = Omit<ComponentProps<typeof FakeHabitDataProvider>, "children">;

/**
 * Renders the whole app at `path`, with a memory history in place of the browser's, on the
 * in-memory data provider (the demo data unless `data.initial` says otherwise).
 */
export function renderApp(path = "/", data: FakeData = {}) {
  const router = createAppRouter(createMemoryHistory({ initialEntries: [path] }));
  return {
    router,
    ...render(
      <FakeHabitDataProvider {...data}>
        <RouterProvider router={router} />
      </FakeHabitDataProvider>,
    ),
  };
}
