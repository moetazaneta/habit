import { today } from "@habit/core";
import { HabitDataProvider } from "@habit/data";
import { RouterProvider } from "@tanstack/react-router";
import { StrictMode, type ReactNode } from "react";
import { createRoot } from "react-dom/client";

import { installCssSprings } from "@/components/motion";
import { createAppRouter } from "@/router";

import "@/styles.css";

type DataProvider = (props: { children: ReactNode }) => ReactNode;

/**
 * `VITE_HABIT_DATA=fake` runs the app on the in-memory provider with the demo data (the dev
 * default, in .env.development); otherwise the app uses the real backend. The fake provider loads
 * only in fake mode, so it never ships in a real build.
 */
async function loadDataProvider(): Promise<DataProvider> {
  if (import.meta.env.VITE_HABIT_DATA !== "fake") return HabitDataProvider;
  const { FakeHabitDataProvider, demoState } = await import("@habit/data/testing");
  // Dev only: `?data=worst` (or empty, one, many) swaps the demo data for a break-ui dataset.
  const dataset = import.meta.env.DEV
    ? new URLSearchParams(window.location.search).get("data")
    : null;
  if (dataset !== null) {
    const { devDataset, isDevDataset } = await import("@/components/dev-data/fixtures");
    const { DevDataToggle } = await import("@/components/dev-data/toggle");
    if (isDevDataset(dataset)) {
      const initial = devDataset(dataset, today());
      return ({ children }) => (
        <FakeHabitDataProvider initial={initial}>
          {children}
          <DevDataToggle current={dataset} />
        </FakeHabitDataProvider>
      );
    }
  }
  const initial = demoState(today());
  const latencyMs = Number(import.meta.env.VITE_HABIT_FAKE_LATENCY_MS ?? 0);
  const failWrites = import.meta.env.VITE_HABIT_FAKE_FAIL === "true";
  return ({ children }) => (
    <FakeHabitDataProvider initial={initial} latencyMs={latencyMs} failWrites={failWrites}>
      {children}
    </FakeHabitDataProvider>
  );
}

installCssSprings();

const Data = await loadDataProvider();
const router = createAppRouter();

const container = document.getElementById("root");
if (container === null) throw new Error("root-missing");

createRoot(container).render(
  <StrictMode>
    <Data>
      <RouterProvider router={router} />
    </Data>
  </StrictMode>,
);
