# Notes of the integration milestone

The app on the real backend, end to end: the sign-in, the "no access" screen, the real provider in
the dev server, an end-to-end check, and the finish review across the screens.

## How the owner runs it in the morning

1. `git pull`, then `vp install`.
2. `vp dev`, and open the address that it prints. The dev server now uses the real backend (the
   Convex dev deployment and the Clerk development instance). No `.env.local` is necessary.
3. Sign in with Google. The "no access" screen shows your Clerk user id and the command that adds
   it. Copy the command, run it from the repository root, and reload the page.
4. For the demo data without a backend: `VITE_HABIT_DATA=fake vp dev`.

## What the owner must do by hand

- **Add your Clerk user id to the owners** (step 3 above). The screen gives the exact command:

  ```sh
  vp -C packages/data exec convex env set --deployment fantastic-chihuahua-570 OWNER_USER_IDS "user_3L3tBtYfJHjf9ZrdScO5oy8SQwe,<your user id>"
  ```

- Nothing else for development. Production is not made (by the rules of this build): see
  `docs/notes/data.md`.

## What works end to end

Checked on the real backend in Google Chrome at 390×844, by `apps/web/e2e/real-backend.ts`. The
last run passed every check.

- Signed out: the sign-in screen. The email code signs in the owner test user.
- No habits: the create sheet opens by itself. A habit of each Kind (check, number with a unit and
  a Target, choice, scale, text) is created through the sheet.
- A tap on a check toggles the Day. A tap on a number adds its Step.
- A drag over four Days of a check habit paints them, "Painted 4 days" offers Undo, and Undo clears
  them.
- The input of a value: the long press on a number (a typed value and Enter), a pick of a choice,
  a pick of a scale, a note of a text habit.
- A reorder by a drag of the row.
- The habit page: a tap in the calendar, the previous Month, "Today", a Month in the grid.
- An edit of the name, then "Delete habit", then Undo: the habit comes back in its place.
- A reload with the socket of Convex cut off: the list comes from the snapshot (about 0.9 s on
  the dev server, with the values of the last session).
- A new browser and a new sign-in: the server kept each value and the order.
- The guest test user: "No access", the user id, the command with the guest's id, and the
  sign-out back to the sign-in screen.

## How to run the end-to-end check

```sh
vp -C apps/web run e2e
```

- It deletes the data of the owner test user first, starts its own dev server on port 5433 with
  `VITE_HABIT_DATA=convex`, and stops it at the end. It prints each step and each failure, and
  saves screenshots to `$TMPDIR/habit-e2e` (or `$E2E_SHOTS`).
- It needs the network, Google Chrome, and the login of the Convex CLI (for the reset). So it is an
  uncached task of its own, not a part of `vp run ready`, and CI does not run it.
- Options: `E2E_URL` (use a dev server that runs already), `E2E_PORT`, `E2E_HEADED=true` (show the
  browser), `E2E_CHROME` (the path of another Chrome or Chromium binary).

## What was built

- **`features/auth/`**: `AuthGate` in the root route maps each state of `useAuth()` to a screen.
  - `loading`: the bare ground, so a fast start shows no flash. After 700 ms the empty mark (five
    Day gauges) fades in, at the place where the sign-in screen draws it.
  - `signedOut`: the five gauges fill one after the other with the gauge's spring, then the name
    and one action, "Continue with Google". In development, "Sign in with an email code" opens a
    two-step form (email, then code) for the test users. No marketing copy.
  - `noAccess`: says so plainly, shows the Clerk user id and the command, each with a copy button,
    and "Sign out". The five gauges stay empty: this account has no data.
- **`@habit/data`**: `AuthState.signedOut` has an optional `emailCode` (`sendCode`, `verifyCode`).
  `HabitDataProvider` implements it with Clerk's `signIn.emailCode` and `finalize`. The fake
  provider accepts the code `424242` too (`FAKE_EMAIL_CODE`), and signs in an address that
  contains "guest" without access.
- **`apps/web/.env.development`**: `VITE_HABIT_DATA=convex` and the two public values of the dev
  backend.
- **`apps/web/e2e/real-backend.ts`** and the task `e2e`, with `playwright-core` (a dev dependency).

## Fixes in other areas

- **The drop of a reordered row opened its habit page** (list). A mouse drag that moved a row up
  ended with a click on the row's link. dnd-kit stops that click at the document for 50 ms, so
  React's handler never cancelled it, and the browser followed the link: a full page load. A
  capturing listener on the window now cancels it.
- Two skeleton tests (list, habit page) reached "no data" through the fake's "loading" sign-in.
  The gate now shows its own loading screen there, so the tests sign in and ask for no data.

## Assumptions

- **The email code is for development only.** The sign-in screen shows it when
  `import.meta.env.DEV` is true and the provider offers it. A production build shows Google only.
  The spec adds an email code later, if Google fails in an installed PWA (v2).
- **The command on the "no access" screen is the one of `docs/notes/data.md`**: it sets the owner
  list to the owner test user and the signed-in user. The deployment name comes from
  `VITE_CONVEX_URL`.
- **The owner has no sign-out in v1.** The spec has no settings screen. The guest gets a sign-out
  on the "no access" screen.
- **`.env.development` holds the public dev values**, so a new checkout runs `vp dev` without the
  copy of `.env.example`. `.env.local` still serves `vp build` and `vp preview`.

## Open questions and findings for the owner

- **A tap during the transition into the habit page is lost.** The list row grows into the page's
  title with a view transition of about 550 ms. Chrome sends each pointer event of that time to
  `<html>` (also with `::view-transition { pointer-events: none }`), so a quick tap on a Day of
  the calendar does nothing. The web-habit-page milestone added the transition; a shorter
  transition, or a way to replay the tap, is their call.
- **A flaky test of the habit page:** "a fast swipe on check Days moves to the previous Month and
  paints nothing" fails about one run in three of the full suite (`vp test`), and passes alone. After
  the swipe and "Next month", the October page stays hidden for more than 5 s. That can be a real
  state of the calendar (a page turn that interrupts the swipe's animation), not only a slow test.
  Left to the web-habit-page milestone.
- **The command on the "no access" screen shows to anyone who signs in.** Sign-up is open in Clerk
  (`docs/notes/data.md`). The command does nothing without the Convex login of the team, and the
  ids are not secret, but a stranger sees the deployment name. Restrict the sign-up in Clerk if
  that matters.
