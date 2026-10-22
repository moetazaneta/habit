# Writes are idempotent and ready for offline sync

v1 is online-first, but a later offline mode must not need a data migration. So the data model
obeys four rules from the start:

1. The client makes the ID of each habit (a UUIDv7). This ID, not the Convex `_id`, is the
   identity of the habit.
2. The client sends the new value: `setEntry(habit, day, value)` and `clearEntry(habit, day)`.
   There is no `toggle`, because a toggle that a queue sends two times reverses itself.
3. Each row has an `updatedAt`, and the last write wins.
4. A delete is soft: the row gets a `deletedAt`.

## Consequences

- The habit and the Day identify an Entry, so two writes for the same Day merge by `updatedAt`
  and need no other conflict resolution.
- Each user action has a simple inverse: the previous value, or the restore of a deleted habit.
  The undo toast of v1 uses this, and a Cmd+Z history in v2 can use it too.
- A cached snapshot and a durable queue of writes can come later without a change to the server.
