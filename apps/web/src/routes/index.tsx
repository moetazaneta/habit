import { createFileRoute } from "@tanstack/react-router";

import { HabitList } from "@/features/list/habit-list";

export const Route = createFileRoute("/")({
  component: HabitList,
});
