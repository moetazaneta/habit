# Morning report: the overnight v1 build

All six milestones of `docs/build-plan.md` are on `main`, and CI is green. The orchestrator checked
`main` at 20:40 UTC on 2026-10-22:

- `vp install --frozen-lockfile && vp run ready`: pass. That is the static checks, 285 tests
  (core 150, data 70, web 65) and the build.
- `vp -C apps/web run e2e` on the real backend: all checks passed. The screenshots are in
  `/tmp/habit-e2e-orch`.

## Start the app

1. `git pull`, then `vp install`.
2. `vp dev`, then open the address that it prints. The dev server uses the real backend: the
   Convex dev deployment `fantastic-chihuahua-570` and the Clerk development instance "Habit".
3. Sign in with Google. The "no access" screen shows your Clerk user id and a command. Copy the
   command, run it from the repository root, then reload the page. The command is:

   ```sh
   vp -C packages/data exec convex env set --deployment fantastic-chihuahua-570 OWNER_USER_IDS "user_3L3tBtYfJHjf9ZrdScO5oy8SQwe,<your user id>"
   ```

   The first id is the owner test user of the end-to-end check. Keep it while you use the check.
4. To use the demo data without a backend: `VITE_HABIT_DATA=fake vp dev`.

## What works

- **Sign-in:** Google, and in development an email code for the test users. There is a "no
  access" screen for any account that is not an owner.
- **The habit list:**
  - The last 5 Days on a phone, and 7 on a wide screen.
  - Tap. Drag-to-paint, with Undo.
  - A long press on a number opens the exact value.
  - The input of a value for number, choice, scale and text habits.
  - Reorder by a long press and a drag.
  - The ghost "New habit" row.
  - The Days move at midnight.
  - The skeleton, and "Couldn't save" with Retry.
- **The habit page:**
  - The list row grows into the title.
  - A grid of the last 12 months: a tap on a month opens it in the calendar.
  - A calendar with one month on each page and a swipe between months.
  - Hold, then drag, to paint.
  - Older months load on request.
- **Create and edit:** a sheet on a phone and a dialog on a desktop, with a height morph between
  the steps. All five Kinds, Options that you can retire, and delete with Undo.
- **Data:**
  - Optimistic writes.
  - Last write wins.
  - Each action has an inverse, which undo uses.
  - The IndexedDB snapshot gives an instant start, also without the network.
  - Only an owner gets data.
- **Design:** the "Quiet standard, dark" world in both themes. It has IBM Plex Sans, squircle
  corners with a fallback, and the 16-color palette. `DESIGN.md` describes it.

## Check on a real phone

A desktop browser cannot show these items:

- The habit form with the keyboard open: the sticky "Next" or "Add habit" stays above the
  keyboard.
- A drag of an Option's handle inside the sheet.
- The emoji keyboard in an Option field.
- Haptics.
- Safari's back swipe from the left edge takes the swipe to the previous month. Start the swipe a
  little inside the screen.
- In Safari, the corners are plain rounded corners until Safari supports `corner-shape`.

## Open questions

The notes of each milestone in `docs/notes/` give the detail.

**Design:**
- The create dialog does not fit a 1280×800 window: the first step is about 200 px too tall.
  The integration notes give three possible fixes.
- On a phone, do you want full short month names on the habit page, instead of the first letter?
- On step 2 of the form, the back gesture closes the sheet. Do you want it to go back to step 1?
- Option labels have no length limit (names have 60). A limit of about 40 is possible.

**Data and rules:**
- The start waits for Clerk, about 0.6–0.9 s. A faster start can show the snapshot of the last
  user before the check of the user. That changes the rule in `docs/v1.md`.
- Retire is exact only within the loaded 13 months. A server query can make it exact.
- A scale whose last Option is retired never fills a square to 100% again. The core notes give
  the other choice.

**Access:**
- Sign-up in Clerk is open. A stranger gets no data, but sees the "no access" screen with the
  deployment name. Clerk can restrict sign-up to an allowlist of emails.
- Remove the owner test user from `OWNER_USER_IDS` when you do not need the end-to-end check.

**Performance:** the first load is about 205 KB of JavaScript (gzipped). A lazy load of more
parts can halve it.

## Not made, by the rules of the build

- Production deployments: Convex production, a Clerk production instance with your own Google
  OAuth credentials, and a host for the app.
- v2 items: archive, import and export, an installable PWA, and Cmd+Z.

## Where to look

- `docs/notes/<milestone>.md`: what each milestone built, and its assumptions.
- `DESIGN.md`: the design system, written from the built code.
- `docs/v1.md`, `docs/build-plan.md`, `PRODUCT.md`, `GLOSSARY.md`, `docs/adr/`: the spec and the
  decisions.
- The T3 threads M1 to M6: the full log of each milestone.
