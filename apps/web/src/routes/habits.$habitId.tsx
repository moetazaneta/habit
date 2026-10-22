import type { HabitId } from "@habit/core";
import { createFileRoute } from "@tanstack/react-router";

import { HabitPage } from "@/features/habit-page";

export const Route = createFileRoute("/habits/$habitId")({
  component: HabitRoute,
});

function HabitRoute() {
  const { habitId } = Route.useParams();
  // A new habit id is a new page: no state (the Month of the calendar) carries over.
  return <HabitPage key={habitId} habitId={habitId as HabitId} />;
}
