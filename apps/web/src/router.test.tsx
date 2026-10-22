import { screen } from "@testing-library/react";
import { expect, test } from "vite-plus/test";

import { renderApp } from "@/test/render-app";

test("the home page is the habit list", async () => {
  renderApp("/");

  expect(await screen.findByRole("heading", { name: "Habits" })).toBeTruthy();
});
