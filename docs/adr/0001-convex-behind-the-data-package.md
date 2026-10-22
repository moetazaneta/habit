# Convex is the only backend, and only @habit/data knows it

The app needs instant writes, live updates between the phone and the desktop, a Clerk sign-in, and
a Node client for a later terminal UI, with little operations work. Convex gives all of these, is
generally available and is free at this size, so v1 uses Convex and no second backend. Only the
`@habit/data` package imports Convex: it holds the Convex functions and exports React hooks that
return the types of `@habit/core`. The apps and `@habit/core` never import Convex.

## Considered Options

- **PowerSync on Supabase Postgres**: the only mature option with durable offline writes. Rejected
  for v1: two services, sync rules and a separate write path, for an offline mode that is "nice to
  have".
- **Turso with our own API (Hono, Drizzle)**: the least lock-in. Rejected: we must write the
  optimistic updates and the live updates ourselves, and Turso Sync is in beta.
- **Two backends behind one interface from the start** (Convex and Turso, or Convex and an
  in-memory fake): rejected as too much abstraction for an app with one user.

## Consequences

- A move to another backend means a new `@habit/data` with the same hooks. The screens and
  `@habit/core` do not change. The move is easier, but not free: the Convex functions, the schema
  and the auth wiring get a rewrite.
- The client cache of Convex is the store. There is no TanStack Query and no separate store for
  server data.
- Convex has no offline mode. [ADR 0002](./0002-offline-ready-writes.md) keeps an offline mode
  possible later.
