# Notes of the data milestone

## What exists

- **Convex project `habit`** (team `artem-sotnichenko`), dev deployment `fantastic-chihuahua-570`:
  `https://fantastic-chihuahua-570.convex.cloud`. No production deployment.
- **Clerk application "Habit"** (`app_3L3snoqwY6wUeLUkz1D5A73xZPU`), development instance only.
  Frontend API: `https://pleased-antelope-7833.clerk.accounts.dev`.
  - Sign-in: Google (Clerk's shared development credentials) and an email code. Passwords are off.
  - JWT template `convex` (`aud: "convex"`), which `ConvexProviderWithClerk` asks for.
  - Two test users. Their email addresses contain `+clerk_test`, so Clerk accepts the code `424242`
    and sends no email:
    - `habit-owner+clerk_test@example.com` (`user_3L3tBtYfJHjf9ZrdScO5oy8SQwe`): an owner.
    - `habit-guest+clerk_test@example.com` (`user_3L3tCVeHPMmD1xWFdL7i6Hk19qh`): not an owner, to
      see the "no access" screen.
- **Convex environment variables:** `CLERK_JWT_ISSUER_DOMAIN` (the Frontend API above) and
  `OWNER_USER_IDS` (comma-separated Clerk user ids; now the owner test user only).

## What the owner must do by hand

1. Sign in to the app with Google. The "no access" screen shows your Clerk user id (`user_…`).
2. Add the id to the owners. Keep the test user, so the automated checks still work:

   ```sh
   vp -C packages/data exec convex env set OWNER_USER_IDS "user_3L3tBtYfJHjf9ZrdScO5oy8SQwe,<your user id>"
   ```

3. Reload the app.

## How to run against the real backend

- `apps/web/.env.local` holds `VITE_CONVEX_URL` and `VITE_CLERK_PUBLISHABLE_KEY`;
  `apps/web/.env.example` has the same values (both are public).
- `packages/data/.env.local` (git-ignored) holds `CONVEX_DEPLOYMENT`, which the Convex CLI reads. To
  push changed functions: `vp -C packages/data run convex:push` (once) or
  `vp -C packages/data run convex:dev` (watch). In a new checkout, the CLI asks to log in and to
  choose the project `habit`.

## Assumptions

- The `userId` of each row is the Clerk user id (`identity.subject`), the same id that
  `OWNER_USER_IDS` lists and that the "no access" screen shows.
- The server takes the client's `now` as the `updatedAt` of a write, but never a time after the
  server's own clock, so a device with a wrong clock cannot lock a row for the others.
- The server does not lock future Days: it does not know the time zone of the person. The client
  locks them (`tapResult`, `paintAction`).
- The live queries do not return the tombstones of cleared Entries: a client that does not see an
  Entry treats it as empty, so the result is the same with less data.
- Convex validators cannot be recursive, so a `batch` Action holds only Actions that are not
  batches. The client flattens nested batches before it sends them.
- `convex-helpers` 0.1.128 and `convex-test` 0.0.63, not the newest versions: the newest were
  younger than pnpm's minimum release age.
- esbuild (a dependency of the Convex CLI) may not run its install script: the platform package has
  the binary, and the CLI works without the script.
