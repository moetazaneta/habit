import type { Action, Day, HabitState, Month } from "@habit/core";
import { invertAction, monthOf } from "@habit/core";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

import type { AuthState, HabitDataApi, PerformResult } from "./api";
import type { SnapshotStore } from "./snapshot";
import { SNAPSHOT_VERSION, usableSnapshot } from "./snapshot";
import type { Data, FlatAction } from "./state";
import { applySafely, flattenAction, stateOf, withEntries } from "./state";

/** What `users.me` returns for a signed-in user. */
export interface Me {
  userId: string;
  isOwner: boolean;
}

/** The time after the last change of the live data before the snapshot is saved. */
export const SNAPSHOT_SAVE_DELAY_MS = 1000;

/**
 * The status of the sign-in. The server's answer (`me`) decides between "ready" and "noAccess".
 * Before it comes, a usable snapshot of the same user counts as "ready": a snapshot exists only
 * for a user who was an owner, so the app can show it at once.
 */
export function authStatus(input: {
  clerkLoaded: boolean;
  /** The Clerk user id, or null when nobody is signed in. */
  userId: string | null;
  me: Me | undefined;
  hasSnapshot: boolean;
}): AuthState["status"] {
  if (!input.clerkLoaded) return "loading";
  if (input.userId === null) return "signedOut";
  if (input.me !== undefined && input.me.userId === input.userId) {
    return input.me.isOwner ? "ready" : "noAccess";
  }
  return input.hasSnapshot ? "ready" : "loading";
}

/** The inputs of the engine: what Clerk and Convex say, and how to write. */
export interface EngineInputs {
  clerkLoaded: boolean;
  userId: string | null;
  /** The answer of `users.me` for the signed-in user; undefined until it comes. */
  me: Me | undefined;
  /** The result of `data.days` for the live window; undefined until it comes. */
  live: Data | undefined;
  /**
   * True while `live` is the result of the previous window: the window moved to a new Day and the
   * new window has not loaded yet. Actions then wait in the queue, so that they show at once, also
   * on the new Day, which the previous result does not cover.
   */
  liveStale?: boolean;
  /** The results of `data.month` for the retained Months older than the live window. */
  months: ReadonlyMap<Month, Data>;
  window: { from: Day; to: Day };
  retainMonth: (month: Month) => () => void;
  /** Sends one Action to the server, with its optimistic update. Rejects when the write fails. */
  send: (action: FlatAction, now: number) => Promise<unknown>;
  signIn: () => void;
  signOut: () => Promise<unknown>;
  snapshots: SnapshotStore;
  /** The clock, in milliseconds since the epoch. Default `Date.now`. */
  clock?: () => number;
}

interface Pending {
  action: FlatAction;
  now: number;
  resolve: () => void;
  reject: (error: unknown) => void;
}

const EMPTY: HabitState = { habits: {}, entries: {} };

type Stored = { status: "loading" } | { status: "loaded"; value: unknown };

/**
 * The part of `HabitDataProvider` that does not know Convex or Clerk: the auth state, the source
 * of the data, the snapshot for an instant start, and the queue of the Actions that come before
 * the live data.
 */
export function useHabitDataEngine(inputs: EngineInputs): HabitDataApi {
  const { clerkLoaded, userId, me, live, months, window, retainMonth, snapshots } = inputs;
  const liveStale = inputs.liveStale ?? false;
  const clock = inputs.clock ?? Date.now;

  // The snapshot, read once at start.
  const [stored, setStored] = useState<Stored>({ status: "loading" });
  useEffect(() => {
    let active = true;
    void snapshots.load().then((value) => {
      if (active) setStored({ status: "loaded", value });
    });
    return () => {
      active = false;
    };
  }, [snapshots]);

  // The age of the snapshot counts at start: a snapshot on screen does not expire.
  const [startedAt] = useState(clock);
  const snapshot = useMemo(
    () =>
      userId !== null && stored.status === "loaded"
        ? usableSnapshot(stored.value, userId, startedAt)
        : null,
    [stored, userId, startedAt],
  );

  const status = authStatus({
    clerkLoaded,
    userId,
    me,
    hasSnapshot: snapshot !== null,
  });
  const signIn = inputs.signIn;
  const signOutInput = inputs.signOut;
  const signOut = useCallback(() => {
    void snapshots.clear().then(signOutInput);
  }, [snapshots, signOutInput]);

  const auth = useMemo<AuthState>(() => {
    if (status === "loading") return { status: "loading" };
    if (status === "signedOut") return { status: "signedOut", signIn };
    // userId is not null in the other statuses.
    const id = userId ?? "";
    return status === "noAccess"
      ? { status: "noAccess", userId: id, signOut }
      : { status: "ready", userId: id, signOut };
  }, [status, signIn, signOut, userId]);

  const source: HabitDataApi["source"] =
    auth.status !== "ready"
      ? "none"
      : live !== undefined
        ? "live"
        : snapshot !== null
          ? "snapshot"
          : "none";

  const monthEntries = useMemo(() => [...months.values()].map((data) => data.entries), [months]);
  const liveState = useMemo(
    () => (live === undefined ? undefined : stateOf(live.habits, live.entries, ...monthEntries)),
    [live, monthEntries],
  );
  const snapshotState = useMemo(
    () => (snapshot === null ? undefined : withEntries(snapshot.state, ...monthEntries)),
    [snapshot, monthEntries],
  );

  // The Actions that wait for the live data. They show on screen at once.
  const queueRef = useRef<Pending[]>([]);
  const [queued, setQueued] = useState<Pending[]>([]);

  const base =
    source === "live" && liveState !== undefined
      ? liveState
      : source === "snapshot" && snapshotState !== undefined
        ? snapshotState
        : EMPTY;
  const state = useMemo(
    () => queued.reduce((s, item) => applySafely(s, item.action, item.now), base),
    [base, queued],
  );

  // `perform` reads the latest values through refs, so that its identity never changes.
  const stateRef = useRef(state);
  // Actions go to the server at once only when the data on screen is the current live data.
  const canSend = source === "live" && !liveStale;
  const canSendRef = useRef(canSend);
  const sendRef = useRef(inputs.send);
  const clockRef = useRef(clock);
  useLayoutEffect(() => {
    stateRef.current = state;
    canSendRef.current = canSend;
    sendRef.current = inputs.send;
    clockRef.current = clock;
  });

  const perform = useCallback((action: Action): PerformResult => {
    const flat = flattenAction(action);
    const before = stateRef.current;
    const inverse = invertAction(before, flat);
    const now = clockRef.current();
    // A second Action before the next render sees the first one.
    stateRef.current = applySafely(before, flat, now);

    let done: Promise<void>;
    if (canSendRef.current && queueRef.current.length === 0) {
      done = sendRef.current(flat, now).then(() => undefined);
    } else {
      done = new Promise<void>((resolve, reject) => {
        queueRef.current = [...queueRef.current, { action: flat, now, resolve, reject }];
      });
      setQueued(queueRef.current);
    }
    // The caller may ignore `done`; a failed write is then not an unhandled rejection.
    done.catch(() => {});
    return { inverse, done };
  }, []);

  // When the current live data comes, the queue goes to the server in order.
  useEffect(() => {
    if (!canSend || queueRef.current.length === 0) return;
    const items = queueRef.current;
    queueRef.current = [];
    setQueued([]);
    for (const item of items) {
      sendRef.current(item.action, item.now).then(() => item.resolve(), item.reject);
    }
  }, [canSend, queued]);

  // Without access, the queue fails and the snapshot goes away.
  const lostAccess = auth.status === "signedOut" || auth.status === "noAccess";
  useEffect(() => {
    if (!lostAccess) return;
    void snapshots.clear();
    setStored((current) =>
      current.status === "loaded" ? { status: "loaded", value: undefined } : current,
    );
    if (queueRef.current.length === 0) return;
    const items = queueRef.current;
    queueRef.current = [];
    setQueued([]);
    for (const item of items)
      item.reject(new Error("@habit/data: signed out before the live data came"));
  }, [lostAccess, snapshots, queued]);

  // The live data of the window becomes the snapshot of the next start.
  const readyUserId = auth.status === "ready" ? auth.userId : null;
  useEffect(() => {
    if (readyUserId === null || live === undefined) return;
    const timer = setTimeout(() => {
      void snapshots.save({
        version: SNAPSHOT_VERSION,
        userId: readyUserId,
        savedAt: clockRef.current(),
        state: stateOf(live.habits, live.entries),
      });
    }, SNAPSHOT_SAVE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [readyUserId, live, snapshots]);

  const firstLiveMonth = monthOf(window.from);
  const monthStatus = useCallback(
    (month: Month): "loading" | "ready" => {
      if (month >= firstLiveMonth) return source === "none" ? "loading" : "ready";
      return source !== "none" && months.has(month) ? "ready" : "loading";
    },
    [firstLiveMonth, source, months],
  );

  return useMemo<HabitDataApi>(
    () => ({ auth, source, state, window, retainMonth, monthStatus, perform }),
    [auth, source, state, window, retainMonth, monthStatus, perform],
  );
}
