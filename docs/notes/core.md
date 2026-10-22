# Notes of the core milestone

## What exists

- **`@habit/core`** (`packages/core`): every function of the contract has its implementation and
  its tests. `notImplemented` is gone. New dependencies, pinned in the catalog:
  `fractional-indexing` 4.0.0 (`orderBetween`) and `uuid` 14.0.3 (`newId`, UUIDv7).
- **`@habit/data/testing`** (`packages/data/src/testing`):
  - `FakeHabitDataProvider`: an in-memory `HabitDataApi` for tests and for UI work
    (`VITE_HABIT_DATA=fake`).
  - `demoState(today)`: the 11 habits of the design sketches with 30 Days of Entries.
  - `demoHabitIds`: the fixed ids of the demo habits (`demoHabitIds.water`, …), for tests and links.
  - `FAKE_OWNER_ID`, `FAKE_STRANGER_ID`: the user ids of the fake sign-in.

## The contract additions

- **`lastOrder(state)`**: the largest `order` of all Habits, also the deleted ones. Give it to
  `createHabit` as `lastOrder`. A new Habit then never gets the order of a deleted Habit that a
  restore brings back.

## The contract change

- `paintAction` has an optional fifth parameter, `current`: the function that `useEntries`
  returns. With it, the Days that already have the state of the paint are skipped, as the doc
  comment says. Without it (the old four-argument call), paintAction can only skip the future
  Days. Pass it: the count of the undo toast ("Painted 3 days") is `actions.length` of the batch.

## Rules that the doc comments did not fix

The doc comments in `packages/core/src` say each of these too.

- **The Day math runs on UTC dates**, so a local clock change cannot skip or repeat a Day. The core
  tests run in `America/Santiago` (set in `packages/core/vite.config.ts`), where the clocks change
  at midnight, to catch that bug.
- **`applyAction` returns the same state object for an Action that changes nothing**: an Entry write
  (set or clear) for an unknown or deleted Habit, a value of another Kind than the Habit's, a value
  that is already there, a clear of a Day without an Entry, a create of an id that exists, and an
  update, move, delete or restore that leaves each field as it was. The inverse of such an Action
  is an empty batch.
- **A clearEntry for a deleted Habit is ignored**, as a setEntry is. So an Entry of a deleted Habit
  cannot change until the Habit is restored.
- **An update can change a deleted Habit**; a restore then shows the new fields.
- **The inverse of a create is a delete** (a soft delete), and its inverse is a restore.
- **The inverse of a batch is flat:** it holds no batches, also for nested batches. The Convex
  validator of an Action allows no nested batches.
- **`createHabit` copies only the fields of a Habit of the draft's Kind.** A form that changed the
  Kind can leave a `unit` in a check draft; the Convex validators would reject it.
- **`updateHabit` ignores the fields of another Kind** (a `unit` for a check Habit). `null` removes
  `unit` or `target`; `undefined` keeps them.
- **`createHabit` trims the name and the description; an update does not.** In the edit form each
  key press applies at once, so a trim would remove the space that the person just typed. The edit
  form trims when the field loses focus, if it wants to.
- **A number tap adds the Step without a binary rounding error:** 0.2 + 0.1 is 0.3. A value of
  another Kind counts as 0.
- **`paintAction` writes each Day once**, also when the finger passes it two times, and gives an
  empty batch for a Habit that is not a check Habit.
- **Intensity:** a scale Option that is not in the list counts as the first one (the lightest). A
  value of another Kind than the Habit's is 0. A number without a Target, or with a Target that is
  not above 0, is full for any value above 0.
- **`validateHabitDraft`:** the 60 characters of the name are the characters that a person sees
  (`Intl.Segmenter`), so an emoji counts as one. The labels of the Options are unique without
  regard to case and spaces. Retired Options are not counted and not checked: a retired "Legs" and
  an offered "Legs" can exist together. Each issue is listed once.
- **`orderBetween`** sorts by a plain comparison of the text (`<`), not `localeCompare`;
  `visibleHabits` sorts the same way. For two neighbours with the same key (two devices created a
  Habit at the same time), it gives a key after both, because there is no key between them. A
  deleted Habit keeps its order, so a restore puts it back in its old place.
- **`liveWindow(end, 13)` holds `gridWeeks(end, 52)`.** A grid of 53 columns can start up to 5 Days
  before the window: the habit page then needs `useMonth` for the month before the window.

## The fake provider

- It keeps the confirmed state and the list of pending writes, and shows the pending writes over
  the confirmed state, as an optimistic update does. A failed write (`failWrites`) goes away after
  `latencyMs` without undoing the writes after it, and its `done` rejects. `done` has a catch
  handler of its own, so a caller that ignores it gets no unhandled rejection.
- Until the person is signed in as the owner there is no data: `source: "none"` and an empty state,
  as with the real provider. `signIn` (from signedOut) and `signOut` work. A change of the `auth`
  prop changes the state of the sign-in.
- New optional prop `today`: the Day of the live window and of the demo data. Use it in tests, so
  that the data does not change with the date.
- `retainMonth` does nothing and `monthStatus` is always "ready": all data is in memory.

## The demo data

- The last 5 Days are those of the brief. The 25 Days before them come from a random number
  generator with a fixed seed, so `demoState(today)` is the same for the same `today`. The data
  is plausible: the gym follows a weekly plan (legs on Monday, push on Wednesday, pull on Friday,
  cardio on Saturday), smoking goes down over the month, and so on.
- Every timestamp is 40 days before `today`, so a real write is always newer.
- Smoking and Coffee have no unit, as in the brief. The Options of Gym and Mood have emojis.
- **Spanish is `sky`, as the brief says.** The chosen sketch (`r3-color-icons.html`) draws it in
  olive (`#9fb878`). If olive is right, change the `color` of Spanish in `demoState.ts`.

## For the other threads

- The data thread flattens nested batches before it sends them (the Convex validator is not
  recursive). `paintAction` gives a flat batch.
- `validateHabitDraft` uses `Intl.Segmenter` where it exists, and counts code points where it
  does not.

## Open questions for the owner

None of these block the build.

- **A scale whose last Option is retired never fills a square again.** The Intensity counts the
  retired Options, as the contract says ("a retired Option keeps its position"). For example, with
  Low, Okay, Good and a retired Great, a new Entry fills a square to 75% at most. The other choice:
  when the last Options are retired, count only up to the last Option that is offered. Then the
  old Entries of a retired Great are above 100%, so they show full too.
- Spanish: `sky` or olive, see "The demo data".
