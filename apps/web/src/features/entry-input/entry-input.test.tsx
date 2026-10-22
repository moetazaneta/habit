import { addDays, today as todayOf } from "@habit/core";
import { demoHabitIds } from "@habit/data/testing";
import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import { expect, test } from "vite-plus/test";

import { formatDayLong } from "@/components/format";
import { renderApp } from "@/test/render-app";

/** A square of the list. The open sheet is modal, so the list behind it is hidden from roles. */
async function square(name: string, index: number): Promise<HTMLElement> {
  const group = await screen.findByRole("group", { name, hidden: true });
  return within(group).getAllByRole("button", { hidden: true })[index]!;
}

test("a long press (or a right click) on a number square opens the exact value", async () => {
  const { router } = renderApp("/");

  fireEvent.contextMenu(await square("Water", 4));
  await waitFor(() =>
    expect(router.state.location.search).toMatchObject({
      entry: `${demoHabitIds.water}:${todayOf()}`,
    }),
  );
  expect(await screen.findByRole("textbox", { name: "Value in glasses" })).toBeTruthy();
});

test("the number input steps, sets the Target, and clears", async () => {
  const today = todayOf();
  renderApp(`/?entry=${demoHabitIds.water}:${today}`);

  const field = (await screen.findByRole("textbox", {
    name: "Value in glasses",
  })) as HTMLInputElement;
  expect(field.value).toBe("5");
  fireEvent.click(screen.getByRole("button", { name: "Add 1" }));
  expect(field.value).toBe("6");
  fireEvent.click(screen.getByRole("button", { name: "Subtract 1" }));
  fireEvent.click(screen.getByRole("button", { name: "Subtract 1" }));
  expect(field.value).toBe("4");
  fireEvent.click(screen.getByRole("button", { name: "= Target" }));
  expect(field.value).toBe("8");
  expect((await square("Water", 4)).getAttribute("aria-label")).toBe(
    `${formatDayLong(today)}: 8 of 8 glasses`,
  );
  fireEvent.click(screen.getByRole("button", { name: "Clear" }));
  expect(field.value).toBe("");
  expect((await square("Water", 4)).getAttribute("aria-label")).toBe(
    `${formatDayLong(today)}: no entry`,
  );
});

test("a typed value applies when the field loses focus", async () => {
  const yesterday = addDays(todayOf(), -1);
  renderApp(`/?entry=${demoHabitIds.water}:${yesterday}`);

  const field = await screen.findByRole("textbox", { name: "Value in glasses" });
  fireEvent.focus(field);
  fireEvent.change(field, { target: { value: "2.5" } });
  fireEvent.blur(field);
  expect((await square("Water", 3)).getAttribute("aria-label")).toBe(
    `${formatDayLong(yesterday)}: 2.5 of 8 glasses`,
  );
});

test("a note applies when the field loses focus, and an empty note clears the Day", async () => {
  const today = todayOf();
  renderApp(`/?entry=${demoHabitIds.journal}:${today}`);

  const field = await screen.findByRole("textbox", { name: "Journal, note" });
  fireEvent.focus(field);
  fireEvent.change(field, { target: { value: "A long walk" } });
  fireEvent.blur(field);
  expect((await square("Journal", 4)).getAttribute("aria-label")).toBe(
    `${formatDayLong(today)}: A long walk`,
  );
  fireEvent.focus(field);
  fireEvent.change(field, { target: { value: "  " } });
  fireEvent.blur(field);
  expect((await square("Journal", 4)).getAttribute("aria-label")).toBe(
    `${formatDayLong(today)}: no entry`,
  );
});

test("a link to an unknown habit closes the input", async () => {
  const { router } = renderApp(`/?entry=nope:${todayOf()}`);

  await waitFor(() => expect(router.state.location.search).not.toHaveProperty("entry"));
});
