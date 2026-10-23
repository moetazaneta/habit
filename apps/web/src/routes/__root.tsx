import { createRootRoute, Outlet, useMatch } from "@tanstack/react-router";

import { validateSheetSearch } from "@/components/sheet-search";
import { AppToaster } from "@/components/toast";
import { AuthGate } from "@/features/auth/auth-gate";
import { EntryInputSheet } from "@/features/entry-input";
import { HabitFormSheet } from "@/features/habit-form";

export const Route = createRootRoute({
  // The sheets are search params on any route (`?new`, `?edit`, `?entry`), so they open over the
  // list and over the habit page, and the back gesture closes them.
  validateSearch: validateSheetSearch,
  component: Root,
});

function Root() {
  // The habit page's Back and Edit float at the bottom: its toasts show above them.
  const onHabitPage =
    useMatch({ from: "/_screens/habits/$habitId", shouldThrow: false }) !== undefined;
  return (
    <>
      {/* Only the owner gets the screens; the other states of the sign-in get their own. */}
      <AuthGate>
        <Outlet />
        <HabitFormSheet />
        <EntryInputSheet />
      </AuthGate>
      <AppToaster lift={onHabitPage ? "3.25rem" : undefined} />
    </>
  );
}
