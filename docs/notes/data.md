# Notes of the data milestone

## What the owner must do by hand

1. Start the app on the real backend (see "How to run against the real backend") and sign in with
   Google. The "no access" screen shows your Clerk user id (`user_…`).
2. Add your id to the owners. Run this from the repository root, after `git pull` and
   `vp install`. Keep the test user in the list, so that the automated checks still work:

   ```sh
   vp -C packages/data exec convex env set --deployment fantastic-chihuahua-570 OWNER_USER_IDS "user_3L3tBtYfJHjf9ZrdScO5oy8SQwe,<your user id>"
   ```

3. Reload the app.

Nothing else is necessary for development. For production (not made, by the rules of this build):
a Convex production deployment, a Clerk production instance with your own Google OAuth
credentials, the JWT template `convex` there, and the same two Convex environment variables.

## What exists

- **Convex project `habit`** (team `artem-sotnichenko`), dev deployment `fantastic-chihuahua-570`:
  `https://fantastic-chihuahua-570.convex.cloud`. No production deployment.
- **Clerk application "Habit"** (`app_3L3snoqwY6wUeLUkz1D5A73xZPU`), development instance only.
  Frontend API: `https://pleased-antelope-7833.clerk.accounts.dev`.
  - Sign-in: Google (Clerk's shared development credentials) and an email code. Passwords are off.
    Sign-up is open: anyone can sign in, but only an owner gets data.
  - The JWT template `convex` (`aud: "convex"`), which `ConvexProviderWithClerk` asks for.
  - Two test users. Their email addresses contain `+clerk_test`, so Clerk accepts the code `424242`
    and sends no email:
    - `habit-owner+clerk_test@example.com` (`user_3L3tBtYfJHjf9ZrdScO5oy8SQwe`): an owner.
    - `habit-guest+clerk_test@example.com` (`user_3L3tCVeHPMmD1xWFdL7i6Hk19qh`): not an owner, to
      see the "no access" screen.
- **Convex environment variables:** `CLERK_JWT_ISSUER_DOMAIN` (the Frontend API above) and
  `OWNER_USER_IDS` (comma-separated Clerk user ids; now the owner test user only).

## The code

- `packages/data/convex/`: the Convex functions.
  - `schema.ts`: the tables `habits` (by `userId` + `id`) and `entries` (by `userId` + `day`, and
    by `userId` + `habitId` + `day`). Each row has `userId`, `updatedAt` and a soft `deletedAt`.
  - `functions.ts`: `authQuery` and `authMutation` (custom functions of `convex-helpers`). They
    reject a caller who is not signed in (`unauthenticated`) or not in `OWNER_USER_IDS`
    (`forbidden`).
  - `users.ts`: `users.me` returns `{ userId, isOwner }`, or null when nobody is signed in.
  - `data.ts`: `data.days` (all Habits and the Entries between two Days), `data.month` (the
    Entries of one older Month) and `data.perform` (one Action, with `applyAction` of
    `@habit/core` and last-write-wins by `updatedAt`). The Convex bundler bundles `@habit/core`
    from its TypeScript source without extra settings.
  - `admin.ts`: `admin.deleteUserData`, an internal mutation that deletes all rows of one user.
  - The tests (`*.test.ts`) use `convex-test`.
- `packages/data/src/`: the client.
  - `HabitDataProvider.tsx`: `ClerkProvider`, `ConvexProviderWithClerk`, the subscriptions and the
    mutation with its optimistic update.
  - `engine.ts`: the part without Convex and Clerk, with its own tests: the auth state, the source
    of the data, the snapshot and the queue of the taps before the live data.
  - `optimistic.ts`, `snapshot.ts`, `state.ts`: the optimistic update, the IndexedDB snapshot and
    the conversions between query results and `HabitState`.

## How to run against the real backend

- `apps/web/.env.local` (git-ignored) has `VITE_CONVEX_URL` and `VITE_CLERK_PUBLISHABLE_KEY`.
  `apps/web/.env.example` has the same values: both are public. In a new checkout:
  `cp apps/web/.env.example apps/web/.env.local`.
- `apps/web/.env.development` sets `VITE_HABIT_DATA=fake`, and Vite ranks that file above
  `.env.local`. So, for the dev server on the real backend, set the variable in the shell:

  ```sh
  VITE_HABIT_DATA=convex vp dev
  ```

  `vp build` (production mode) does not read `.env.development`, so a build uses the real
  backend.
- `packages/data/.env.local` (git-ignored) has `CONVEX_DEPLOYMENT`, which the Convex CLI reads. To
  push changed functions to the dev deployment: `vp -C packages/data run convex:push` (once) or
  `vp -C packages/data run convex:dev` (watch). In a new checkout, the CLI asks to log in and to
  choose the project `habit`. **After a change in `packages/data/convex/` or in the parts of
  `@habit/core` that the functions use (`applyAction`, `parseDay`), push again**: the deployment
  does not update by itself.

## For the integration milestone

- `main.tsx` (web-list) already picks `HabitDataProvider` when `VITE_HABIT_DATA` is not `fake`.
- **Sign-in:** `auth.signIn()` in the `signedOut` state starts the Google flow (`signIn.sso` of
  Clerk) and comes back to the same page. For a new user (the owner's first sign-in), Clerk returns
  to `/sso-callback` to finish the sign-up. `HabitDataProvider` shows Clerk's handler at that path
  itself, so the router needs no route for it. The host must serve `index.html` for every path (the
  usual SPA rewrite on Vercel). If the Google flow cannot start, `signIn` falls back to Clerk's
  hosted sign-in page.
- **Automated sign-in** (Playwright, or a browser preview): there is no email form in the app. In
  the page, after Clerk loads, sign in with the email code of a test user:

  ```js
  const si = await Clerk.client.signIn.create({ identifier: "habit-owner+clerk_test@example.com" });
  const factor = si.supportedFirstFactors.find((f) => f.strategy === "email_code");
  await si.prepareFirstFactor({ strategy: "email_code", emailAddressId: factor.emailAddressId });
  const result = await si.attemptFirstFactor({ strategy: "email_code", code: "424242" });
  await Clerk.setActive({ session: result.createdSessionId });
  ```

  Use `habit-guest+clerk_test@example.com` for the "no access" screen.
- **Reset the test owner's data** before a check:

  ```sh
  vp -C packages/data exec convex run admin:deleteUserData '{"userId":"user_3L3tBtYfJHjf9ZrdScO5oy8SQwe"}'
  ```

- **Sign-out** goes to `/` (Clerk's `afterSignOutUrl`) with a page load, and clears the snapshot.
- `perform(...).done` rejects when the server rejects the write; Convex has already rolled the
  screen back by then. A `done` that nobody awaits does not log an unhandled rejection.

## What was checked against the real backend

With a small page (not committed) on the provider, and with a Node script on `ConvexHttpClient` and
Clerk session tokens of the test users:

- A signed-out user is `signedOut`; `signIn` opens Google's account chooser.
- The owner test user is `ready`, the data is `live` about 1 s after the sign-in.
- The guest test user is `noAccess` with the user id; `data.days` rejects the guest
  (`forbidden`).
- A new Habit and a tap show on screen at once, before the server confirms; a write that the
  server rejects shows, then rolls back, and `done` rejects.
- An older Month (`useMonth`) is `loading`, then `ready`.
- After a reload, the snapshot shows at about 0.5 s and the live data at about 1.5 s. A tap at the
  snapshot stage waits, goes to the server when the live data comes, and stays.
- Sign-out clears the snapshot.
- The web app of web-list runs on `HabitDataProvider` without errors.

## Assumptions

- The `userId` of each row is the Clerk user id (`identity.subject`), the same id that
  `OWNER_USER_IDS` lists and that the "no access" screen shows.
- The server takes the client's `now` as the `updatedAt` of a write, but never a time after the
  server's own clock, so a device with a wrong clock cannot lock a row for the others.
- The server does not lock future Days: it does not know the time zone of the person. The client
  locks them (`tapResult`, `paintAction`).
- `data.perform` ignores what `applyAction` ignores, such as an Entry of an unknown or deleted
  Habit, or a value of the wrong Kind. It rejects a Day that is not a real date (`badDay`).
- The live queries do not return the tombstones of cleared Entries: a client that does not see an
  Entry treats it as empty, so the result is the same with less data.
- Convex validators cannot be recursive, so a `batch` Action holds only Actions that are not
  batches. `perform` flattens nested batches before it sends them.
- The snapshot holds the live window only (not the older Months), and it is saved 1 s after the
  live data last changed. Its schema version is `SNAPSHOT_VERSION` in `src/snapshot.ts`: increase
  it when the shape of `Habit` or `Entry` changes.
- Before `users.me` answers, a usable snapshot of the same user counts as "ready": a snapshot exists
  only for a user who was an owner. If the owner list changed since, the app switches to "no
  access" when `me` answers, and deletes the snapshot.
- The queries of the data start at the same time as `users.me`, not after it, to save one round
  trip. For a user who is not an owner, `data.days` fails and the provider ignores the error.
- An older Month stays loaded only while something retains it (`useMonth`). A Month that comes back
  into view loads again.
- `convex-helpers` 0.1.128 and `convex-test` 0.0.63, not the newest versions: the newest were
  younger than pnpm's minimum release age.
- esbuild (a dependency of the Convex CLI) may not run its install script: the platform package has
  the binary, and the CLI works without the script.

## Open questions for the owner

- Sign-up is open in Clerk: a stranger can make a Clerk account, but gets no data. Clerk can also
  restrict sign-ups to an allowlist of emails, if you prefer.
- The test users stay in the development instance and in `OWNER_USER_IDS`, for the automated
  checks. Remove the owner test user from `OWNER_USER_IDS` when you do not need the checks.
