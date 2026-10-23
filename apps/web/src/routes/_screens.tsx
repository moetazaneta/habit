import { createFileRoute } from "@tanstack/react-router";

import { Screens } from "@/features/screens";

export const Route = createFileRoute("/_screens")({
  component: Screens,
});
