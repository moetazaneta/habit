import { createRootRoute, Outlet } from "@tanstack/react-router";

import { validateSheetSearch } from "@/components/sheet-search";
import { AppToaster } from "@/components/toast";
import { EntryInputSheet } from "@/features/entry-input";
import { HabitFormSheet } from "@/features/habit-form";

export const Route = createRootRoute({
  // The sheets are search params on any route (`?new`, `?edit`, `?entry`), so they open over the
  // list and over the habit page, and the back gesture closes them.
  validateSearch: validateSheetSearch,
  component: Root,
});

function Root() {
  return (
    <>
      <Outlet />
      <HabitFormSheet />
      <EntryInputSheet />
      <AppToaster />
    </>
  );
}
