import { HabitDataContext, type HabitDataApi } from "@habit/data";
import { FakeHabitDataProvider } from "@habit/data/testing";
import { createMemoryHistory, RouterProvider } from "@tanstack/react-router";
import { render } from "@testing-library/react";
import { useContext, type ComponentProps, type ReactNode } from "react";

import { createAppRouter } from "@/router";

type FakeData = Omit<ComponentProps<typeof FakeHabitDataProvider>, "children">;

/**
 * Renders the whole app at `path`, with a memory history in place of the browser's, on the
 * in-memory data provider (the demo data unless `data.initial` says otherwise). `override` replaces
 * parts of what the provider gives, for a state that the fake cannot reach, such as the owner
 * signed in before the data comes.
 */
export function renderApp(
  path = "/",
  data: FakeData = {},
  override: Partial<HabitDataApi> | null = null,
) {
  const router = createAppRouter(createMemoryHistory({ initialEntries: [path] }));
  const app = <RouterProvider router={router} />;
  return {
    router,
    ...render(
      <FakeHabitDataProvider {...data}>
        {override === null ? app : <Override value={override}>{app}</Override>}
      </FakeHabitDataProvider>,
    ),
  };
}

function Override({ value, children }: { value: Partial<HabitDataApi>; children: ReactNode }) {
  const api = useContext(HabitDataContext);
  if (api === null) throw new Error("Override: no data provider");
  return (
    <HabitDataContext.Provider value={{ ...api, ...value }}>{children}</HabitDataContext.Provider>
  );
}
