import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import { afterEach, expect, test } from "vite-plus/test";

import { WIDE_QUERY } from "@/components/use-media-query";
import { renderApp } from "@/test/render-app";

const phoneMatchMedia = window.matchMedia;

afterEach(() => {
  window.matchMedia = phoneMatchMedia;
});

/** A desktop window: the wide layout matches, every other query (dark, reduced motion) does not. */
function desktop() {
  window.matchMedia = (query: string) =>
    Object.assign(phoneMatchMedia(query), { matches: query === WIDE_QUERY });
}

async function openHabit(name: string) {
  fireEvent.click(await screen.findByRole("link", { name: new RegExp(name) }));
  return screen.findByRole("heading", { level: 1, name });
}

test("on a desktop, the page of a habit opens beside the list", async () => {
  desktop();
  renderApp("/");

  await openHabit("Meditate");

  const list = screen.getByRole("navigation", { name: "Habits" });
  const row = within(list).getByRole("link", { name: /Meditate/ });
  expect(row.getAttribute("aria-current")).toBe("page");
  expect(within(list).getByRole("group", { name: "Water" })).toBeTruthy();
});

test("on a desktop, another habit's page takes the place of the open one, so Back returns to the list", async () => {
  desktop();
  const { router } = renderApp("/");

  await openHabit("Meditate");
  await openHabit("Water");
  fireEvent.click(screen.getByRole("link", { name: "Back to habits" }));

  await waitFor(() => expect(router.state.location.pathname).toBe("/"));
  expect(screen.queryByRole("heading", { level: 1, name: "Water" })).toBeNull();
  expect(screen.queryByRole("navigation", { name: "Habits" })).toBeNull();
});

test("on a phone, the page of a habit takes the place of the list", async () => {
  renderApp("/");

  await openHabit("Meditate");

  expect(screen.queryByRole("navigation", { name: "Habits" })).toBeNull();
  expect(screen.queryByRole("group", { name: "Water" })).toBeNull();
});
