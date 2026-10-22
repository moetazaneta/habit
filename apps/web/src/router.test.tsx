import { screen } from "@testing-library/react";
import { expect, test } from "vite-plus/test";

import { renderApp } from "@/test/render-app";

test("the home page shows the app's name", async () => {
  renderApp("/");

  expect(await screen.findByRole("heading", { name: "Habit" })).toBeTruthy();
});
