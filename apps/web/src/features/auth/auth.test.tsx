import { FAKE_EMAIL_CODE, FAKE_STRANGER_ID } from "@habit/data/testing";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import { expect, test } from "vite-plus/test";

import { deploymentName, ownerCommand } from "@/features/auth/owner-command";
import { renderApp } from "@/test/render-app";

test("while the sign-in loads, neither the list nor the sign-in shows", async () => {
  renderApp("/", { auth: "loading" });

  expect((await screen.findByRole("status")).textContent).toBe("Loading");
  expect(screen.queryByRole("button", { name: "Continue with Google" })).toBeNull();
  expect(screen.queryByRole("heading", { name: "Habits" })).toBeNull();
});

test("signed out, the sign-in screen offers Google, and the sign-in opens the list", async () => {
  renderApp("/", { auth: "signedOut" });

  const google = await screen.findByRole("button", { name: "Continue with Google" });
  expect(screen.queryByRole("heading", { name: "Habits" })).toBeNull();
  fireEvent.click(google);
  expect(await screen.findByRole("heading", { name: "Habits" })).toBeTruthy();
});

test("in development, an email code signs in, and a wrong code says so", async () => {
  renderApp("/", { auth: "signedOut" });

  fireEvent.click(await screen.findByRole("button", { name: "Sign in with an email code" }));
  fireEvent.change(screen.getByLabelText("Email"), {
    target: { value: "habit-owner+clerk_test@example.com" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Send code" }));

  const code = await screen.findByLabelText("Code");
  fireEvent.change(code, { target: { value: "111111" } });
  fireEvent.click(screen.getByRole("button", { name: "Sign in" }));
  expect((await screen.findByRole("alert")).textContent).toBe("Incorrect code.");

  fireEvent.change(code, { target: { value: FAKE_EMAIL_CODE } });
  fireEvent.click(screen.getByRole("button", { name: "Sign in" }));
  expect(await screen.findByRole("heading", { name: "Habits" })).toBeTruthy();
});

test("without access, the screen shows the user id and the command, and signs out", async () => {
  renderApp("/", { auth: "noAccess" });

  expect(await screen.findByRole("heading", { name: "No access" })).toBeTruthy();
  expect(screen.getByText(FAKE_STRANGER_ID)).toBeTruthy();
  expect(screen.getByText(/OWNER_USER_IDS/).textContent).toContain(FAKE_STRANGER_ID);
  expect(screen.queryByRole("heading", { name: "Habits" })).toBeNull();

  fireEvent.click(screen.getByRole("button", { name: "Sign out" }));
  await waitFor(() => screen.getByRole("button", { name: "Continue with Google" }));
});

test("the command names the deployment of the Convex URL and keeps the test owner", () => {
  const deployment = deploymentName("https://fantastic-chihuahua-570.convex.cloud");
  expect(deployment).toBe("fantastic-chihuahua-570");
  expect(deploymentName("not a url")).toBeNull();
  expect(ownerCommand("user_new", deployment)).toBe(
    'vp -C packages/data exec convex env set --deployment fantastic-chihuahua-570 OWNER_USER_IDS "user_3L3tBtYfJHjf9ZrdScO5oy8SQwe,user_new"',
  );
});
